import { z } from 'zod';

export const promoteUserSchema = z
  .object({
    role: z.enum(['ADMIN'], {
      message: 'You can only promote users to ADMIN role',
    }),
  })
  .strict();

export const userIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type PromoteUserSchema = z.infer<typeof promoteUserSchema>;