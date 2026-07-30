import { create } from "zustand";
import { User } from "@/types";
import {
    SignUpInput,
    SignInInput,
    authApi } from "@/lib/auth";

type AuthStore = {
    currentUser: User | null;

    // --- 認証操作 ---
    initialize: () => Promise<void>;
    signUp: (input: SignUpInput) => Promise<void>;
    signIn: (input: SignInInput) => Promise<void>;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    currentUser: null,

    // --- 認証操作 ---
    initialize: async () => {
        try {
            const user = await authApi.getCurrentUser();
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signUp: async (input) => {
        try {
            const user = await authApi.signUp(input);
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signIn: async (input) => {
        try {
            const user = await authApi.signIn(input);
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signInAsGuest: async () => {
        try {
            const user = await authApi.signInAsGuest();
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signOut: async () => {
        try {
            await authApi.signOut();
            set({ currentUser: null });
        } catch (error) {
            console.error(error);
        }
    },
}));
