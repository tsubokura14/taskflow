import "server-only";
import { prisma } from "@/lib/prisma";

type TaskLike = { assigneeIds: string[] };
type Assignee = { id: string; name: string };

// 複数タスクの担当者IDをまとめて1クエリで名前解決する（N+1回避）
export async function attachAssignees<T extends TaskLike>(
    tasks: T[]
): Promise<(T & { assignees: Assignee[] })[]> {
    const ids = Array.from(new Set(tasks.flatMap((t) => t.assigneeIds)));
    const profiles = ids.length
        ? await prisma.profile.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
        : [];
    const nameById = new Map(profiles.map((p) => [p.id, p.name]));

    return tasks.map((task) => ({
        ...task,
        assignees: task.assigneeIds.map((id) => ({ id, name: nameById.get(id) ?? "不明なユーザー" })),
    }));
}