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
    const removeTask = useTaskStore((state) => state.removeTask);

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
            });
        
        // 編集
        } else {
            const result: Error | null = await editTask({
                id: task.id,
                changes: { title, priority },
                currentVersion: task.version,
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

    function handleDelete() {
        if (window.confirm(`「${task.title}」を削除しますか？`)) {
            removeTask({
                id: task.id,
                currentVersion: task.version,
            });
        setEditingTask(null);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40">
            <form
                onSubmit={handleSubmit}
                className="grid gap-4 w-96 rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2 className="text-base font-bold text-slate-900">
                    {task.id === "" ? "タスクを作成" : "タスクを編集"}
                </h2>

                <label className="block text-xs font-semibold text-slate-500">
                    タイトル
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                </label>

                <label className="block text-xs font-semibold text-slate-500">
                    優先度
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Task["priority"])}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                    </select>
                </label>

                <div className="flex flex-row-reverse justify-between">
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setEditingTask(null)}
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
                    <div>
                        {task.id !== "" && (
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
                    </div>
                </div>
            </form>
        </div>
    );
}