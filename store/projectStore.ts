import { create } from "zustand";
import { Project } from "@/types";
import * as projectApi from "@/lib/projects";

type projectStore = {
    projects: Project[];
    fetchProjects: (workspaceId: string) => Promise<void>
}

export const useProjectStore = create<projectStore>((set) => ({
    projects: [],

    fetchProjects: async (workspaceId) => {
        try {
            const projects = await projectApi.getProjects(workspaceId);
            set({ projects });
        } catch (error) {
            console.error(error);
        }
    }
}));