import { Workspace } from "@/types";
import { WorkspaceConflictError, WorkspaceNotFoundError } from "@/lib/errors";
import {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    DeleteWorkspaceInput,
    WorkspaceApi
} from "@/domain/workspaceApi";

// レスポンスのエラーステータスを、既存のエラークラスに変換する。
// 楽観的排他制御の競合(409)・対象なし(404)は、既存のsupabase版workspaceAdapterと同じ意味で扱う。
async function throwIfError(res: Response): Promise<void> {
    if (res.ok) return;
    if (res.status === 409) throw new WorkspaceConflictError();
    if (res.status === 404) throw new WorkspaceNotFoundError();
    // 401/403/500等、原因の切り分けができるよう実際のステータスとレスポンス内容をそのままメッセージに含める（暫定のデバッグ用）
    const body = await res.text().catch(() => "(bodyの取得に失敗)");
    throw new Error(`Workspace API error: HTTP ${res.status} ${body}`);
}

// --- 本番環境・Adapters（Route Handler経由、Prisma操作はサーバー側） ---
export const apiWorkspaceApi = {
    getWorkspaces: async () => {
        const res = await fetch(`/api/workspaces`);
        await throwIfError(res);
        return (await res.json()) as Workspace[];
    },

    createWorkspace: async (input: CreateWorkspaceInput) => {
        const res = await fetch("/api/workspaces", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        await throwIfError(res);
        return (await res.json()) as Workspace;
    },

    updateWorkspace: async (input: UpdateWorkspaceInput) => {
        const res = await fetch(`/api/workspaces/${input.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: input.name,
                currentVersion: input.currentVersion
            }),
        });
        await throwIfError(res);
        return (await res.json()) as Workspace;
    },

    deleteWorkspace: async (input: DeleteWorkspaceInput) => {
        const res = await fetch(`/api/workspaces/${input.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentVersion: input.currentVersion }),
        });
        await throwIfError(res);
    },
} satisfies WorkspaceApi;
