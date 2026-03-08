import apiClient from './apiClient';
import type { ApiResponse, AIInsight } from '../types';

interface AIAnalysisResponse {
  insights: string;
  dataPoints: number;
  period?: { startDate: string; endDate: string };
}

function parseAIResponse(raw: AIAnalysisResponse, type: AIInsight['type']): AIInsight {
  const lines = raw.insights.split('\n').filter(Boolean);
  const title = lines[0] ?? 'Phân tích';
  const details = lines.slice(1).filter((l) => !l.startsWith('- Khuyến nghị'));
  const recommendations = lines.filter((l) => l.startsWith('- Khuyến nghị') || l.startsWith('- Nên'));

  return {
    id: `${type}-${Date.now()}`,
    type,
    title,
    summary: raw.insights.slice(0, 200),
    details: details.length > 0 ? details : [raw.insights],
    recommendations: recommendations.length > 0 ? recommendations : ['Tiếp tục theo dõi tài chính của bạn'],
    confidence: Math.min(raw.dataPoints / 20, 1),
    createdAt: new Date().toISOString(),
  };
}

export const aiService = {
  async getSpendingInsights(startDate?: string, endDate?: string): Promise<AIInsight> {
    const { data } = await apiClient.post<ApiResponse<AIAnalysisResponse>>('/ai/spending-insights', {
      startDate,
      endDate,
    });
    return parseAIResponse(data.data, 'spending');
  },

  async getInvestmentAdvice(portfolioId?: string): Promise<AIInsight> {
    const { data } = await apiClient.post<ApiResponse<AIAnalysisResponse>>('/ai/investment-advice', {
      portfolioId,
    });
    return parseAIResponse(data.data, 'investment');
  },

  async getBudgetRecommendations(month?: number, year?: number): Promise<AIInsight> {
    const { data } = await apiClient.post<ApiResponse<AIAnalysisResponse>>('/ai/budget-planning', {
      month,
      year,
    });
    return parseAIResponse(data.data, 'budget');
  },

  async askQuestion(question: string): Promise<{ answer: string }> {
    const { data } = await apiClient.post<ApiResponse<AIAnalysisResponse>>('/ai/spending-insights', {
      question,
    });
    return { answer: data.data.insights };
  },
};
