import { Project } from "@/types"

// --- ports ---
export type CreateProjectInput = {
    workspaceId: string;
    name: string;
}
export type UpdateProjectInput = {
    id: string;
    changes: Partial<Pick<Project, "name" >>;
    currentVersion: number
}
export type DeleteProjectInput = {
    id: string;
    currentVersion: number
}

/** 
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type ProjectApi = {
    getProjects: (workspaceId: string) => Promise<Project[]>;
    createProject: (input: CreateProjectInput) => Promise<Project>;
    updateProject: (input: UpdateProjectInput) => Promise<Project>;
    deleteProject: (input: DeleteProjectInput) => Promise<void>;
};