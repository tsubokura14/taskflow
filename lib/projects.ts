import { supabase } from "./supabaseClient"
import { Project } from "@/types"

export type ProjectRow = {
    id: string,
    workspaceId: string,
    name: string,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string,
    deleted: boolean
}

function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    }
}

// export async function getProjects(): Promise<Project[]> {
//     const { data, error } = await supabase
//         .from("Project")
//         .select("*");
//     if (error) throw new Error();
//     return (data as ProjectRow[]).map(rowToProject);
// }

// スタブ
export async function getProjects(): Promise<Project[]> {
    const data: ProjectRow[] = [
        {
            id: "001",
            workspaceId: "001",
            name: "サンプルワークスペース001",
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }, {
            id: "002",
            workspaceId: "001",
            name: "サンプルワークスペース002",
            createdBy: "user002",
            updatedBy: "user002",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }, {
            id: "003",
            workspaceId: "003",
            name: "サンプルワークスペース003",
            createdBy: "user003",
            updatedBy: "user003",
            createdAt: "20260701",
            updatedAt: "20260701",
            deleted: false
        }
    ]
    return (data as ProjectRow[])
        .filter((row) => !row.deleted)
        .map(rowToProject);
}