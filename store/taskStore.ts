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
    ) => Promise<boolean>;
    removeTask: (id: string) => Promise<void>;
    // ドラッグ中の見た目のカラム移動専用。supabaseへは送らない
    moveTaskStatus: (id: string, status: TaskStatus) => void;

    // --- UIの一時状態 ---
    isFormOpen: boolean;
    editingTaskId: string | null;
    openCreateForm: () => void;
    openEditForm: (taskId: string) => void;
    closeForm: () => void;
    isToastDisplay: boolean,
    toastText: string;
    openToast: (toastText: string) => void;
    closeToast: () => void;
};

/**
 * 状態は{ key: value }の形式で保存される。
 *
 * ■ set（オブジェクト形式）
 * 渡されたオブジェクトを内部stateにshallow mergeし、購読者に変更を通知する。
 * 新しい値が直前のstateに依存しない場合に使う（例：isFormOpenのon/off）。
 * 基本構文：set({ key: value });
 *
 * ■ set（関数形式・このファイルで多用）
 * 直前のstateを引数で受け取り、新しいstateの一部を返す。
 * 配列の追加・削除・更新など「直前の値をもとに」更新する場合は必ずこちら。
 * オブジェクト形式で外側のstate変数を参照すると、非同期処理中に他の更新が
 * 割り込んだ場合に取りこぼす可能性があるため。
 * 基本構文：set((state) => ({ key: newValue }));
 *
 * ■ get
 * 呼び出した時点の最新stateを同期的に返す。setと異なり変更通知は発生しない。
 * 基本構文：get().key
 *
 * 補足：変更通知自体は全購読者に届くが、実際に再レンダリングされるかは
 * 購読側（セレクタ・比較関数）次第。「通知＝全コンポーネント再レンダリング」ではない。
 */
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
        if (!current) return false;
        try {
            // 楽観的排他制御を行うため、現在のバージョンを引き渡す
            const update = await taskApi.updateTask(id, change, current.version);
            set((state) => ({
                tasks: state.tasks.map((task) => (task.id === id ? update : task)),
            }));
        } catch (error) {
            if (error instanceof taskApi.TaskConflictError) {
                console.error(`${error.name}: ${error.message}`);
            } else if (error instanceof taskApi.TaskNotFoundError) {
                console.error(`${error.name}: ${error.message}`);
            } else {
                console.error("タスクの更新に失敗しました", error);
            }
            return false;
        }
        return true;
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

    isToastDisplay: false,
    toastText: "",

    openToast: (toastText: string) => {
        set({ isToastDisplay: true, toastText });
    },

    closeToast: () => {
        set({ isToastDisplay: false, toastText: "" });
    }

}));
