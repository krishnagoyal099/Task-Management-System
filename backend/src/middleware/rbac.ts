import { Response, NextFunction, Request } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/response';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      errorResponse(res, 'You do not have permission to perform this action.', 403);
      return;
    }

    next();
  };
};

export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: AuthenticatedRequest) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    if (authReq.user.role === Role.ADMIN) {
      next();
      return;
    }

    const resourceUserId = getUserIdFromParams(authReq);
    if (authReq.user.id !== resourceUserId) {
      errorResponse(res, 'You can only access your own resources.', 403);
      return;
    }

    next();
  };
};