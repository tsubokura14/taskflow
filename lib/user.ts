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
export type UserApi = {
    signUp: (input: SignUpInput) => Promise<User>;
    signIn: (input: SignInInput) => Promise<User>;
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
const supabaseUserApi = {
    signUp: async (input: SignUpInput) => {
        const { data, error } = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: { data: { name: input.name } },
        });

        if (error) throw new UserDbError(error);
        if (!data.user) throw new UserDbError();

        // taskflow.profile は auth.users への insert トリガー（on_auth_user_created）で自動作成される
        const profile = await fetchProfile(data.user.id);

        return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: profile.name,
        };
    },

    signIn: async (input: SignInInput) => {
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
} satisfies UserApi;

export const userApi = supabaseUserApi;
