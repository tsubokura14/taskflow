import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema, deleteTaskSchema } from "@/lib/validation/task.schema";
import { requireAuthenticatedActor } from "@/lib/session";
import { resolveProjectRole, canEditTask, canDeleteTask } from "@/lib/permissions";
import {
    ForbiddenError,
    TaskConflictError,
    TaskNotFoundError,
    errorToResponseInit,
} from "@/lib/errors";
import { UpdateTaskInput, DeleteTaskInput } from "@/domain/taskApi";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const actor = await requireAuthenticatedActor();
        const body = updateTaskSchema.parse(await req.json());

        // 更新対象が存在するか確認
        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) throw new TaskNotFoundError();

        // 編集権限の確認
        const role = await resolveProjectRole(actor.id, existing.projectId);
        if (!canEditTask(role)) throw new ForbiddenError();

        // 更新対象は一行だがidとversionの複合条件で絞り込みを行うのでupdateManyを使用する。
        // updateManyは更新した行数を返却する。
        const result = await prisma.task.updateMany({
            where: { id, version: body.currentVersion },
            data: { ...body.changes, updatedBy: actor.id, version: { increment: 1 } },
        });

        // エラーを判定
        if (result.count === 0) {
            const stillExists = await prisma.task.findUnique({ where: { id } });
            throw stillExists ? new TaskConflictError() : new TaskNotFoundError();
        }

        // 更新を行った行を返却
        const updated = await prisma.task.findUniqueOrThrow({ where: { id } });
        return NextResponse.json(updated);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const actor = await requireAuthenticatedActor();
        const body = deleteTaskSchema.parse(await req.json());

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) throw new TaskNotFoundError();

        const role = await resolveProjectRole(actor.id, existing.projectId);
        if (!canDeleteTask(role)) throw new ForbiddenError();

        const result = await prisma.task.updateMany({
            where: { id, version: body.currentVersion },
            data: { deletedAt: new Date(), updatedBy: actor.id },
        });

        if (result.count === 0) {
            const stillExists = await prisma.task.findUnique({ where: { id } });
            throw stillExists ? new TaskConflictError() : new TaskNotFoundError();
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}
