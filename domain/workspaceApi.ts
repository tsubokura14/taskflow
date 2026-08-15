import { Workspace } from "@/types"

// --- ports ---
export type CreateWorkspaceInput = {
    name: string;
}
export type UpdateWorkspaceInput = {
    id: string;
    name: string;
    currentVersion: number;
}
export type DeleteWorkspaceInput = {
    id: string;
    currentVersion: number;
}

/** 
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type WorkspaceApi = {
    getWorkspaces: () => Promise<Workspace[]>;
    createWorkspace: (input: CreateWorkspaceInput) => Promise<Workspace>;
    updateWorkspace: (input: UpdateWorkspaceInput) => Promise<Workspace>;
    deleteWorkspace: (input: DeleteWorkspaceInput) => Promise<void>;
};