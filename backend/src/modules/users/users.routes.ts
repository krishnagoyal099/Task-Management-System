import { Router, RequestHandler } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { promoteUserSchema, userIdParamsSchema } from './users.validation';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/',
  authenticate,
  requireRole(Role.ADMIN),
  usersController.getAllUsers as RequestHandler,
);

/**
 * @swagger
 * /users/{id}/promote:
 *   patch:
 *     summary: Promote a user to Admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN]
 *     responses:
 *       200:
 *         description: User promoted successfully
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/promote',
  authenticate,
  requireRole(Role.ADMIN),
  validate({ params: userIdParamsSchema, body: promoteUserSchema }),
  usersController.promoteUser as RequestHandler,
);

export default router;