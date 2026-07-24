"use client"

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Task } from "@/types";
import { useTaskStore } from "@/store/taskStore";
import { canEditTask, canDeleteTask } from "@/lib/permissions" 

const priorityLabel: Record<Task["priority"], string> = {
    low: "低",
    medium: "中",
    high: "高",
};

const priorityTone: Record<Task["priority"], string> = {
    low: "text-priority-low",
    medium: "text-priority-medium",
    high: "text-priority-high",
};

type ChildProps = {
    task: Task;
    setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
};

export function TaskCard({ task, setEditingTask }: ChildProps) {
    const removeTask = useTaskStore((state) => state.removeTask);

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

    function handleDelete() {
        if (window.confirm(`「${task.title}」を削除しますか？`)) {
            removeTask({
                id: task.id,
                currentVersion: task.version,
                loginUser: "user_001"
            });
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners} 
            className="touch-none rounded-xl border border-border bg-surface-elevated p-3 shadow-sm transition-shadow hover:shadow-md"
        >
            <p className="text-sm font-semibold text-text leading-snug">{task.title}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                <span>担当： {task.assigneeIds[0] ?? "未割当"}</span>
                <span className={`font-semibold ${priorityTone[task.priority]}`}>優先度： {priorityLabel[task.priority]}</span>
            </div>
            <div className="mt-2 flex justify-end gap-2 text-xs">
                {canEditTask() && (
                    <button 
                        // ボタンが押下されることで、ドラッグ開始として親に伝播することを阻止する
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setEditingTask(task)}
                        className="text-info hover:underline"
                    >
                        編集
                    </button>
                )}
                {canDeleteTask() && (
                    <button 
                        // ボタンが押下されることで、ドラッグ開始として親に伝播することを阻止する
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={handleDelete}
                        className="text-danger hover:underline"
                    >
                        削除
                    </button>
                )}
            </div>
        </div>
    );
}