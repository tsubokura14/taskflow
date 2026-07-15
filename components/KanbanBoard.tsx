"use client"

import { useEffect, useMemo, useRef} from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    Modifier,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { canCreateTask, canEditTask } from "@/lib/permissions"
import { toastMessages } from "@/lib/messages";
import { useTaskStore } from "@/store/taskStore";
import { Task, TaskStatus } from "@/types/task";
import { Toast } from "./Toast";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { error } from "node:console";
import { errorMessages } from "@/lib/errors";

const columns: { status: TaskStatus; label: string }[] = [
    { status: "todo", label: "未着手" },
    { status: "in_progress", label: "進行中" },
    { status: "done", label: "完了" },
];

const columnTone: Record<TaskStatus, { bg: string; heading: string }> = {
    todo: { bg: "bg-todo-bg", heading: "text-todo-text" },
    in_progress: { bg: "bg-progress-bg", heading: "text-progress-text" },
    done: { bg: "bg-done-bg", heading: "text-done-text" },
};

/**
 * over.id はカラムID / タスクIDのどちらもあり得るため、
 * カラムIDかどうかを判別し、呼び出し側でTaskStatus型として扱えるようにする（型ガード）。
 */
function isTaskStatus(value: string): value is TaskStatus {
    return columns.some((column) => column.status === value);
}

function resolveNewStatus(overId: string, tasks: Task[]): TaskStatus | undefined {
    return isTaskStatus(overId)
        ? overId
        : tasks.find((task) => task.id === overId)?.status;
}

type Rect = { top: number; left: number; right: number; bottom: number };

/**
 * ドラッグされている要素（rect）がドラッグ可能領域（boundingRect）をはみ出す場合に
 * ちょうど境界線に接する位置でドラッグされている要素の描画を留める関数。
 * dnd-kit公式のrestrictToParentElement内部と同じ計算を、任意のboundingRectに対して行えるようにしたもの。
 */
function restrictToBoundingRect(
    // カーソルのオフセット量（ドラッグ開始位置を基準）
    transform: { x: number; y: number; scaleX: number; scaleY: number },
    // ドラッグ中の要素の位置とサイズ
    rect: Rect,
    // ドラッグではみ出させたくない範囲
    boundingRect: Rect
) {
    const value = { ...transform };

    if (rect.top + transform.y <= boundingRect.top) {
        // ドラッグ中の要素の上限が、境界の上端と一致する位置になるようオフセット量を上書き
        value.y = boundingRect.top - rect.top;
    } else if (rect.bottom + transform.y >= boundingRect.bottom) {
        // ドラッグ中の要素の下端が、境界の下端と一致する位置になるようオフセット量を上書き
        value.y = boundingRect.bottom - rect.bottom;
    }

    if (rect.left + transform.x <= boundingRect.left) {
        // ドラッグ中の要素の左端が、境界の左端と一致する位置になるようオフセット量を上書き
        value.x = boundingRect.left - rect.left;
    } else if (rect.right + transform.x >= boundingRect.right) {
        // ドラッグ中の要素の右端が、境界の右端と一致する位置になるようオフセット量を上書き
        value.x = boundingRect.right - rect.right;
    }

    // ドラッグしている要素のはみ出しが考慮されたオフセット量を返却
    return value;
}

