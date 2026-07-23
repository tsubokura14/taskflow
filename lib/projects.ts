import { Project } from "@/types"
import { getCurrentDate } from "@/lib/utils";
import { projectFixtures } from "@/lib/projects.fixtures";

// スタブ使用時の暫定的な永続化先（再代入により模擬的にDBの役割を果たす）
let projects: ProjectRow[] = projectFixtures

// --- ports ---
export type CreateProjectInput = {
    workspaceId: string;
    name: string;
    loginUser: string;
}
export type UpdateProjectInput = {
    projectId: string;
    name: string;
    loginUser: string;
}
export type DeleteProjectInput = {
    projectId: string;
    loginUser: string;
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

/** DBから受け取る型 */
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

// Mapper
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

// --- スタブ・Adapters ---
const stubProjectApi = {
    getProjects: async (workspaceId: string) => {
        const data = projects
        return (data)
            .filter((row) => row.workspaceId === workspaceId)
            .filter((row) => row.deletedAt === null)
            .map(rowToProject);
    },

    createProject: async (input: CreateProjectInput) => {
        const newProject: ProjectRow = {
            id: crypto.randomUUID(),
            workspaceId: input.workspaceId,
            name: input.name,
            version: 1,
            createdBy: input.loginUser,
            updatedBy: null,
            createdAt: getCurrentDate(),
            updatedAt: null,
            deletedAt: null
        }
        projects = [...projects, newProject]; 
        return rowToProject(newProject);
    },
    
    updateProject: async (input: UpdateProjectInput) => {
        const target: ProjectRow | undefined = projects
            .find((data) => data.id === input.projectId);
        if (!target) {
            throw new Error("対象のプロジェクトが見つかりませんでした。");
        }

        const newProject: ProjectRow =  {
            ...target,
            name: input.name,
            version: target.version + 1,
            updatedBy: input.loginUser,
            updatedAt: getCurrentDate(),
        };

        projects = projects
            .map((row) => row.id === input.projectId ? newProject : row);

        return rowToProject(newProject);
    },

    deleteProject: async (input: DeleteProjectInput) => {
        const target: ProjectRow | undefined = projects
            .find((data) => data.id === input.projectId);
        if (!target) {
            throw new Error("対象のプロジェクトが見つかりませんでした。");
        }

        const newProject: ProjectRow =  {
            ...target,
            version: target.version + 1,
            updatedBy: input.loginUser,
            deletedAt: getCurrentDate(),
        };

        projects = projects
            .map((row) => row.id === input.projectId ? newProject : row);
    },
} satisfies ProjectApi;

// 本番環境とスタブの切り替え点
// ストアには中身が本番かスタブかを意識させない
export const projectApi = stubProjectApi;