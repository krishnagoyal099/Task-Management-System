import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { successResponse } from '../../utils/response';
import * as authService from './auth.service';

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    successResponse(res, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};