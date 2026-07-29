import { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { UserDbError } from "@/lib/errors";

// --- ports ---
export type SignUpInput = {
    email: string;
    password: string;
    name: string;
}
export type SignInInput = {
    email: string;
    password: string;
}

/** taskflow.profile から受け取る型 */
type ProfileRow = {
    id: string;
    name: string;
}

/**
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type AuthApi = {
    signUp: (input: SignUpInput) => Promise<User>;
    signIn: (input: SignInInput) => Promise<User>;
    signInAsGuest: () => Promise<User>;
    signOut: () => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
};

async function fetchProfile(id: string): Promise<ProfileRow> {
    const { data, error } = await supabase
        .from("profile")
        .select("id, name")
        .eq("id", id)
        .single();

    if (error) throw new UserDbError(error);
    return data as ProfileRow;
}

// --- 本番環境・Adapters ---
const supabaseAuthApi = {
    signUp: async (input: SignUpInput) => {
        const { data, error } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: { data: { name: input.name }},
        })

        if (error) throw new UserDbError(error);
        if (!data.user) throw new UserDbError();

        // taskflow.profile は auth.users への insert トリガーで自動作成されるが、
        // メール確認が有効な場合はここでまだセッションが確立されておらず
        // authenticated専用のprofileをselectできないため、fetchProfileは呼ばずinput.nameをそのまま使う
        return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: input.name,
        };
    },

    signIn: async (input: SignInInput) => {
        // 1. 内部でGoTrue（Auth専用サーバー）へ `POST /auth/v1/token?grant_type=password` を送り、
        //    `auth.users` のパスワードハッシュと照合する。
        // 2. 認証成功時、GoTrueは `access_token`（JWT。`sub`=`auth.uid()`, `role: "authenticated"`, 有効期限などのクレームを含む）と
        //    `refresh_token` を返す。
        // 3. awaitが返るより前に、supabase-js内部でこのセッションをlocalStorageへ永続化し、
        //    クライアントのメモリ内状態も更新する（自動リフレッシュのタイマー設定もここで行われる）。
        // 4. その後で初めて `{ data, error }` としてこの関数にPromiseが解決される。
        const { data, error } = await supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
        });

        if (error) throw new UserDbError(error);

        const profile = await fetchProfile(data.user.id);

        return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: profile.name,
        };
    },

    signInAsGuest: async () => {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw new UserDbError(error);
        if (!data.user) throw new UserDbError(error);

        // トリガーが 'guest-xxxxxxxx' という名前で自動生成したprofileを取得
        const profile = await fetchProfile(data.user.id)
        
        return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: profile.name,
        };
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw new UserDbError(error);
    },

    getCurrentUser: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) return null;

        const profile = await fetchProfile(data.user.id);

        return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: profile.name,
        };
    },
} satisfies AuthApi;

export const authApi = supabaseAuthApi;
