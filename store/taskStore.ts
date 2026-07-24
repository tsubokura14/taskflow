import { create } from "zustand";
import { Task, TaskStatus } from "@/types";
import { 
    CreateTaskInput,
    UpdateTaskInput,
    DeleteTaskInput,
    taskApi 
} from "@/lib/tasks";
import { 
    errorMessages,
    CommonError
} from "@/lib/errors";

type TaskStore = {
    // --- サーバー状態（supabaseのデータキャッシュ） --- 
    tasks: Task[];
    fetchTasks: (projectId: string) => Promise<void>;
    addTask: (input: { 
        projectId: string, 
        title: string; 
        priority: Task["priority"],
        loginUser: string }
    ) => Promise<void>;
    editTask: (input: {
        id: string,
        changes: Partial<Pick<Task, "title" | "status" | "priority">>,
        currentVersion: number,
        loginUser: string}
    ) => Promise<Error | null>;
    removeTask: (input: {
        id: string,
        currentVersion: number,
        loginUser: string
    }) => Promise<void>;
    // ドラッグ中の見た目のカラム移動専用。supabaseへは送らない
    moveTaskStatus: (id: string, status: TaskStatus) => void;
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

    fetchTasks: async (projectId) => {
        try {
            const tasks = await taskApi.getTasks(projectId);
            set({ tasks });
        } catch (error) {
            console.error(errorMessages.taskFetchFailed, error);
        }
    },

    addTask: async (input: CreateTaskInput) => {
        try {
            const newTask = await taskApi.createTask(input);
            set((state) => ({ tasks: [...state.tasks, newTask] }));
        } catch (error) {
            console.error(errorMessages.taskCreateFailed, error);
        }
    },

    editTask: async (input: UpdateTaskInput) => {
        const current = get().tasks.find((task) => task.id === input.id);
        if (!current) {
            console.error(errorMessages.taskUpdateFailed);
            return new CommonError();
        };
        try {
            // 楽観的排他制御を行うため、現在のバージョンを引き渡す
            const update = await taskApi.updateTask(input);
            set((state) => ({
                tasks: state.tasks.map((task) => (task.id === input.id ? update : task)),
            }));
        } catch (error) {
            console.error(errorMessages.taskUpdateFailed, error);
            return error instanceof Error? error : new CommonError(error);
        }
        return null;
    },

    removeTask: async (input: DeleteTaskInput) => {
        try {
            await taskApi.deleteTask(input);
            set((state) => ({ tasks: state.tasks.filter((task) => task.id !== input.id ) }));
        } catch (error) {
            console.error(errorMessages.taskDeleteFailed, error);
        }
    },

    moveTaskStatus: (id, status) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, status } : task
            )
        }));
    },
}));
