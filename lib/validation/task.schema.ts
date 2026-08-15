import { z } from "zod";

const taskStatusEnum = z.enum(["todo", "in_progress", "done"]);
const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().min(1).max(200),
    priority: taskPriorityEnum,
}).strict();

export const updateTaskSchema = z.object({
    changes: z.object({
        title: z.string().min(1).max(200),
        status: taskStatusEnum,
        priority: taskPriorityEnum,
    }).strict().partial(),
    currentVersion: z.number().int().nonnegative(),
});

export const deleteTaskSchema = z.object({
    currentVersion: z.number().int().nonnegative(),
});