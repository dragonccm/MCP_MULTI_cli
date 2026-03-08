import { Response } from 'express';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponseData<T> {
  success: boolean;
  data?: T;
  message: string;
  pagination?: PaginationInfo;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationInfo
): void {
  const response: ApiResponseData<T> = {
    success: true,
    data,
    message,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function buildPagination(page: number, limit: number, total: number): PaginationInfo {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
