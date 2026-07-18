import { create } from "zustand";
import { Workspace } from "@/types";
import * as workspaceApi from "@/lib/workspaces";

type WorkspaceStore = {
    workspaces: Workspace[];
    fetchWorkspace: () => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],

    fetchWorkspace: async () => {
        try {
            const workspaces = await workspaceApi.getWorkspaces();
            set({ workspaces });
        } catch (error) {
            console.error(error);
        }
    }
}));