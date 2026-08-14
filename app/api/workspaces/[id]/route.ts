import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedActor } from "@/lib/session";
import { resolveWorkspaceRole, canEditWorkspace, canDeleteWorkspace } from "@/lib/permissions";
import {
    ForbiddenError,
    WorkspaceConflictError,
    WorkspaceNotFoundError,
    errorToResponseInit,
} from "@/lib/errors";
import { UpdateWorkspaceInput, DeleteWorkspaceInput } from "@/domain/workspaceApi";

type RouteParams = { params: Promise<{ id: string }> };

// ワークスペースを更新
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const actor = await requireAuthenticatedActor();
        const body: Pick<UpdateWorkspaceInput, "name" | "currentVersion" > = await req.json();

        // 更新対象が存在するか確認
        const existing = await prisma.workspace.findUnique({ where: { id } });
        if (!existing) throw new WorkspaceNotFoundError();

        // 編集権限の確認
        const role = await resolveWorkspaceRole(actor.id, existing.id);
        if (!canEditWorkspace(role)) throw new ForbiddenError();

        // 更新対象は一行だがidとversionの複合条件で絞り込みを行うのでupdateManyを使用する。
        // updateManyは更新した行数を返却する。
        const result = await prisma.workspace.updateMany({
            where: { id, version: body.currentVersion },
            data: { 
                name: body.name,
                updatedBy: actor.id,
                version: { increment: 1 } 
            },
        });

        // エラーを判定
        if (result.count === 0) {
            const stillExists = await prisma.workspace.findUnique({ where: { id } });
            throw stillExists ? new WorkspaceConflictError() : new WorkspaceNotFoundError();
        }

        // 更新した行を返却
        const updated = await prisma.workspace.findUniqueOrThrow({ where: { id } });
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
        const body: Pick<DeleteWorkspaceInput, "currentVersion"> = await req.json();

        const existing = await prisma.workspace.findUnique({ where: { id } });
        if (!existing) throw new WorkspaceNotFoundError();

        const role = await resolveWorkspaceRole(actor.id, existing.id);
        if (!canDeleteWorkspace(role)) throw new ForbiddenError();

        // 更新対象は一行だがidとversionの複合条件で絞り込みを行うのでupdateManyを使用する。
        // updateManyは更新した行数を返却する。
        const result = await prisma.workspace.updateMany({
            where: { id, version: body.currentVersion },
            data: { deletedAt: new Date(), updatedBy: actor.id },
        });

        // エラーを判定
        if (result.count === 0) {
            const stillExists = await prisma.workspace.findUnique({ where: { id } });
            throw stillExists ? new WorkspaceConflictError() : new WorkspaceNotFoundError();
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}
