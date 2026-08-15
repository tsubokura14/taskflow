import { z } from "zod";

export const createProjectSchema = z.object({
    workspaceId: z.string().min(1),
    name: z.string().min(1).max(200),
}).strict();

export const updateProjectSchema = z.object({
    changes: z.object({
        name: z.string().min(1).max(200),
    }).strict().partial(),
    currentVersion: z.number().int().nonnegative(),
});

export const deleteProjectSchema = z.object({
    currentVersion: z.number().int().nonnegative(),
});