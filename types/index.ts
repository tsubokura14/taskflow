export type Workspace = {
    id: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string
}

export type Project = {
    id: string,
    workspaceId: string,
    name: string,
    version: number,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string
}

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
    updatedBy: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}