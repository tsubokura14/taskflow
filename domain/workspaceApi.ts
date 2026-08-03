import { Workspace } from "@/types"

// --- ports ---
export type CreateWorkspaceInput = {
    name: string;
    // loginUser: string; TODO
}
export type UpdateWorkspaceInput = {
    workspaceId: string;
    name: string;
    // loginUser: string; TODO
}
export type DeleteWorkspaceInput = {
    workspaceId: string;
    // loginUser: string; TODO
}

/** 
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type WorkspaceApi = {
    getWorkspaces: (workspaceIds: string[]) => Promise<Workspace[]>;
    createWorkspace: (input: CreateWorkspaceInput) => Promise<Workspace>;
    updateWorkspace: (input: UpdateWorkspaceInput) => Promise<Workspace>;
    deleteWorkspace: (input: DeleteWorkspaceInput) => Promise<void>;
};