import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { successResponse } from '../../utils/response';
import * as tasksService from './tasks.service';
import { GetTasksQuerySchema } from './tasks.validation';

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);
    successResponse(res, 'Task created successfully', task, 201);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as GetTasksQuerySchema;
    const result = await tasksService.getTasks(req.user.id, req.user.role, query);
    successResponse(res, 'Tasks retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const task = await tasksService.getTaskById(id, req.user.id, req.user.role);
    successResponse(res, 'Task retrieved successfully', task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const task = await tasksService.updateTask(id, req.user.id, req.user.role, req.body);
    successResponse(res, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await tasksService.deleteTask(id, req.user.id, req.user.role);
    successResponse(res, 'Task deleted successfully', null);
  } catch (error) {
    next(error);
  }
};