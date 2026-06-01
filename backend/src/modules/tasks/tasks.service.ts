import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { Role } from '@prisma/client';
import { CreateTaskSchema, UpdateTaskSchema, GetTasksQuerySchema } from './tasks.validation';

export const createTask = async (userId: string, data: CreateTaskSchema) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status,
      userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return task;
};

export const getTasks = async (userId: string, userRole: Role, query: GetTasksQuerySchema) => {
  const { page, limit, status, search, sortBy, sortOrder } = query;

  const where = {
    ...(userRole !== Role.ADMIN && { userId }),
    ...(status && { status }),
    ...(search && {
      title: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTaskById = async (taskId: string, userId: string, userRole: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  if (userRole !== Role.ADMIN && task.userId !== userId) {
    throw new AppError(403, 'You can only view your own tasks.');
  }

  return task;
};

export const updateTask = async (
  taskId: string,
  userId: string,
  userRole: Role,
  data: UpdateTaskSchema,
) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new AppError(404, 'Task not found.');
  }

  if (userRole !== Role.ADMIN && existingTask.userId !== userId) {
    throw new AppError(403, 'You can only update your own tasks.');
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return task;
};

export const deleteTask = async (taskId: string, userId: string, userRole: Role) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask) {
    throw new AppError(404, 'Task not found.');
  }

  if (userRole !== Role.ADMIN && existingTask.userId !== userId) {
    throw new AppError(403, 'You can only delete your own tasks.');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return;
};