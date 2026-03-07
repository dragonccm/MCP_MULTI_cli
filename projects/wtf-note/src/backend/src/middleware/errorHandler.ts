import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    logger.error("Unhandled error", { error: err.message, stack: err.stack });
  }

  sendError(res, message, statusCode, err.errors);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, "Resource not found", 404);
}

export function createAppError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
}
