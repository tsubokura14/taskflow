"use client";

import React, { useState, Dispatch, FormEvent } from "react";
import { useToastStore } from "@/store/toastStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { Project } from "@/types";
import { errorMessages } from "@/lib/errors";

type ChildProps = {
    editingProject: Project | null;
    setEditingProject: Dispatch<React.SetStateAction<Project | null>>;
};

export function ProjectForm({ editingProject, setEditingProject }: ChildProps) {
    const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const currentUser = useAuthStore((state) => state.currentUser);
    const openToast = useToastStore((state) => state.openToast);
    const addProject = useProjectStore((state) => state.addProject);
    const editProject = useProjectStore((state) => state.editProject);
    const deleteProject = useProjectStore((state) => state.removeProject);

    const [name, setName] = useState(editingProject?.name ?? "");

    if (!editingProject) return null;
    const project: Project = editingProject;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !currentWorkspaceId) {
            openToast([{ status: "error", text: errorMessages.projectUpdateFailed }]);
            return;
        }

        // 新規作成
        if (project.id === "") {
            await addProject({
                workspaceId: currentWorkspaceId,
                name,
            });
        // 編集
        } else {
            await editProject({
                id: project.id,
                changes: { name },
                currentVersion: project.version,
            });
        }
        setEditingProject(null);
    }

    async function handleDelete() {
        await deleteProject({ 
            id: project.id,
            currentVersion: project.version,
        });
        setEditingProject(null);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40">
            <form
                onSubmit={handleSubmit}
                className="grid gap-4 w-96 rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2 className="text-base font-bold text-slate-900">
                    {project.id === "" ? "プロジェクトを作成" : "プロジェクトを編集"}
                </h2>

                <label className="block text-xs font-semibold text-slate-500">
                    名称
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                </label>

                <div className="flex flex-row-reverse justify-between">
                    <div className="flex justify-end gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setEditingProject(null)}
                            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            保存
                        </button>
                    </div>
                    <div>
                        {project.id !== "" && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleDelete()}
                                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                                >
                                    削除
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}