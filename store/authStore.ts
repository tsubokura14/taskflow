import { create } from "zustand";
import { User } from "@/types";
import {
    SignUpInput,
    SignInInput,
    authApi } from "@/lib/auth";

type AuthStore = {
    currentUser: User | null;

    initialize: () => Promise<void>;
    signUp: (input: SignUpInput) => Promise<void>;
    signIn: (input: SignInInput) => Promise<void>;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    currentUser: null,

    // 起動時にAuthInitializerから自動実行されるため、失敗してもログのみに留める。
    initialize: async () => {
        try {
            const user = await authApi.getCurrentUser();
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    // 以下はユーザー操作起点。失敗時は例外をそのまま呼び出し元に伝播させ、
    // 呼び出し元（コンポーネント）でtry/catchしてtoast表示する設計とする
    signUp: async (input) => {
        const user = await authApi.signUp(input);
        set({ currentUser: user });
    },
    signIn: async (input) => {
        const user = await authApi.signIn(input);
        set({ currentUser: user });
    },
    signInAsGuest: async () => {
        const user = await authApi.signInAsGuest();
        set({ currentUser: user });
    },
    signOut: async () => {
        await authApi.signOut();
        set({ currentUser: null });
    },
}));
