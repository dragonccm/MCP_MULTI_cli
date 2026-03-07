export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationResult;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ContactFilters {
  status?: string;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}

export interface PortfolioFilters {
  category?: string;
  page: number;
  limit: number;
}
