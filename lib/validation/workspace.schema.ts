import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().min(1).max(200),
}).strict();

export const updateWorkspaceSchema = z.object({
    name: z.string().min(1).max(200),
    currentVersion: z.number().int().nonnegative(),
});

export const deleteWorkspaceSchema = z.object({
    currentVersion: z.number().int().nonnegative(),
});