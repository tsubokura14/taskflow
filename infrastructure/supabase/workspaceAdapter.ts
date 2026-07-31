import { Workspace } from "@/types"
import { workspaceFixtures } from "@/infrastructure/fixtures/workspaces.fixtures"
import { getCurrentDate } from "@/lib/utils"
import { supabase } from "@/infrastructure/supabase/supabaseClient"
import { WorkspaceDbError, WorkspaceNotFoundError } from "@/lib/errors"
import { 
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    DeleteWorkspaceInput,
    WorkspaceApi
} from "@/domain/workspaceApi";

// DBから受け取る型
export type WorkspaceRow = {
    id: string,
    name: string,
    version: number,
    created_by: string,
    updated_by: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null
}

// Mapper
function rowToWorkspace(row: WorkspaceRow): Workspace {
    return {
        id: row.id,
        name: row.name,
        version: row.version,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

// --- 本番環境・Adapters ---
export const supabaseWorkspaceApi = {
    getWorkspaces: async (workspaceIds: string[]) => {
        const { data, error } = await supabase
            .from("workspace")
            .select("*")
            .in("id", workspaceIds)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) throw new WorkspaceDbError(error);
        return (data as WorkspaceRow[]).map(rowToWorkspace);
    },

    createWorkspace: async (input: CreateWorkspaceInput) => {
        const { data, error } = await supabase
            .from("workspace")
            .insert({
                name: input.name,
                created_by: input.loginUser,
                updated_by: input.loginUser,
            })
            .select() // insertした行をそのまま返却させる。
            .single(); // 返却する形式に単一オブジェクト{...}を指定する。

        if (error) throw new WorkspaceDbError(error);
        return rowToWorkspace(data as WorkspaceRow);
    },

    updateWorkspace: async (input: UpdateWorkspaceInput) => {
        const { data, error } = await supabase
            .from("workspace")
            .update({
                name: input.name,
                updated_by: input.loginUser,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.workspaceId)
            .select(); // updateした行をそのまま返却させる。

        if (error) throw new WorkspaceDbError(error);
        if (data.length === 0) throw new WorkspaceNotFoundError();

        return rowToWorkspace(data[0] as WorkspaceRow);
    },

    deleteWorkspace: async (input: DeleteWorkspaceInput) => {
        const { error } = await supabase
            .from("workspace")
            .update({
                updated_by: input.loginUser,
                deleted_at: new Date().toISOString(),
            })
            .eq("id", input.workspaceId)
            .select(); // updateした行をそのまま返却させる。

        if (error) throw new WorkspaceDbError(error);
    }
} satisfies WorkspaceApi;

// スタブ使用時の暫定的な永続化先（再代入により模擬的にDBの役割を果たす）
let workspaces: WorkspaceRow[] = workspaceFixtures;

// --- スタブ・Adapters ---
const stubWorkspaceApi = {
    getWorkspaces: async (workspaceIds: string[]) => {
        const idSet = new Set(workspaceIds);
        return workspaces
            .filter((row) => idSet.has(row.id))
            .filter((row) => row.deleted_at === null)
            .map(rowToWorkspace);
    },

    createWorkspace: async (input: CreateWorkspaceInput) => {
        const newWorkspace: WorkspaceRow = {
            id: crypto.randomUUID(),
            name: input.name,
            version: 1,
            created_by: input.loginUser,
            updated_by: input.loginUser,
            created_at: getCurrentDate(),
            updated_at: getCurrentDate(),
            deleted_at: null
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
            updated_by: input.loginUser,
            updated_at: getCurrentDate(),
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
            updated_by: input.loginUser,
            deleted_at: getCurrentDate(),
        };

        workspaces = workspaces
            .map((row) => row.id === input.workspaceId ? newWorkspace : row);
    },
} satisfies WorkspaceApi;

// 本番環境とスタブの切り替え点
// ストアには中身が本番かスタブかを意識させない
// export const workspaceApi = stubWorkspaceApi;
export const workspaceApi = supabaseWorkspaceApi;