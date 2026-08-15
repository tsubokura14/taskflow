import { ZodError } from 'zod';
export class CommonError extends Error {
    constructor(cause?: unknown) {
        super(errorMessages.commonError, { cause });
        this.name = "CommonError";
    }
}

export class UserDbError extends Error {
    constructor(cause?: unknown) {
        super("認証操作でエラーが発生しました。", { cause });
        this.name = "UserDbError";
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

export class UnauthorizedError extends Error {
    constructor(cause?: unknown) {
        super("認証が必要です。", { cause });
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends Error {
    constructor(cause?: unknown) {
        super("この操作を行う権限がありません。", { cause });
        this.name = "ForbiddenError";
    }
}

// Route Handlerのcatchブロックで、例外の種類をHTTPステータスに変換するための共通関数。
export function errorToResponseInit(error: unknown): { status: number; message: string } {
    if (error instanceof UnauthorizedError) return { status: 401, message: error.message };
    if (error instanceof ForbiddenError) return { status: 403, message: error.message };
    if (error instanceof ZodError) { 
        return { status: 400, message: error.issues.map(i => i.message).join(", ") };
    } 
    if (error instanceof WorkspaceNotFoundError) return { status: 404, message: error.message };
    if (error instanceof WorkspaceConflictError) return { status: 409, message: error.message };
    if (error instanceof ProjectNotFoundError) return { status: 404, message: error.message };
    if (error instanceof ProjectConflictError) return { status: 409, message: error.message };
    if (error instanceof TaskNotFoundError) return { status: 404, message: error.message };
    if (error instanceof TaskConflictError) return { status: 409, message: error.message };
    if (error instanceof Error) return { status: 500, message: error.message };
    return { status: 500, message: errorMessages.commonError };
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