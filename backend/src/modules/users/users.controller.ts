import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { successResponse } from '../../utils/response';
import * as usersService from './users.service';

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await usersService.getAllUsers(page, limit);
    successResponse(res, 'Users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const promoteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    const user = await usersService.promoteUser(id, role);
    successResponse(res, 'User promoted successfully', user);
  } catch (error) {
    next(error);
  }
};