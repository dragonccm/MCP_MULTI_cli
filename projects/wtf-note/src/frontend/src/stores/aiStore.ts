import { create } from 'zustand';
import type { AIInsight } from '../types';
import { aiService } from '../services/ai';

interface AIState {
  spendingInsight: AIInsight | null;
  investmentAdvice: AIInsight | null;
  budgetRecommendation: AIInsight | null;
  chatAnswer: string | null;
  isLoading: boolean;
  error: string | null;
  fetchSpendingInsights: () => Promise<void>;
  fetchInvestmentAdvice: () => Promise<void>;
  fetchBudgetRecommendations: () => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  spendingInsight: null,
  investmentAdvice: null,
  budgetRecommendation: null,
  chatAnswer: null,
  isLoading: false,
  error: null,

  fetchSpendingInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const insight = await aiService.getSpendingInsights();
      set({ spendingInsight: insight, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể phân tích chi tiêu';
      set({ error: message, isLoading: false });
    }
  },

  fetchInvestmentAdvice: async () => {
    set({ isLoading: true, error: null });
    try {
      const advice = await aiService.getInvestmentAdvice();
      set({ investmentAdvice: advice, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải tư vấn đầu tư';
      set({ error: message, isLoading: false });
    }
  },

  fetchBudgetRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      const recommendation = await aiService.getBudgetRecommendations();
      set({ budgetRecommendation: recommendation, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải gợi ý ngân sách';
      set({ error: message, isLoading: false });
    }
  },

  askQuestion: async (question) => {
    set({ isLoading: true, error: null, chatAnswer: null });
    try {
      const { answer } = await aiService.askQuestion(question);
      set({ chatAnswer: answer, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể trả lời câu hỏi';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
