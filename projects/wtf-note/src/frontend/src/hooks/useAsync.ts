import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions<T> {
  fetchFn: () => Promise<T>;
  immediate?: boolean;
}

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export function useAsync<T>({ fetchFn, immediate = true }: UseAsyncOptions<T>): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, isLoading, error, execute, reset };
}
