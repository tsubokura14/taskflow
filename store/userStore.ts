import { create } from "zustand";
import { User } from "@/types";
import {
    SignUpInput,
    SignInInput,
    userApi } from "@/lib/user";

type UserStore = {
    currentUser: User | null;

    // --- 認証操作 ---
    initialize: () => Promise<void>;
    signUp: (input: SignUpInput) => Promise<void>;
    signIn: (input: SignInInput) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    currentUser: null,

    // --- 認証操作 ---
    initialize: async () => {
        try {
            const user = await userApi.getCurrentUser();
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signUp: async (input) => {
        try {
            const user = await userApi.signUp(input);
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signIn: async (input) => {
        try {
            const user = await userApi.signIn(input);
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    signOut: async () => {
        try {
            await userApi.signOut();
            set({ currentUser: null });
        } catch (error) {
            console.error(error);
        }
    },
}));
