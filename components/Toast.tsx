"use client"

import { useEffect } from "react";
import { ToastItem, ToastStatus, useToastStore } from "@/store/toastStore"

function ToastItemView( { item }: { item: ToastItem }) {
    const closeToast = useToastStore((state) => state.closeToast);

    useEffect(() => {
        const timer = setTimeout(() => closeToast(item.id), 5000);
        return () => clearTimeout(timer);
    }, [item.id, closeToast]);

    return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm font-medium text-text shadow-xl">
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusTone[item.status]}`} />
            {item.text}
        </div>
    )
}

const statusTone: Record<ToastStatus, string> = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info"
}

export function Toast() {
    const toastItems = useToastStore((state) => state.toastItems);

    return (
        <div className="fixed top-6 left-1/2 z-50 flex flex-col gap-2 -translate-x-1/2">
            {toastItems.map((item) => (
                <ToastItemView key={item.id} item={item} />
            ))}
        </div>
    )
}