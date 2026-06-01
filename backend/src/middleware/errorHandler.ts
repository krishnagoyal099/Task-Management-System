import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma unique constraint violation
  if (err.message?.includes('Unique constraint') || (err as any).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this data already exists.',
    });
    return;
  }

  // Prisma record not found
  if (
    (err as any).code === 'P2025' ||
    err.message?.includes('Record to delete does not exist') ||
    err.message?.includes('Record to update not found')
  ) {
    res.status(404).json({
      success: false,
      message: 'Resource not found.',
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
    return;
  }

  // Unknown error — don't leak details in production
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
};