"use client"

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Task } from "@/types";
import { canEditTask } from "@/lib/permissions.client"

const priorityLabel: Record<Task["priority"], string> = {
    low: "低",
    medium: "中",
    high: "高",
};

const priorityTone: Record<Task["priority"], string> = {
    low: "text-slate-500",
    medium: "text-amber-600",
    high: "text-red-600",
};

type ChildProps = {
    task: Task;
    setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
};

export function TaskCard({ task, setEditingTask }: ChildProps) {

    // attributes: role・aria-roledescription・aria-disabled・tabIndex などのアクセシビリティ用属性一式
    // listeners: ドラッグ開始を検知するイベントハンドラ一式
    // setNodeRef: 要素を「ドラッグ対象」かつ「ドロップ先」として登録する
    // transform: 元の位置からドラッグされた距離を表す座標情報（数値オブジェクト）
    // transition: ドラッグ中やドロップしたときに押しのけられる側のオブジェクトに適用するcss
    // isDragging: このオブジェクト自身がドラッグされている最中かどうか
    // ※「ドラッグ対象」は他のドラッグ対象を押しのけてドロップ可能な「ドロップ先」でもある。
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id, disabled: !canEditTask() });

    const style = {
        // ドラッグでオブジェクトが動いているように描画する
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners} 
            className="touch-none rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-1000 hover:shadow-md hover:duration-1000"
        >
            <p className="mb-2 text-sm font-semibold text-slate-900 leading-snug">{task.title}</p>
            <span className="font-semibold text-xs text-slate-500">
                担当： {task.assigneeIds[0] ?? "未割当"}
            </span>
            <div className="flex items-center justify-between gap-1 text-xs text-slate-500">
                <div className="font-semibold">
                    優先度： 
                    <span className={`${priorityTone[task.priority]}`}>{priorityLabel[task.priority]}</span>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                    {canEditTask() && (
                        <button 
                            // ボタンが押下されることで、ドラッグ開始として親に伝播することを阻止する
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => setEditingTask(task)}
                            className="text-blue-600 hover:underline"
                        >
                            編集
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}