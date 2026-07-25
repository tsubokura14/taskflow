export class CommonError extends Error {
    constructor(cause?: unknown) {
        super(errorMessages.commonError, { cause });
        this.name = "CommonError";
    }
}

export class WorkspaceDbError extends Error {
    constructor(cause?: unknown) {
        super("DB操作でエラーが発生しました。", { cause });
        this.name = "WorkspaceDbError";
    }
}

export class WorkspaceConflictError extends Error {
    constructor(cause?: unknown) {
        super("ワークスペースの操作が競合しました。", { cause });
        this.name = "WorkspaceConflictError";
    }
}

export class WorkspaceNotFoundError extends Error {
    constructor(cause?: unknown) {
        super("対象のワークスペースが見つかりませんでした。", { cause });
        this.name = "WorkspaceNotFoundError";
    }
}

export class ProjectDbError extends Error {
    constructor(cause?: unknown) {
        super("DB操作でエラーが発生しました。", { cause });
        this.name = "ProjectDbError";
    }
}

export class ProjectConflictError extends Error {
    constructor(cause?: unknown) {
        super("プロジェクトの操作が競合しました。", { cause });
        this.name = "ProjectConflictError";
    }
}

export class ProjectNotFoundError extends Error {
    constructor(cause?: unknown) {
        super("対象のプロジェクトが見つかりませんでした。", { cause });
        this.name = "ProjectNotFoundError";
    }
}

export class TaskDbError extends Error {
    constructor(cause?: unknown) {
        super("DB操作でエラーが発生しました。", { cause });
        this.name = "TaskDbError";
    }
}

export class TaskConflictError extends Error {
    constructor(cause?: unknown) {
        super("タスクの操作が競合しました。", { cause });
        this.name = "TaskConflictError";
    }
}

export class TaskNotFoundError extends Error {
    constructor(cause?: unknown) {
        super("対象のタスクが見つかりませんでした。", { cause });
        this.name = "TaskNotFoundError";
    }
}

export const errorMessages = {
    commonError: "エラーが発生しました。",
    workspaceFetchFailed:  "ワークスペースの取得に失敗しました。",
    workspaceCreateFailed: "ワークスペースの作成に失敗しました。",
    workspaceUpdateFailed: "ワークスペースの更新に失敗しました。",
    workspaceDeleteFailed: "ワークスペースの削除に失敗しました。",
    projectFetchFailed:  "プロジェクトの取得に失敗しました。",
    projectCreateFailed: "プロジェクトの作成に失敗しました。",
    projectUpdateFailed: "プロジェクトの更新に失敗しました。",
    projectDeleteFailed: "プロジェクトの削除に失敗しました。",
    taskFetchFailed:  "タスクの取得に失敗しました。",
    taskCreateFailed: "タスクの作成に失敗しました。",
    taskUpdateFailed: "タスクの更新に失敗しました。",
    taskDeleteFailed: "タスクの削除に失敗しました。"
} as const;
export type ErrorMessageKey = keyof typeof errorMessages;

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return errorMessages.commonError;
}