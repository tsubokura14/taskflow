import { create } from "zustand";
import { Workspace } from "@/types";
import { 
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    DeleteWorkspaceInput,
    workspaceApi } from "@/lib/workspaces";

type WorkspaceStore = {
    workspaces: Workspace[];

    // --- DB操作 ---
    fetchWorkspaces: (workspaceIds: string[]) => Promise<void>
    addWorkspace: (input: CreateWorkspaceInput) => Promise<void>;
    editWorkspace: (input: UpdateWorkspaceInput) => Promise<void>;
    removeWorkspace: (input: DeleteWorkspaceInput) => Promise<void>;

    // --- 画面情報 ---
    currentWorkspaceId: string | null;
    setCurrentWorkspaceId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],

    // --- DB操作 ---
    fetchWorkspaces: async (workspaceIds) => {
        try {
            const workspaces = await workspaceApi.getWorkspaces(workspaceIds);
            set({ workspaces });
        } catch (error) {
            console.error(error);
        }
    },

    addWorkspace: async (input) => {
        try {
            const newWorkspace = await workspaceApi.createWorkspace(input);
            set((state) => ({ workspaces: [ ...state.workspaces, newWorkspace ] }));
        } catch (error) {
            console.error(error);
        }
    },

    editWorkspace: async (input) => {
        try {
            const newWorkspace = await workspaceApi.updateWorkspace(input);
            set((state) => ({
                workspaces: state.workspaces
                    .map((workspace) => workspace.id === input.workspaceId ? newWorkspace : workspace)
            }));
        } catch (error) {
            console.error(error);
        }
    },

    removeWorkspace: async (input) => {
        try {
            await workspaceApi.deleteWorkspace(input);
            set((state) => ({
                workspaces: state.workspaces
                    .filter((workspace) => workspace.id !== input.workspaceId)
            }));
        } catch (error) {
            console.error(error);
        }
    },

    // --- 画面情報 ---
    currentWorkspaceId: null,

    setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
}));