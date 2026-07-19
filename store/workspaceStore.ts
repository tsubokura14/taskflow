import { create } from "zustand";
import { Workspace } from "@/types";
import * as workspaceApi from "@/lib/workspaces";

type WorkspaceStore = {
    workspaces: Workspace[];
    fetchWorkspaces: (workspaceId: string[]) => Promise<void>
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
    }
}));