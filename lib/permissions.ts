import "server-only"
import { prisma } from "@/lib/prisma";

export type MemberRole = "admin" | "editor" | "viewer";

const ROLE_RANK: Record<MemberRole, number> = {
    viewer: 0,
    editor: 1,
    admin: 2
};

function hasAtLeast(role: MemberRole | null, minimum: MemberRole): boolean {
    if (!role) return false;
    return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

// --- 実効ロールの解決（DBアクセスはここだけ） ---

export async function resolveWorkspaceRole(
    actorId: string,
    workspaceId: string
): Promise<MemberRole | null> {
    const member = await prisma.workspaceMember.findUnique({
        // workspaceIdとuserIdは複合主キー
        where: { workspaceId_userId: { workspaceId, userId: actorId } },
    });
    if (member) return member.role as MemberRole;

    // ゲスト（匿名）ユーザーには、個別のメンバーシップがなくても閲覧専用でデモを見せる
    const user = await prisma.user.findUnique({
        where: { id: actorId },
        select: { isAnonymous: true },
    });
    return user?.isAnonymous ? "viewer" : null;
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

// ワークスペースは認証済みであれば誰でも新規作成できる（作成者が自動的にAdminになる想定）
export function canCreateWorkspace(): boolean {
    return true;
}
export function canViewWorkspace(role: MemberRole | null): boolean {
    return hasAtLeast(role, "viewer");
}
export function canEditWorkspace(role: MemberRole | null): boolean {
    return hasAtLeast(role, "admin");
}
export function canDeleteWorkspace(role: MemberRole | null): boolean {
    return hasAtLeast(role, "admin");
}

export function canCreateProject(role: MemberRole | null): boolean {
    return hasAtLeast(role, "editor");
}
export function canViewProject(role: MemberRole | null): boolean {
    return hasAtLeast(role, "viewer");
}
export function canEditProject(role: MemberRole | null): boolean {
    return hasAtLeast(role, "editor");
}
export function canDeleteProject(role: MemberRole | null): boolean {
    return hasAtLeast(role, "admin");
}

export function canCreateTask(role: MemberRole | null): boolean {
    return hasAtLeast(role, "editor");
}
export function canViewTask(role: MemberRole | null): boolean {
    return hasAtLeast(role, "viewer");
}
export function canEditTask(role: MemberRole | null): boolean {
    return hasAtLeast(role, "editor");
}
export function canDeleteTask(role: MemberRole | null): boolean {
    return hasAtLeast(role, "editor");
}