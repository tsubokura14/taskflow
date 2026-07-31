import { User } from "@/types";

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