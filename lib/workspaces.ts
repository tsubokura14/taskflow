import { Workspace } from "@/types"
import { workspaceFixtures } from "@/lib/workspaces.fixtures"
import { getCurrentDate } from "@/lib/utils"

// --- ports ---
export type CreateWorkspaceInput = {
    name: string;
    loginUser: string;
}
export type UpdateWorkspaceInput = {
    workspaceId: string;
    name: string;
    loginUser: string;
}
export type DeleteWorkspaceInput = {
    workspaceId: string;
    loginUser: string;
}

// DBから受け取る型
export type WorkspaceRow = {
    id: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string | null,
    createdAt: string,
    updatedAt: string | null,
    deletedAt: string | null
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

// Mapper
function rowToWorkspace(row: WorkspaceRow): Workspace {
    return {
        id: row.id,
        name: row.name,
        version: row.version,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }
}

// スタブ使用時の暫定的な永続化先（再代入により模擬的にDBの役割を果たす）
let workspaces: WorkspaceRow[] = workspaceFixtures;

// --- スタブ・Adapters ---
const stubWorkspaceApi = {
    getWorkspaces: async (workspaceIds: string[]) => {
        const idSet = new Set(workspaceIds);
        return workspaces
            .filter((row) => idSet.has(row.id))
            .filter((row) => row.deletedAt === null)
            .map(rowToWorkspace);
    },

    createWorkspace: async (input: CreateWorkspaceInput) => {
        const newWorkspace: WorkspaceRow = {
            id: crypto.randomUUID(),
            name: input.name,
            version: 1,
            createdBy: input.loginUser,
            updatedBy: null,
            createdAt: getCurrentDate(),
            updatedAt: null,
            deletedAt: null
        }

        workspaces = [...workspaces, newWorkspace]; 

        return rowToWorkspace(newWorkspace);
    },

    updateWorkspace: async (input: UpdateWorkspaceInput) => {
        const target: WorkspaceRow | undefined = workspaces
            .find((data) => data.id === input.workspaceId);
        if (!target) {
            throw new Error("対象のワークスペースが見つかりませんでした。");
        }

        const newWorkspace: WorkspaceRow =  {
            ...target,
            name: input.name,
            version: target.version + 1,
            updatedBy: input.loginUser,
            updatedAt: getCurrentDate(),
        };

        workspaces = workspaces
            .map((row) => row.id === input.workspaceId ? newWorkspace : row);

        return rowToWorkspace(newWorkspace);
    },

    deleteWorkspace: async (input: DeleteWorkspaceInput) => {
        const target: WorkspaceRow | undefined = workspaces
            .find((data) => data.id === input.workspaceId);
        if (!target) {
            throw new Error("対象のワークスペースが見つかりませんでした。");
        }

        const newWorkspace: WorkspaceRow =  {
            ...target,
            version: target.version + 1,
            updatedBy: input.loginUser,
            deletedAt: getCurrentDate(),
        };

        workspaces = workspaces
            .map((row) => row.id === input.workspaceId ? newWorkspace : row);
    },
} satisfies WorkspaceApi;

// 本番環境とスタブの切り替え点
// ストアには中身が本番かスタブかを意識させない
export const workspaceApi = stubWorkspaceApi;