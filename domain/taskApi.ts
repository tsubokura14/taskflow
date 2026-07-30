import { Task } from "@/types";

// --- ports ---
export type CreateTaskInput = {
    projectId: string;
    title: string;
    priority: Task["priority"];
    loginUser: string;
}
export type UpdateTaskInput = {
    id: string;
    changes: Partial<Pick<Task, "title" | "status" | "priority">>;
    currentVersion: number;
    loginUser: string;
}
export type DeleteTaskInput = {
    id: string;
    currentVersion: number;
    loginUser: string;
}

/** 
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type TaskApi = {
    getTasks: (projectId: string) => Promise<Task[]>;
    createTask: (input: CreateTaskInput) => Promise<Task>;
    updateTask: (input: UpdateTaskInput) => Promise<Task>;
    deleteTask: (input: DeleteTaskInput) => Promise<void>;
};