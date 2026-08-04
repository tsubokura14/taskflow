import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedActor } from "@/lib/session";
import { resolveProjectRole, canCreateTask, canViewTask } from "@/lib/permissions";
import { ForbiddenError, errorToResponseInit } from "@/lib/errors";
import { CreateTaskInput } from "@/domain/taskApi";

export async function GET(req: NextRequest) {
    try {
        const actor = await requireAuthenticatedActor();
        const projectId = req.nextUrl.searchParams.get("projectId");
        if (!projectId) {
            return NextResponse.json({ error: "projectIdは必須です。" }, { status: 400 });
        }

        const role = await resolveProjectRole(actor.id, projectId);
        if (!canViewTask(role)) throw new ForbiddenError();

        const tasks = await prisma.task.findMany({
            where: { projectId, deletedAt: null },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(tasks);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}

export async function POST(req: NextRequest) {
    try {
        const actor = await requireAuthenticatedActor();
        const input: CreateTaskInput = await req.json();

        const role = await resolveProjectRole(actor.id, input.projectId);
        if (!canCreateTask(role)) throw new ForbiddenError();

        const task = await prisma.task.create({
            data: {
                projectId: input.projectId,
                title: input.title,
                status: "todo",
                priority: input.priority,
                assigneeIds: [actor.id],
                createdBy: actor.id,
                updatedBy: actor.id,
            },
        });
        return NextResponse.json(task);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}
