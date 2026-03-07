import { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponseData<T> {
  success: boolean;
  data?: T;
  message: string;
  pagination?: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  pagination?: PaginationMeta
): void {
  const response: ApiResponseData<T> = { success: true, data, message };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
): void {
  const response: ApiResponseData<null> & { errors?: Record<string, string[]> } = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success"
): void {
  sendSuccess(res, data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
