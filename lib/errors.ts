export class CommonError extends Error {
    constructor(cause?: unknown) {
        super(errorMessages.commonError, { cause });
        this.name = "CommonError";
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