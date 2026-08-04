import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        const body: Pick<UpdateTaskInput, "changes" | "currentVersion"> = await req.json();

        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) throw new TaskNotFoundError();

        const role = await resolveProjectRole(actor.id, existing.projectId);
        if (!canEditTask(role)) throw new ForbiddenError();

        const result = await prisma.task.updateMany({
            where: { id, version: body.currentVersion },
            data: { ...body.changes, updatedBy: actor.id, version: { increment: 1 } },
        });

        if (result.count === 0) {
            const stillExists = await prisma.task.findUnique({ where: { id } });
            throw stillExists ? new TaskConflictError() : new TaskNotFoundError();
        }

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
        const body: Pick<DeleteTaskInput, "currentVersion"> = await req.json();

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
