import "server-only"
import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@/lib/permissions.rules";

// --- 実効ロールの解決（DBアクセスはここだけ） ---

export async function resolveWorkspaceRole(
    actorId: string,
    workspaceId: string
): Promise<MemberRole | null> {
    const member = await prisma.workspaceMember.findUnique({
        // workspaceIdとuserIdは複合主キー
        where: { workspaceId_userId: { workspaceId, userId: actorId } },
    });
    return member ? (member.role as MemberRole) : null;
}

// プロジェクトの権限が存在しない場合、ワークスペース全体の権限を確認する。
export async function resolveProjectRole(
    actorId: string,
    projectId: string,
): Promise<MemberRole | null> {
    const projectMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: actorId } },
    });
    if (projectMember) {
        return projectMember.role as MemberRole;
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
    });
    if (!project) return null;

    return resolveWorkspaceRole(actorId, project.workspaceId);
}

// --- 権限判定（ロールが分かった後の純粋な判定。DBアクセスなし） ---
// 実体は lib/permissions.rules.ts（依存ゼロなのでVitestで直接テストできる）

export * from "@/lib/permissions.rules";