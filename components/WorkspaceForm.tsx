"use client";

import React, { useState, Dispatch, FormEvent } from "react";
import { useToastStore } from "@/store/toastStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Workspace } from "@/types";
import { errorMessages } from "@/lib/errors";

type ChildProps = {
    editingWorkspace: Workspace | null; 
    setEditingWorkspace: Dispatch<React.SetStateAction<Workspace | null>>;
};

export function WorkspaceForm({ editingWorkspace, setEditingWorkspace }: ChildProps) {
    const openToast = useToastStore((state) => state.openToast);
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
                loginUser: "user_001"});
        // 編集
        } else {
            await editWorkspace({
                workspaceId: workspace.id,
                name,
                loginUser: "user_001"
            });
        }
        setEditingWorkspace(null);
    }

    async function handleDelete() {
        await deleteWorkspace({
            workspaceId: workspace.id,
            loginUser: "user_001"
        });
        setEditingWorkspace(null);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-text/40">
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-surface-elevated p-6 shadow-xl"
            >
                <h2 className="mb-4 text-base font-bold text-text">
                    {workspace.id === "" ? "ワークスペースを作成" : "ワークスペースを編集"}
                </h2>

                <label className="mb-3 block text-xs font-semibold text-text-muted">
                    名称
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-border p-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>

                <div className="flex justify-end gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() => setEditingWorkspace(null)}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-surface-sunken"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                        保存
                    </button>
                </div>

                {workspace.id !== "" && (
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            onClick={() => handleDelete()}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        >
                            削除
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}