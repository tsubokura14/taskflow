import { create } from "zustand";
import { Workspace } from "@/types";
import { workspaceApi } from "@/lib/workspaces";

type WorkspaceStore = {
    workspaces: Workspace[];
    fetchWorkspaces: (workspaceId: string[]) => Promise<void>
    currentWorkspaceId: string | null;
    setCurrentWorkspaceId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],

    fetchWorkspaces: async (workspaceIds) => {
        try {
            const workspaces = await workspaceApi.getWorkspaces(workspaceIds);
            set({ workspaces });
        } catch (error) {
            console.error(error);
        }
    },

    currentWorkspaceId: null,

    setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
}));