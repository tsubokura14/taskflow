import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedActor } from "@/lib/session";
import { MemberRole, canCreateWorkspace } from "@/lib/permissions";
import { ForbiddenError, errorToResponseInit } from "@/lib/errors";
import { CreateWorkspaceInput } from "@/domain/workspaceApi";

// ワークスペースの一覧を取得
export async function GET(req: NextRequest) {
    try {
        // 認証チェックを行いユーザーを取得
        const actor = await requireAuthenticatedActor();

        const workspaces = await prisma.workspace.findMany({
            where: {
                deletedAt: null,
                members: { some: { userId: actor.id } }
            },
            orderBy: { createdAt: "asc" },
        })

        return NextResponse.json(workspaces);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}

// ワークスペースを作成（認証済みなら誰でも可・作成者が自動的にAdminになる）
export async function POST(req: NextRequest) {
    try {
        const actor = await requireAuthenticatedActor();
        const body: CreateWorkspaceInput = await req.json();

        if (!canCreateWorkspace()) {
            throw new ForbiddenError();
        }
        
        const workspace = await prisma.$transaction(async (tx) => {
            const created = await tx.workspace.create({
                data: {
                    name: body.name,
                    createdBy: actor.id,
                    updatedBy: actor.id,
                },
            });

            await tx.workspaceMember.create({
                data: {
                    workspaceId: created.id,
                    userId: actor.id,
                    role: "admin" satisfies MemberRole,
                },
            });

            return created;
        })

        return NextResponse.json(workspace);
    } catch (error) {
        const { status, message } = errorToResponseInit(error);
        return NextResponse.json({ error: message }, { status });
    }
}