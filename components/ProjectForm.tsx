"use client";

import React, { useState, Dispatch, FormEvent } from "react";
import { useToastStore } from "@/store/toastStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useProjectStore } from "@/store/projectStore";
import { Project } from "@/types";
import { errorMessages } from "@/lib/errors";

type ChildProps = {
    editingProject: Project | null; 
    setEditingProject: Dispatch<React.SetStateAction<Project | null>>;
};

export function ProjectForm({ editingProject, setEditingProject }: ChildProps) {
    const openToast = useToastStore((state) => state.openToast);

    const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
    const addProject = useProjectStore((state) => state.addProject);
    const editProject = useProjectStore((state) => state.editProject);

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
                loginUser: "user_001"});
        
        // 編集
        } else {
            await editProject({
                projectId: project.id,
                name,
                loginUser: "user_001"
            });
        }
        setEditingProject(null);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-text/40">
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-surface-elevated p-6 shadow-xl"
            >
                <h2 className="mb-4 text-base font-bold text-text">
                    {project.id === "" ? "プロジェクトを作成" : "プロジェクトを編集"}
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

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setEditingProject(null)}
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
            </form>
        </div>
    );
}