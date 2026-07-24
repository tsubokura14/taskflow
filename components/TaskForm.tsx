"use client";

import React, { useState, Dispatch, FormEvent } from "react";
import { useToastStore } from "@/store/toastStore";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types";
import { errorMessages } from "@/lib/errors";
import { toastMessages } from "@/lib/messages";
import { useProjectStore } from "@/store/projectStore";

type ChildProps = {
    editingTask: Task | null; 
    setEditingTask: Dispatch<React.SetStateAction<Task | null>>;
};

export function TaskForm({ editingTask, setEditingTask }: ChildProps) {
    const openToast = useToastStore((state) => state.openToast);
    const currentProjectId = useProjectStore((state) => state.currentProjectId);
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const addTask = useTaskStore((state) => state.addTask);
    const editTask = useTaskStore((state) => state.editTask);

    const [title, setTitle] = useState(editingTask?.title ?? "");
    const [priority, setPriority] = useState<Task["priority"]>(editingTask?.priority ?? "medium");

    if (!editingTask) return null;
    const task: Task = editingTask;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!title.trim() || !currentProjectId) {
            openToast([{ status: "error", text: errorMessages.taskUpdateFailed }]);
            return;
        }

        // 新規作成
        if (task.id === "") {
            await addTask({ 
                projectId: currentProjectId, 
                title, 
                priority, 
                loginUser: "user_001"});
        
        // 編集
        } else {
            const result: Error | null = await editTask({
                id: task.id,
                changes: { title, priority },
                currentVersion: task.version,
                loginUser: "user_001"
            });
            
            // 更新に失敗した場合
            if (result) {
                openToast([
                    { status: "error", text: result.message },
                    { status: "error", text: errorMessages.taskUpdateFailed }
                ]);
                if (currentProjectId) {
                    await fetchTasks(currentProjectId);
                    openToast([{ status: "info", text: toastMessages.syncRecentData }]);
                }
            }
        }
        setEditingTask(null);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-text/40">
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-surface-elevated p-6 shadow-xl"
            >
                <h2 className="mb-4 text-base font-bold text-text">
                    {task.id === "" ? "タスクを作成" : "タスクを編集"}
                </h2>

                <label className="mb-3 block text-xs font-semibold text-text-muted">
                    タイトル
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-border p-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </label>

                <label className="mb-5 block text-xs font-semibold text-text-muted">
                    優先度
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Task["priority"])}
                        className="mt-1.5 w-full rounded-lg border border-border p-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                    </select>
                </label>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setEditingTask(null)}
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