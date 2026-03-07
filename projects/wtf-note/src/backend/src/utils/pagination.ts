export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  queryPage?: string | number,
  queryLimit?: string | number
): PaginationParams {
  const page = Math.max(1, parseInt(String(queryPage || "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(queryLimit || "20"), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
