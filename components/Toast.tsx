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
        <div className="p-6">
            <p>{toastText}</p>
        </div>
    )
}