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
