import { Router, RequestHandler } from 'express';
import * as tasksController from './tasks.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema, taskIdParamsSchema, getTasksQuerySchema } from './tasks.validation';

const router = Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *                 data:
 *                   $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post(
  '/',
  authenticate,
  validate({ body: createTaskSchema }),
  tasksController.createTask as RequestHandler,
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: 'Get all tasks (Users see own tasks, Admins see all)'
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, status, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/',
  authenticate,
  validate({ query: getTasksQuerySchema }),
  tasksController.getTasks as RequestHandler,
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get(
  '/:id',
  authenticate,
  validate({ params: taskIdParamsSchema }),
  tasksController.getTaskById as RequestHandler,
);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Cannot update another user's task
 *       404:
 *         description: Task not found
 */
router.patch(
  '/:id',
  authenticate,
  validate({ params: taskIdParamsSchema, body: updateTaskSchema }),
  tasksController.updateTask as RequestHandler,
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: 'Delete a task (Users: own tasks only, Admins: any task)'
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Cannot delete another user's task
 *       404:
 *         description: Task not found
 */
router.delete(
  '/:id',
  authenticate,
  validate({ params: taskIdParamsSchema }),
  tasksController.deleteTask as RequestHandler,
);

export default router;