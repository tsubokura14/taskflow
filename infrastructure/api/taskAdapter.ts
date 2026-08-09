import { Task } from "@/types";
import { TaskDbError, TaskConflictError, TaskNotFoundError } from "@/lib/errors";
import {
    CreateTaskInput,
    UpdateTaskInput,
    DeleteTaskInput,
    TaskApi
} from "@/domain/taskApi";

// レスポンスのエラーステータスを、既存のエラークラスに変換する。
// 楽観的排他制御の競合(409)・対象なし(404)は、既存のsupabase版taskAdapterと同じ意味で扱う。
async function throwIfError(res: Response): Promise<void> {
    if (res.ok) return;
    if (res.status === 409) throw new TaskConflictError();
    if (res.status === 404) throw new TaskNotFoundError();
    // 401/403/500等、原因の切り分けができるよう実際のステータスとレスポンス内容をそのままメッセージに含める（暫定のデバッグ用）
    const body = await res.text().catch(() => "(bodyの取得に失敗)");
    throw new Error(`Task API error: HTTP ${res.status} ${body}`);
}

// --- 本番環境・Adapters（Route Handler経由、Prisma操作はサーバー側） ---
export const apiTaskApi = {
    getTasks: async (projectId: string) => {
        // クエリパラメータ（?以降）はルーティングには考慮されない。
        const res = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);
        await throwIfError(res);
        return (await res.json()) as Task[];
    },

    createTask: async (input: CreateTaskInput) => {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        await throwIfError(res);
        return (await res.json()) as Task;
    },

    updateTask: async (input: UpdateTaskInput) => {
        const res = await fetch(`/api/tasks/${input.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                changes: input.changes,
                currentVersion: input.currentVersion,
            }),
        });
        await throwIfError(res);
        return (await res.json()) as Task;
    },

    deleteTask: async (input: DeleteTaskInput) => {
        const res = await fetch(`/api/tasks/${input.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentVersion: input.currentVersion }),
        });
        await throwIfError(res);
    },
} satisfies TaskApi;
