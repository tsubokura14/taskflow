import { supabase } from "@/lib/supabaseClient";
import { Task } from "@/types";
import { 
    TaskDbError,
    TaskConflictError,
    TaskNotFoundError
} from "@/lib/errors";

// --- ports ---
export type CreateTaskInput = {
    projectId: string;
    title: string;
    priority: Task["priority"];
    loginUser: string;
}
export type UpdateTaskInput = {
    id: string;
    changes: Partial<Pick<Task, "title" | "status" | "priority">>;
    currentVersion: number;
    loginUser: string;
}
export type DeleteTaskInput = {
    id: string;
    currentVersion: number;
    loginUser: string;
}

/** DBから受け取る型 */
type TaskRow = {
    id: string;
    project_id: string;
    title: string;
    status: Task["status"];
    priority: Task["priority"];
    assignee_ids: string[];
    created_by: string;
    updated_by: string | null;
    version: number;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
};

/** 
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type TaskApi = {
    getTasks: (projectId: string) => Promise<Task[]>;
    createTask: (input: CreateTaskInput) => Promise<Task>;
    updateTask: (input: UpdateTaskInput) => Promise<Task>;
    deleteTask: (input: DeleteTaskInput) => Promise<void>;
};

// Mapper
function rowToTask(row: TaskRow): Task {
    return {
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        status: row.status,
        priority: row.priority,
        assigneeIds: row.assignee_ids,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// --- 本番環境・Adapters ---
const supabaseTaskApi = {
    getTasks: async (projectId: string) => {
        const { data, error } = await supabase
            .from("task")
            .select("*")
            .eq("project_id", projectId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });
        
        if (error) throw new TaskDbError(error);    
        return (data as TaskRow[]).map(rowToTask);
    },

    createTask: async (input: CreateTaskInput) => {
        const { data, error } = await supabase
            .from("task")
            .insert({
                project_id: input.projectId,
                title: input.title,
                status: "todo",
                priority: input.priority,
                assignee_ids: [input.loginUser],
                created_by: input.loginUser,
                updated_by: input.loginUser,
            })
            .select() // insertした行をそのまま返却させる。
            .single(); // 返却する形式に単一オブジェクト{...}を指定する。

        if (error) throw new TaskDbError(error);
        return rowToTask(data as TaskRow);
    },

    updateTask: async (input: UpdateTaskInput) => {
        const { data, error } = await supabase
            .from("task")
            .update({
                ...input.changes,
                updated_by: input.loginUser,
                updated_at: new Date().toISOString(),
                version: input.currentVersion + 1,
            })
            .eq("id", input.id)
            .eq("version", input.currentVersion)  // 楽観的排他制御
            .select(); // updateした行をそのまま返却させる。

        if (error) throw new TaskDbError(error);

        if (data.length === 0) {
            // WHEREに一致しなかった理由（競合 or 存在しない）を切り分けるため、
            // versionの条件を外して存在有無だけ確認する。
            const { data: existing, error: existError } = await supabase
                .from("task")
                .select("id")
                .eq("id", input.id)
                .maybeSingle();

            if (existError) throw new TaskDbError(existError);
            throw existing ? new TaskConflictError() : new TaskNotFoundError();
        }

        return rowToTask(data[0] as TaskRow);
    },

    deleteTask: async (input: DeleteTaskInput) => {
        const { data, error } = await supabase
            .from("task")
            .update({
                updated_by: input.loginUser,
                deleted_at: new Date().toISOString()
            })
            .eq("id", input.id)
            .eq("version", input.currentVersion)  // 楽観的排他制御
            .select(); // updateした行をそのまま返却させる。

        if (error) throw new TaskDbError(error);

        if (data.length === 0) {
            // WHEREに一致しなかった理由（競合 or 存在しない）を切り分けるため、
            // versionの条件を外して存在有無だけ確認する。
            const { data: existing, error: existError } = await supabase
                .from("task")
                .select("id")
                .eq("id", input.id)
                .maybeSingle();

            if (existError) throw new TaskDbError(existError);
            throw existing ? new TaskConflictError() : new TaskNotFoundError();
        }
    }
} satisfies TaskApi;

// 本番環境とスタブの切り替え点
// ストアには中身が本番かスタブかを意識させない
export const taskApi = supabaseTaskApi;