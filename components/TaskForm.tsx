"use client";

import { useState, useEffect, FormEvent } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types/task";

export function TaskForm() {
    const isFormOpen = useTaskStore((state) => state.isFormOpen);
    const editingTaskId = useTaskStore((state) => state.editingTaskId);
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const editTask = useTaskStore((state) => state.editTask);
    const closeForm = useTaskStore((state) => state.closeForm);
    
    const editingTask = tasks.find((task) => task.id === editingTaskId);

    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Task["priority"]>("medium");

    // フォームの対象（新規 or 編集中のタスク）が変わるたびに、入力欄を対象の内容に更新
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setPriority(editingTask.priority);
        } else {
            setTitle("");
            setPriority("medium");
        }
    }, [editingTask]);

    if (!isFormOpen) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        if (editingTask) {
            editTask(editingTask.id, { title, priority });
        } else {
            addTask({ title, priority });
        }
        closeForm();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-text/40">
            <form
                onSubmit={handleSubmit}
                className="w-96 rounded-2xl bg-surface-elevated p-6 shadow-xl"
            >
                <h2 className="mb-4 text-base font-bold text-text">
                    {editingTask ? "タスクを編集" : "タスクを作成"}
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
                        onClick={closeForm}
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