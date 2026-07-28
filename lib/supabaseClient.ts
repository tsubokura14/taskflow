// サーバーサイドで生成すると、セッション情報がモジュールスコープに
// 保持され全ユーザー間で共有されてしまうため、クライアント専用とする。
import "client-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Supabaseの環境変数が設定されていません（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）。.env.local を確認してください。"
    );
}

// タブ（＝JSランタイム）単位でモジュールキャッシュが分離されるため、
// このインスタンスもタブごとに1つだけ生成される。
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: "taskflow" },
});