import { supabase } from "@/lib/supabaseClient";
import { Task } from "@/types/task";

const PROJECT_ID = "project_001";
const CURRENT_USER_ID = "user_001";

/**
 * supabaseのDB列名（snake_case）と、アプリ内のtask型（camelCase）の対応。
 * DBスキーマとフロントの型を1対1でそろえるとDB設計の変更がフロント全体に波及しやすいため、
 * この変換関数を境界にして分離している。
 */
type TaskRow = {
    id: string;
    project_id: string;
    title: string;
    status: Task["status"];
    priority: Task["priority"];
    assignee_ids: string[];
    created_by: string;
    updated_by: string;
    version: number;
    created_at: string;
    updated_at: string;
};

// supabaseから取得した値をTask型に整形する。
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

export class TaskConflictError extends Error {
    constructor() {
        super("データが更新されているため保存できませんでした。");
        this.name = "TaskConflictError";
    }
}

export class TaskNotFoundError extends Error {
    constructor() {
        super("対象のタスクが見つかりませんでした。");
        this.name = "TaskNotFoundError";
    }
 } 

export async function getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
        .from("task")
        .select("*")
        .eq("project_id", PROJECT_ID)
        .order("created_at", { ascending: true });
    
    if (error) throw error;
    return (data as TaskRow[]).map(rowToTask);
}

export async function createTask(input: {
    title: string;
    priority: Task["priority"];
}): Promise<Task> {
    const { data, error } = await supabase
        .from("task")
        .insert({
            project_id: PROJECT_ID,
            title: input.title,
            status: "todo",
            priority: input.priority,
            assignee_ids: [CURRENT_USER_ID],
            created_by: CURRENT_USER_ID,
            updated_by: CURRENT_USER_ID,
        })
        .select() // insertした行をそのまま返却させる。
        .single(); // 返却する形式に単一オブジェクト{...}を指定する。

    if (error) throw error;
    return rowToTask(data as TaskRow);
}

export async function updateTask(
    id: string,
    changes: Partial<Pick<Task, "title" | "status" | "priority">>,
    currentVersion: number
): Promise<Task> {
    const { data, error } = await supabase
        .from("task")
        .update({
            ...changes,
            updated_by: CURRENT_USER_ID,
            updated_at: new Date().toISOString(),
            version: currentVersion + 1,
        })
        .eq("id", id)
        .eq("version", currentVersion)  // 楽観的排他制御
        .select() // updateした行をそのまま返却させる。

    if (error) throw error;

    if (data.length === 0) {
        // WHEREに一致しなかった理由（競合 or 存在しない）を切り分けるため、
        // versionの条件を外して存在有無だけ確認する。
        const { data: existing, error: existError } = await supabase
            .from("task")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (existError) throw existError;
        throw existing ? new TaskConflictError() : new TaskNotFoundError();
    }

    return rowToTask(data[0] as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("task").delete().eq("id", id);
    if (error) throw error;
}