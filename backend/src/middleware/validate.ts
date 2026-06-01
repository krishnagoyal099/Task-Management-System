import { Response, NextFunction, Request } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/response';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...formatZodErrors(result.error, 'body'),
        );
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...formatZodErrors(result.error, 'query'),
        );
      } else {
        req.query = result.data as typeof req.query;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...formatZodErrors(result.error, 'params'),
        );
      } else {
        req.params = result.data as typeof req.params;
      }
    }

    if (errors.length > 0) {
      errorResponse(res, 'Validation failed', 400, errors);
      return;
    }

    next();
  };
};

const formatZodErrors = (
  error: ZodError,
  prefix: string,
): Array<{ field: string; message: string }> => {
  return error.errors.map((err) => ({
    field: `${prefix}.${err.path.join('.')}`,
    message: err.message,
  }));
};