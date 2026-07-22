import { Project } from "@/types"

export type ProjectRow = {
    id: string,
    workspaceId: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string | null,
    createdAt: string,
    updatedAt: string | null,
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

// フィクスチャ
const sampleDatas: ProjectRow[] = [
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

// --- スタブ ---
export function getProjects(workspaceId: string): Project[] {
    const data = sampleDatas
    return (data as ProjectRow[])
        .filter((row) => row.workspaceId === workspaceId)
        .filter((row) => row.deletedAt === null)
        .map(rowToProject);
}

export function createProject(input: {
        workspaceId: string,
        name: string,
        loginUser: string
    }): Project {
    const newProject: ProjectRow = {
        id: "project_001",
        workspaceId: input.workspaceId,
        name: input.name,
        version: 1,
        createdBy: input.loginUser,
        updatedBy: null,
        createdAt: getCurrentDate(),
        updatedAt: null,
        deletedAt: null
    }
    return rowToProject(newProject);
}

// スタブ用（本番環境はPostgreSQLで設定）
function getCurrentDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    // getMonth()は0（1月）～11（12月）を返すため、+1して調整
    // padStart(2, '0')は、月や日が1桁の場合に2桁へゼロ埋め
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}
