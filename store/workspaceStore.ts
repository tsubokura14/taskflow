import { create } from "zustand";
import { Workspace } from "@/types";
import * as workspaceApi from "@/lib/workspaces";

type WorkspaceStore = {
    workspaces: Workspace[];
    fetchWorkspaces: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],

    fetchWorkspaces: async () => {
        try {
            const workspaces = await workspaceApi.getWorkspaces();
            set({ workspaces });
        } catch (error) {
            console.error(error);
        }
    }
}));