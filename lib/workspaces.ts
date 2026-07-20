import { Workspace } from "@/types"

export type WorkspaceRow = {
    id: string,
    name: string,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string,
    deleted: boolean
}

function rowToWorkspace(row: WorkspaceRow): Workspace {
    return {
        id: row.id,
        name: row.name,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }
}

// export async function getWorkspace(): Promise<Workspace[]> {
//     const { data, error } = await supabase
//         .from("workspace")
//         .select("*");
//     if (error) throw new Error();
//     return (data as WorkspaceRow[]).map(rowToWorkspace);
// }

// スタブ
export function getWorkspaces(workspaceIds: string[]): Workspace[] {
    const data: WorkspaceRow[] = [
        {
            id: "001",
            name: "サンプルワークスペース001",
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }, {
            id: "002",
            name: "サンプルワークスペース002",
            createdBy: "user002",
            updatedBy: "user002",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }, {
            id: "003",
            name: "サンプルワークスペース003",
            createdBy: "user003",
            updatedBy: "user003",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }
    ]
    return (data as WorkspaceRow[])
        .filter((row) => workspaceIds.includes(row.id))
        .filter((row) => !row.deleted)
        .map(rowToWorkspace);
}