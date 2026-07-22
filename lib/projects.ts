import { Project } from "@/types"

export type ProjectRow = {
    id: string,
    workspaceId: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string | null
}

function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        workspaceId: row.workspaceId,
        name: row.name,
        version: row.version,
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
export function getProjects(workspaceId: string): Project[] {
    const data: ProjectRow[] = [
        {
            id: "project_001",
            workspaceId: "001",
            name: "サンプルプロジェクト001",
            version: 1,
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deletedAt: null
        }, {
            id: "project_002",
            workspaceId: "002",
            name: "サンプルプロジェクト002",
            version: 1,
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deletedAt: null
        }, {
            id: "project_003",
            workspaceId: "003",
            name: "サンプルプロジェクト003",
            version: 1,
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deletedAt: null
        }, {
            id: "project_004",
            workspaceId: "003",
            name: "サンプルプロジェクト004",
            version: 1,
            createdBy: "user001",
            updatedBy: "user001",
            createdAt: "20260701",
            updatedAt: "20260701",
            deletedAt: "20260701"
        }
    ]
    return (data as ProjectRow[])
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => row.deletedAt === null)
        .map(rowToProject);
}