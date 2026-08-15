import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validation/project.schema";
import { requireAuthenticatedActor } from "@/lib/session";
import { resolveWorkspaceRole, canCreateProject, canViewProject } from "@/lib/permissions";
import { ForbiddenError, errorToResponseInit } from "@/lib/errors";

// プロジェクトの一覧を取得
export async function GET(req: NextRequest) {
    try {
        // 認証チェックを行いユーザーを取得
        const actor = await requireAuthenticatedActor();

        // ワークスペースIDを取得
        const workspaceId = req.nextUrl.searchParams.get("workspaceId");
        if (!workspaceId) {
            return NextResponse.json({ error: "workspaceIdは必須です。" }, { status: 400 });
        }

        // 閲覧権限を付与されているか判定
        const role = await resolveWorkspaceRole(actor.id, workspaceId);
        if (!canViewProject(role)) throw new ForbiddenError();

        const projects = await prisma.project.findMany({
            where: { workspaceId, deletedAt: null },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(projects);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}

// プロジェクトを作成
export async function POST(req: NextRequest) {
    try {
        const input = createProjectSchema.parse(await req.json());
        const actor = await requireAuthenticatedActor();

        // 作成権限の確認
        const role = await resolveWorkspaceRole(actor.id, input.workspaceId);
        if (!canCreateProject(role)) throw new ForbiddenError();

        const project = await prisma.project.create({
            data: {
                workspaceId: input.workspaceId,
                name: input.name,
                createdBy: actor.id,
                updatedBy: actor.id,
            },
        });

        return NextResponse.json(project);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}
