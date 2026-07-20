export const toastMessages = {
    commonError: "エラーが発生しました。",
    syncRecentData: "最新のデータを反映しました。",
    developing: "この機能は開発中です。"
} as const;
export type ToastMessageKey = keyof typeof toastMessages;