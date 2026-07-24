export type Workspace = {
    id: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string | null,
    createdAt: string,
    updatedAt: string | null
};

export type Project = {
    id: string,
    workspaceId: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string | null,
    createdAt: string,
    updatedAt: string | null
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
    id: string;
    projectId: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeIds: string[]; // タスクの担当者
    createdBy: string;
    updatedBy: string | null;
    version: number;
    createdAt: string;
    updatedAt: string | null;
};