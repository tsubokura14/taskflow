import { create } from "zustand";
import { Project } from "@/types";
import * as projectApi from "@/lib/projects";

type projectStore = {
    projects: Project[];
    fetchproject: () => Promise<void>
}

export const useProjectStore = create<projectStore>((set) => ({
    projects: [],

    fetchproject: async () => {
        try {
            const projects = await projectApi.getProjects();
            set({ projects });
        } catch (error) {
            console.error(error);
        }
    }
}));