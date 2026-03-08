import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Transaction, Summary, ChartData } from '../types';

export const useTransactions = (filters?: { month?: number; year?: number }) => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await api.get('/transactions', { params: filters });
      return data;
    },
  });
};

export const useSummary = () => {
  return useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: async () => {
      const { data } = await api.get('/stats/summary');
      return data;
    },
  });
};

export const useChartData = () => {
  return useQuery<ChartData[]>({
    queryKey: ['chartData'],
    queryFn: async () => {
      const { data } = await api.get('/stats/chart');
      return data;
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'userId'>) => {
      const { data } = await api.post('/transactions', newTransaction);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
    },
  });
};
