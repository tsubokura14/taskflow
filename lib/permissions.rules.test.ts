import { describe, it, expect } from "vitest";
import { canViewTask, canEditTask, canDeleteTask, canCreateProject, canDeleteWorkspace } from "./permissions.rules";

describe("RBAC権限判定", () => {
    it("未所属（null）はいかなる操作もできない", () => {
        expect(canViewTask(null)).toBe(false);
        expect(canEditTask(null)).toBe(false);
        expect(canDeleteWorkspace(null)).toBe(false);
    });

    it("viewerは閲覧のみ可能で編集・削除はできない", () => {
        expect(canViewTask("viewer")).toBe(true);
        expect(canEditTask("viewer")).toBe(false);
        expect(canDeleteTask("viewer")).toBe(false);
    });

    it("editorはタスクの作成・編集・削除はできるが、ワークスペース削除はできない", () => {
        expect(canEditTask("editor")).toBe(true);
        expect(canDeleteTask("editor")).toBe(true);
        expect(canCreateProject("editor")).toBe(true);
        expect(canDeleteWorkspace("editor")).toBe(false);
    });

    it("adminは全操作が可能", () => {
        expect(canDeleteWorkspace("admin")).toBe(true);
        expect(canEditTask("admin")).toBe(true);
    });
});
