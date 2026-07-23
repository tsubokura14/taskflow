import { create } from "zustand";
import { Project } from "@/types";
import { CreateProjectInput, projectApi } from "@/lib/projects";

type ProjectStore = {
    // --- プロジェクト一覧画面 ---
    projects: Project[];
    fetchProjects: (workspaceId: string) => Promise<void>;
    addProject: (input: CreateProjectInput) => Promise<void>;

    // --- プロジェクト一覧の配下の画面 ---
    currentProjectId: string | null;
    setCurrentProjectId: (projectId: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    // --- プロジェクト一覧画面 ---
    projects: [],

    fetchProjects: async (workspaceId) => {
        try {
            const projects = await projectApi.getProjects(workspaceId);
            set({ projects });
        } catch (error) {
            console.error(error);
        }
    },

    addProject: async (input) => {
        try {
            const newProject = await projectApi.createProject(input);
            set((state) => ({ projects: [ ...state.projects, newProject ] }));
        } catch (error) {
            console.error(error);
        }
    },

    // --- プロジェクト一覧の配下の画面 ---
    currentProjectId: null,

    setCurrentProjectId: (projectId) => set({ currentProjectId: projectId })
}));