function KanbanColumn({
    status,
    label,
    tasks,
}: {
    status: TaskStatus;
    label: string;
    tasks: Task[];
}) {
    // setNodeRef：要素を「ドロップ先」として登録する
    // isOver：ドラッグ中のオブジェクトが上に重なっているかどうか
    const { setNodeRef, isOver } = useDroppable({ id: status });

    const taskIds = tasks.map((task) => task.id)

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border border-border p-3 transition-colors ${columnTone[status].bg} ${isOver ? "ring-2 ring-primary" : ""}`}
        >
            <h2 className={`mb-3 text-sm font-semibold ${columnTone[status].heading}`}>{label}</h2>

            {/* SortableContext: idリストの並び替え文脈を子に供給するもの */}
            {/* strategy: ドラッグしている要素が他の要素を押しのけるときの並び替えアルゴリズム */}
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="flex min-h-10 flex-col gap-2">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>
        </div>
    )
}

export function KanbanBoard() {
    const tasks = useTaskStore((state) => state.tasks);
    const isFormOpen = useTaskStore((state) => state.isFormOpen);
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const openCreateForm = useTaskStore((state) => state.openCreateForm);
    const editTask = useTaskStore((state) => state.editTask);
    const moveTaskStatus = useTaskStore((state) => state.moveTaskStatus);
    const openToast = useTaskStore((state) => state.openToast);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const gridRef = useRef<HTMLDivElement>(null);

    const dragStartStatusRef = useRef<TaskStatus | null>(null);
    
    /**
     * ドラッグ中、カード一覧のグリッド（gridRef）の外にカードがはみ出さないよう制限するModifier。
     * containerRefを受け取る別関数を経由せず、ここで直接クロージャとしてgridRefを参照することで、
     * 「レンダー中にrefを他の関数へ引数として渡す」形を避けている
     * （react-hooks/refs ルールが、refをそのまま関数へ渡すコードに対して、
     * その関数がレンダー中に.currentを読んでいないか静的解析できず警告するため）。
     *
     * ・useMemoのコールバック自体：コンポーネントのマウント時に1回だけ実行される（第2引数が[]のため）
     * ・返す配列の中の無名関数（Modifier本体）：ドラッグ中、カーソルが動くたびに
     *   dnd-kit内部から繰り返し呼び出され、そのたびにgridRef.currentを読み直す
     */
    const modifiers = useMemo<Modifier[]>(() => [
        ({ transform, draggingNodeRect }) => {
           // ドラッグ中は毎回、コンテナの位置サイズを測り直す。
           // キャッシュしないのはスクロールやりサイズが起きても常に最新の境界で判定するため。
           const containerRect = gridRef.current?.getBoundingClientRect();
           
           if (!draggingNodeRect || !containerRect) return transform;

           return restrictToBoundingRect(transform, draggingNodeRect, containerRect);
        }
    ], []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    function handleDragStart(event: DragStartEvent) {
        const activeTask = tasks.find((task) => task.id === event.active.id);
        dragStartStatusRef.current = activeTask?.status ?? null;
    }

    // ドラッグ中の状態をリアルタイムで更新する。
    function handleDragOver(event: DragOverEvent) {
        if (!canEditTask()) return;

        // active: ドラッグしている要素
        // over: ドラッグしている要素の下に重なっている要素
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        // 重なっていたのがカラムかカードかに関わらず、そのステータスを取得する
        const newStatus = resolveNewStatus(String(over.id), tasks);

        if (newStatus && newStatus !== activeTask.status) {
            moveTaskStatus(activeTask.id, newStatus);
        }
    }

    // ドロップした結果を判定・反映させる。
    async function handleDragEnd(event: DragEndEvent) {
        if (!canEditTask()) return;

        // active: ドラッグされていた要素
        // over: ドロップされた時点で下に重なっていた要素
        const { active, over } = event;

        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;
        
        // 重なっていたのがカラムかカードかに関わらず、そのステータスを取得する
        const newStatus = resolveNewStatus(String(over.id), tasks);
        
        const startedFrom = dragStartStatusRef.current;

        // ドラッグ開始時のステータスとドロップ時のステータスが異なる場合
        if (newStatus && startedFrom && newStatus !== startedFrom) {
            // ドラッグ&ドロップした要素のステータスを変更
            const result: Error | null = await editTask(activeTask.id, { status: newStatus });
            // 更新に失敗した場合
            if (result) {
                openToast([
                    { status: "error", text: result.message },
                    { status: "error", text: errorMessages.taskUpdateFailed }
                ]);
                // 最新のデータを反映
                await fetchTasks();
                openToast([{ status: "info", text: toastMessages.syncRecentData }]);
            }
        }

        dragStartStatusRef.current = null;
    }

    return (
        <div className="p-6">
            <Toast />

            {canCreateTask() && (
                <button
                    onClick={openCreateForm}
                    className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                    + タスクを作成
                </button>
            )}

            {/* DndContext: ドラッグ&ドロップが可能なエリア */}
            {/* modifiers: ドラッグ中、マウス/タッチが動くたびに（＝毎フレーム相当）呼び出す */}
            {/* onDragOver: ドラッグ中に重なっているドロップ可能領域が切り替わるたびに呼びだす */}
            {/* onDragEnd: ドロップしたときに呼び出す */}
            <DndContext sensors={sensors} modifiers={modifiers} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div ref={gridRef} className="grid grid-cols-3 gap-5">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.status}
                            status={column.status}
                            label={column.label}
                            tasks={tasks.filter((task) => task.status === column.status)}
                        />
                    ))}
                </div>
            </DndContext>

            {isFormOpen && <TaskForm />}
        </div>
    );
}


