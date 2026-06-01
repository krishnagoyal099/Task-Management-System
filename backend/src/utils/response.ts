import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  errors: Array<{ field: string; message: string }> = [],
): Response<ApiResponse> => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  if (errors.length > 0) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};