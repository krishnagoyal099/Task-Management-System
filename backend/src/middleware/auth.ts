import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import prisma from '../utils/prisma';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { errorResponse } from '../utils/response';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Authentication required. Please provide a valid token.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      errorResponse(res, 'Authentication required. Please provide a valid token.', 401);
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      errorResponse(res, 'User no longer exists.', 401);
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      errorResponse(res, 'Invalid or expired token.', 401);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      errorResponse(res, 'Token has expired. Please login again.', 401);
      return;
    }
    next(error);
  }
};