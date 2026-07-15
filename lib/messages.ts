export const toastMessages = {
    syncRecentData: "最新のデータを反映しました。"
} as const;
export type ToastMessageKey = keyof typeof toastMessages;