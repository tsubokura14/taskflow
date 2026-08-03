import "server-only";
import { createSupabaseClient } from "@/infrastructure/supabase/serverClient";
import { UnauthorizedError } from "./errors";

export type AuthenticatedActor = {
    id: string;
};

// 全Route Handlerがこの関数を経由することを想定。
// getSession()ではなくgetUser()を使うのが重要：
// getSession()はCookie内のJWTをその場でデコードするだけで、改ざん検知のためのサーバー再研修を行わない。
// getUser()はSupabase Authサーバーに問い合わせて検証するために、認可の判断材料として安全に使える。
export async function requireAuthenticatedActor(): Promise<AuthenticatedActor> {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new UnauthorizedError();
    }

    return { id: user.id };
}