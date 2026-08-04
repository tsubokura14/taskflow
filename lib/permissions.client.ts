// UI表示の出し分け専用（ボタンの表示/非表示のみ）。
// 本物の認可判定はサーバー側のRoute Handler + lib/permissions.ts（Prisma経由）が担う。
// ここでの判定結果はセキュリティ境界ではないので、常にtrueで構わない。
export function canCreateWorkspace(): boolean {
    return true;
}
export function canEditWorkspace(): boolean {
    return true;
}
export function canCreateProject(): boolean {
    return true;
}
export function canEditProject(): boolean {
    return true;
}
export function canCreateTask(): boolean {
    return true;
}
export function canEditTask(): boolean {
    return true;
}
export function canDeleteTask(): boolean {
    return true;
}
