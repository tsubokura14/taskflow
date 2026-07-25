import { Project } from "@/types"
import { getCurrentDate } from "@/lib/utils";
import { projectFixtures } from "@/lib/projects.fixtures";

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

/** DBから受け取る型 */
export type ProjectRow = {
    id: string,
    workspace_id: string,
    name: string,
    version: number,
    created_by: string,
    updated_by: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null
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

// Mapper
function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        workspaceId: row.workspace_id,
        name: row.name,
        version: row.version,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }
}

// スタブ使用時の暫定的な永続化先（再代入により模擬的にDBの役割を果たす）
let projects: ProjectRow[] = projectFixtures;

// --- スタブ・Adapters ---
const stubProjectApi = {
    getProjects: async (workspaceId: string) => {
        const data = projects;
        return (data)
            .filter((row) => row.workspace_id === workspaceId)
            .filter((row) => row.deleted_at === null)
            .map(rowToProject);
    },

    createProject: async (input: CreateProjectInput) => {
        const newProject: ProjectRow = {
            id: crypto.randomUUID(),
            workspace_id: input.workspaceId,
            name: input.name,
            version: 1,
            created_by: input.loginUser,
            updated_by: input.loginUser,
            created_at: getCurrentDate(),
            updated_at: getCurrentDate(),
            deleted_at: null
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
            updated_by: input.loginUser,
            updated_at: getCurrentDate(),
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
            updated_by: input.loginUser,
            deleted_at: getCurrentDate(),
        };

        projects = projects
            .map((row) => row.id === input.projectId ? newProject : row);
    },
} satisfies ProjectApi;

// 本番環境とスタブの切り替え点
// ストアには中身が本番かスタブかを意識させない
export const projectApi = stubProjectApi;