"use client";

import React, { useState, Dispatch, FormEvent } from "react";
import { useToastStore } from "@/store/toastStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import { Workspace } from "@/types";
import { errorMessages } from "@/lib/errors";

type ChildProps = {
    editingWorkspace: Workspace | null;
    setEditingWorkspace: Dispatch<React.SetStateAction<Workspace | null>>;
};

export function WorkspaceForm({ editingWorkspace, setEditingWorkspace }: ChildProps) {
    const openToast = useToastStore((state) => state.openToast);
    const currentUser = useAuthStore((state) => state.currentUser);
    const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);
    const editWorkspace = useWorkspaceStore((state) => state.editWorkspace);
    const deleteWorkspace = useWorkspaceStore((state) => state.removeWorkspace);

    const [name, setName] = useState(editingWorkspace?.name ?? "");

    if (!editingWorkspace) return null;
    const workspace: Workspace = editingWorkspace;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            openToast([{ status: "error", text: errorMessages.workspaceUpdateFailed }]);
            return;
        }

        // 新規作成
        if (workspace.id === "") {
            await addWorkspace({
                name,
                loginUser: currentUser?.id ?? ""});
        // 編集
        } else {
            await editWorkspace({
                workspaceId: workspace.id,
                name,
                loginUser: currentUser?.id ?? ""
            });
        }
        setEditingWorkspace(null);
    }

    async function handleDelete() {
        await deleteWorkspace({
            workspaceId: workspace.id,
            loginUser: currentUser?.id ?? ""
        });
        setEditingWorkspace(null);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40">
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2 className="mb-4 text-base font-bold text-slate-900">
                    {workspace.id === "" ? "ワークスペースを作成" : "ワークスペースを編集"}
                </h2>

                <label className="mb-3 block text-xs font-semibold text-slate-500">
                    名称
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                </label>

                <div className="flex justify-end gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() => setEditingWorkspace(null)}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600/90"
                    >
                        保存
                    </button>
                </div>

                {workspace.id !== "" && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleDelete()}
                            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600/90"
                        >
                            削除
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}