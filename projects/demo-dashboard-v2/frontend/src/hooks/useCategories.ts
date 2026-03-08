import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from '../types';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'userId'>) => {
      const { data } = await api.post('/categories', newCategory);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
