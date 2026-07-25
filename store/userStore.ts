import { create } from "zustand";
import { User } from "@/types";
import {
    GetUserInput,
    CreateUserInput,
    UpdateUserInput,
    userApi } from "@/lib/user";

type UserStore = {
    currentUser: User | null;

    // --- DB操作 ---
    fetchUser: (input: GetUserInput) => Promise<void>;
    addUser: (input: CreateUserInput) => Promise<void>;
    editUser: (input: UpdateUserInput) => Promise<void>;
    removeUser: (id: string) => Promise<void>;

    // --- ログアウト ---
    logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    currentUser: null,

    // --- DB操作 ---
    fetchUser: async (input) => {
        try {
            const user = await userApi.getUser(input);
            set({ currentUser: user });
        } catch (error) {
            console.error(error);
        }
    },

    addUser: async (input) => {
        try {
            const newUser = await userApi.createUser(input);
            set({ currentUser: newUser });
        } catch (error) {
            console.error(error);
        }
    },

    editUser: async (input) => {
        try {
            const newUser = await userApi.updateUser(input);
            set((state) => state.currentUser?.id === input.id ? { currentUser: newUser } : {});
        } catch (error) {
            console.error(error);
        }
    },

    removeUser: async (id) => {
        try {
            await userApi.deleteUser(id);
            set((state) => state.currentUser?.id === id ? { currentUser: null } : {});
        } catch (error) {
            console.error(error);
        }
    },

    // --- ログアウト ---
    logout: () => set({ currentUser: null }),
}));
