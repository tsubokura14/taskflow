import { create } from "zustand";

export type ToastStatus = "success" | "error" | "warning" | "info";

type ToastInput = Omit<ToastItem, "id">;

// Port
export type ToastItem = {
    id: string;
    status: ToastStatus;
    text: string;
}

type ToastStore = {
    toastItems: ToastItem[];
    openToast: (items: ToastInput[]) => void;
    closeToast: (id: string) => void;
}

// Adapter
export const useToastStore = create<ToastStore> ((set, get) => ({
    toastItems: [],

    openToast: (items: ToastInput[]) => {
        const newItems = items.map((item) => ({ id: crypto.randomUUID(), ...item }));
        set((state) => ({ toastItems: [...state.toastItems, ...newItems]}));
    },

    closeToast: (id) => {
        set((state) => ({ toastItems: state.toastItems.filter((item) => item.id !== id) }));
    }
}));