"use client"

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore"

export function Toast() {
    const isToastDisplay = useTaskStore((state) => state.isToastDisplay);
    const toastText = useTaskStore((state) => state.toastText);
    const closeToast = useTaskStore((state) => state.closeToast);

    useEffect(() => {
        if (!isToastDisplay) return;

        const timer = setTimeout(() => {
            closeToast();
        }, 3000);    

        return () => clearTimeout(timer);

        // toastText: 「新しいトーストが来たこと」を検知させる
        // closeToast: lintの警告解消のため
    }, [isToastDisplay, toastText, closeToast]); 

    if (!isToastDisplay || toastText === "") return null;

    return (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm font-medium text-text shadow-xl">
                <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                {toastText}
            </div>
        </div>
    )
}