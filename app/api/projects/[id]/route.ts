import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedActor } from "@/lib/session";
import { resolveWorkspaceRole, canEditProject, canDeleteProject } from "@/lib/permissions";
import {
    ForbiddenError,
    ProjectConflictError,
    ProjectNotFoundError,
    errorToResponseInit,
} from "@/lib/errors";
import { UpdateProjectInput, DeleteProjectInput } from "@/domain/projectApi";

type RouteParams = { params: Promise<{ id: string }> };

// プロジェクトを更新
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const actor = await requireAuthenticatedActor();
        const body: Pick<UpdateProjectInput, "changes" | "currentVersion" > = await req.json();

        // 更新対象が存在するか確認
        const existing = await prisma.project.findUnique({ where: { id } });
        if (!existing) throw new ProjectNotFoundError();

        // 編集権限の確認
        const role = await resolveWorkspaceRole(actor.id, existing.workspaceId);
        if (!canEditProject(role)) throw new ForbiddenError();

        // 更新対象は一行だがidとversionの複合条件で絞り込みを行うのでupdateManyを使用する。
        // updateManyは更新した行数を返却する。
        const result = await prisma.project.updateMany({
            where: { id, version: body.currentVersion },
            data: { ...body.changes, updatedBy: actor.id, version: { increment: 1 } },
        });

        // エラーを判定
        if (result.count === 0) {
            const stillExists = await prisma.project.findUnique({ where: { id } });
            throw stillExists ? new ProjectConflictError() : new ProjectNotFoundError();
        }

        // 更新した行を返却
        const updated = await prisma.project.findUniqueOrThrow({ where: { id } });
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
        const body: Pick<DeleteProjectInput, "currentVersion"> = await req.json();

        const existing = await prisma.project.findUnique({ where: { id } });
        if (!existing) throw new ProjectNotFoundError();

        const role = await resolveWorkspaceRole(actor.id, existing.workspaceId);
        if (!canDeleteProject(role)) throw new ForbiddenError();

        // 更新対象は一行だがidとversionの複合条件で絞り込みを行うのでupdateManyを使用する。
        // updateManyは更新した行数を返却する。
        const result = await prisma.project.updateMany({
            where: { id, version: body.currentVersion },
            data: { deletedAt: new Date(), updatedBy: actor.id },
        });

        // エラーを判定
        if (result.count === 0) {
            const stillExists = await prisma.project.findUnique({ where: { id } });
            throw stillExists ? new ProjectConflictError() : new ProjectNotFoundError();
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}
