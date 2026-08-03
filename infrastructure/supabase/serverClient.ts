import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Route Handler内で呼び出す。リクエストごとにCookieストアが変わるため、
// browserClient.tsのような単一インスタンスのシングルトンにできない（毎回生成する）。
export async function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error (
            "Supabaseの環境が設定されていません。（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY。.env.localを確認してください。）"
        );
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            },
        },
    });
}