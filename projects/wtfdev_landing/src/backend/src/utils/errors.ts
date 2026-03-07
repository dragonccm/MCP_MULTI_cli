export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(details: Array<{ field: string; message: string }>) {
    super("Validation failed", 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Valid authentication required") {
    super(message, 401);
  }
}
