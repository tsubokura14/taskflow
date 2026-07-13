import { create } from "zustand";
import { Task, TaskStatus } from "@/types/task";
import * as taskApi from "@/lib/tasks";

type TaskStore = {
    // --- サーバー状態（supabaseのデータキャッシュ） --- 
    tasks: Task[];
    fetchTasks: () => Promise<void>;
    addTask: (input: { title: string; priority: Task["priority"] }) => Promise<void>;
    editTask: (
        id: string,
        change: Partial<Pick<Task, "title" | "status" | "priority">>
    ) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    // ドラッグ中の見た目のカラム移動専用。supabaseへは送らない
    moveTaskStatus: (id: string, status: TaskStatus) => void;

    // --- UIの一時状態 ---
    isFormOpen: boolean;
    editingTaskId: string | null;
    openCreateForm: () => void;
    openEditForm: (taskId: string) => void;
    closeForm: () => void;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],

    fetchTasks: async () => {
        try {
            const tasks = await taskApi.getTasks();
            set({ tasks });
        } catch (error) {
            console.error("タスクの取得に失敗しました", error);
        }
    },

    addTask: async (input) => {
        try {
            const newTask = await taskApi.createTask(input);
            set((state) => ({ tasks: [...state.tasks, newTask] }));
        } catch (error) {
            console.error("タスクの作成に失敗しました", error);
        }
    },

    editTask: async (id, change) => {
        const current = get().tasks.find((task) => task.id === id);
        if (!current) return;
        try {
            const update = await taskApi.updateTask(id, change, current.version);
            set((state) => ({
                tasks: state.tasks.map((task) => (task.id === id ? update : task)),
            }));
        } catch (error) {
            console.error("タスクの更新に失敗しました", error);
        }
    },

    removeTask: async (id) => {
        try {
            await taskApi.deleteTask(id);
            set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id ) }));
        } catch (error) {
            console.error("タスクの削除に失敗しました", error);
        }
    },

    moveTaskStatus: (id, status) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, status } : task
            )
        }));
    },

    isFormOpen: false,
    editingTaskId: null,

    openCreateForm: () => {
        set({ isFormOpen: true, editingTaskId: null });
    },

    openEditForm: (taskId) => {
        set({ isFormOpen: true, editingTaskId: taskId });
    },

    closeForm: () => {
        set({ isFormOpen: false, editingTaskId: null });
    },
}));
