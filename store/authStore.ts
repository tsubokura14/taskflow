import { create } from "zustand";
import { User } from "@/types";
import {
    SignUpInput,
    SignInInput,
    authApi } from "@/lib/auth";

// 未確認・確認中 | 認証済み | 未ログイン（確認済み）
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
    currentUser: User | null;
    authStatus: AuthStatus;

    initialize: () => Promise<void>;
    signUp: (input: SignUpInput) => Promise<void>;
    signIn: (input: SignInInput) => Promise<void>;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    currentUser: null,
    authStatus: "loading",

    // 起動時にAuthInitializerから自動実行されるため、失敗してもログのみに留める。
    initialize: async () => {
        try {
            const user = await authApi.getCurrentUser();
            set({ currentUser: user, authStatus: user ? "authenticated" : "unauthenticated" });
        } catch (error) {
            console.error(error);
            set({ authStatus: "unauthenticated" })
        } 
    },

    // 以下はユーザー操作起点。失敗時は例外をそのまま呼び出し元に伝播させ、
    // 呼び出し元（コンポーネント）でtry/catchしてtoast表示する設計とする
    signUp: async (input) => {
        const user = await authApi.signUp(input);
        set({ currentUser: user, authStatus: "authenticated" });
    },
    signIn: async (input) => {
        const user = await authApi.signIn(input);
        set({ currentUser: user, authStatus: "authenticated" });
    },
    signInAsGuest: async () => {
        const user = await authApi.signInAsGuest();
        set({ currentUser: user, authStatus: "authenticated" });
    },
    signOut: async () => {
        await authApi.signOut();
        set({ currentUser: null, authStatus: "unauthenticated" });
    },
}));
