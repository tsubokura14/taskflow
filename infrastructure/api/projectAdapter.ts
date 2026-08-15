import { Project } from "@/types";
import { ProjectConflictError, ProjectNotFoundError } from "@/lib/errors";
import {
    CreateProjectInput,
    UpdateProjectInput,
    DeleteProjectInput,
    ProjectApi
} from "@/domain/projectApi";

// レスポンスのエラーステータスを、既存のエラークラスに変換する。
// 楽観的排他制御の競合(409)・対象なし(404)は、既存のsupabase版projectAdapterと同じ意味で扱う。
async function throwIfError(res: Response): Promise<void> {
    if (res.ok) return;
    if (res.status === 409) throw new ProjectConflictError();
    if (res.status === 404) throw new ProjectNotFoundError();
    // 401/403/500等、原因の切り分けができるよう実際のステータスとレスポンス内容をそのままメッセージに含める（暫定のデバッグ用）
    const body = await res.text().catch(() => "(bodyの取得に失敗)");
    throw new Error(`Project API error: HTTP ${res.status} ${body}`);
}

// --- 本番環境・Adapters（Route Handler経由、Prisma操作はサーバー側） ---
export const apiProjectApi = {
    getProjects: async (workspaceId: string) => {
        // クエリパラメータ（?以降）はルーティングには考慮されない。
        const res = await fetch(`/api/projects?workspaceId=${encodeURIComponent(workspaceId)}`);
        await throwIfError(res);
        return (await res.json()) as Project[];
    },

    createProject: async (input: CreateProjectInput) => {
        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        await throwIfError(res);
        return (await res.json()) as Project;
    },

    updateProject: async (input: UpdateProjectInput) => {
        const res = await fetch(`/api/projects/${input.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                changes: input.changes,
                currentVersion: input.currentVersion,
            }),
        });
        await throwIfError(res);
        return (await res.json()) as Project;
    },

    deleteProject: async (input: DeleteProjectInput) => {
        const res = await fetch(`/api/projects/${input.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentVersion: input.currentVersion }),
        });
        await throwIfError(res);
    },
} satisfies ProjectApi;
