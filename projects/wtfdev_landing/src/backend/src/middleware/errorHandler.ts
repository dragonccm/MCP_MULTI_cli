import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    const zodErr = err as unknown as { issues: Array<{ path: string[]; message: string }> };
    const details = zodErr.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      error: "Validation failed",
      message: "Validation failed",
      details,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
}
