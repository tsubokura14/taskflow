import { Project } from "@/types"
import { getCurrentDate } from "@/lib/utils";
import { projectFixtures } from "@/infrastructure/fixtures/projects.fixtures";
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { ProjectDbError, ProjectNotFoundError } from "@/lib/errors";
import {
    CreateProjectInput,
    UpdateProjectInput,
    DeleteProjectInput,
    ProjectApi
} from "@/domain/projectApi";

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

// --- 本番環境・Adapters ---
export const supabaseProjectApi = {
    getProjects: async (workspaceId: string) => {
        const { data, error } = await supabase
        .from("project")
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

        if (error) throw new ProjectDbError(error);
        return (data as ProjectRow[]).map(rowToProject);
    },

    createProject: async (input: CreateProjectInput) => {
        const { data, error } = await supabase
            .from("project")
            .insert({
                workspace_id: input.workspaceId,
                name: input.name,
                created_by: input.loginUser,
                updated_by: input.loginUser,
            })
            .select() // insertした行をそのまま返却させる。
            .single(); // 返却する形式に単一オブジェクト{...}を指定する。

        if (error) throw new ProjectDbError(error);
        return rowToProject(data as ProjectRow);
    },
    
    updateProject: async (input: UpdateProjectInput) => {
        const { data, error } = await supabase
            .from("project")
            .update({
                name: input.name,
                updated_by: input.loginUser,
                updated_at: new Date().toISOString(),
            })
            .eq("id", input.projectId)
            .select(); // updateした行をそのまま返却させる。
        
        if (error) throw new ProjectDbError(error);
        if (data.length === 0) throw new ProjectNotFoundError();

        return rowToProject(data[0] as ProjectRow)
    },

    deleteProject: async (input: DeleteProjectInput) => {
        const { error } = await supabase
            .from("project")
            .update({
                updated_by: input.loginUser,
                deleted_at: new Date().toISOString(),
            })
            .eq("id", input.projectId)
            .select(); // updateした行をそのまま返却させる。
        
        if (error) throw new ProjectDbError(error);

    }
} satisfies ProjectApi;

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
// export const projectApi = stubProjectApi;
export const projectApi = supabaseProjectApi;