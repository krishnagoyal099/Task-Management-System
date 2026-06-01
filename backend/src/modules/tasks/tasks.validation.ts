import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),
    status: z
      .enum(['TODO', 'IN_PROGRESS', 'COMPLETED'], {
        message: 'Status must be TODO, IN_PROGRESS, or COMPLETED',
      })
      .default('TODO'),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(200, 'Title must be at most 200 characters')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .nullable()
      .optional(),
    status: z
      .enum(['TODO', 'IN_PROGRESS', 'COMPLETED'], {
        message: 'Status must be TODO, IN_PROGRESS, or COMPLETED',
      })
      .optional(),
  })
  .strict();

export const taskIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export const getTasksQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, 'Page must be at least 1'))
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100, 'Limit must be at most 100'))
    .default('10'),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'COMPLETED'])
    .optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['title', 'status', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type GetTasksQuerySchema = z.infer<typeof getTasksQuerySchema>;