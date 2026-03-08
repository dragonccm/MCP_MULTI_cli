import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER } from '../../src/constants';
import { BrutalCard, BrutalButton, LoadingState, ErrorState } from '../../src/components/ui';
import { useAIStore } from '../../src/stores';
import type { AIInsight } from '../../src/types';

type AdvisorTab = 'spending' | 'investment' | 'budget' | 'chat';

function InsightCard({ insight }: { insight: AIInsight | null }) {
  if (!insight) return null;

  return (
    <View style={styles.insightContainer}>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightSummary}>{insight.summary}</Text>

      {insight.details.length > 0 && (
        <View style={styles.insightSection}>
          <Text style={styles.insightSectionTitle}>📊 Chi tiết</Text>
          {insight.details.map((detail, index) => (
            <Text key={`detail-${index}`} style={styles.insightItem}>• {detail}</Text>
          ))}
        </View>
      )}

      {insight.recommendations.length > 0 && (
        <View style={styles.insightSection}>
          <Text style={styles.insightSectionTitle}>💡 Gợi ý</Text>
          {insight.recommendations.map((rec, index) => (
            <Text key={`rec-${index}`} style={styles.insightItem}>✅ {rec}</Text>
          ))}
        </View>
      )}

      <View style={styles.confidenceBar}>
        <Text style={styles.confidenceLabel}>
          Độ tin cậy: {Math.round(insight.confidence * 100)}%
        </Text>
        <View style={styles.confidenceTrack}>
          <View style={[styles.confidenceFill, { width: `${insight.confidence * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

export default function AdvisorScreen() {
  const [activeTab, setActiveTab] = useState<AdvisorTab>('spending');
  const [question, setQuestion] = useState('');
  const {
    spendingInsight,
    investmentAdvice,
    budgetRecommendation,
    chatAnswer,
    isLoading,
    error,
    fetchSpendingInsights,
    fetchInvestmentAdvice,
    fetchBudgetRecommendations,
    askQuestion,
    clearError,
  } = useAIStore();

  const tabs: { key: AdvisorTab; label: string; icon: string }[] = [
    { key: 'spending', label: 'Chi tiêu', icon: '💰' },
    { key: 'investment', label: 'Đầu tư', icon: '📈' },
    { key: 'budget', label: 'Ngân sách', icon: '📋' },
    { key: 'chat', label: 'Hỏi AI', icon: '💬' },
  ];

  const handleTabPress = async (tab: AdvisorTab) => {
    setActiveTab(tab);
    clearError();
    if (tab === 'spending' && !spendingInsight) {
      await fetchSpendingInsights();
    } else if (tab === 'investment' && !investmentAdvice) {
      await fetchInvestmentAdvice();
    } else if (tab === 'budget' && !budgetRecommendation) {
      await fetchBudgetRecommendations();
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    await askQuestion(question.trim());
  };

  const getInsightForTab = (): AIInsight | null => {
    switch (activeTab) {
      case 'spending': return spendingInsight;
      case 'investment': return investmentAdvice;
      case 'budget': return budgetRecommendation;
      default: return null;
    }
  };

  const getRefreshAction = () => {
    switch (activeTab) {
      case 'spending': return fetchSpendingInsights;
      case 'investment': return fetchInvestmentAdvice;
      case 'budget': return fetchBudgetRecommendations;
      default: return undefined;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => handleTabPress(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'chat' ? (
          <View>
            <BrutalCard style={styles.chatCard}>
              <Text style={styles.chatTitle}>🤖 Hỏi AI Advisor</Text>
              <Text style={styles.chatDesc}>
                Hỏi bất cứ điều gì về tài chính cá nhân, đầu tư, hoặc ngân sách của bạn.
              </Text>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="VD: Tôi nên tiết kiệm bao nhiêu mỗi tháng?"
                  placeholderTextColor={COLORS.textLight}
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                />
              </View>
              <BrutalButton
                title="Gửi câu hỏi"
                onPress={handleAsk}
                loading={isLoading}
                fullWidth
                disabled={!question.trim()}
              />
            </BrutalCard>

            {chatAnswer && (
              <BrutalCard title="💡 Câu trả lời" style={styles.answerCard} variant="success">
                <Text style={styles.answerText}>{chatAnswer}</Text>
              </BrutalCard>
            )}
          </View>
        ) : (
          <View>
            {isLoading ? (
              <LoadingState message="AI đang phân tích..." />
            ) : error ? (
              <ErrorState message={error} onRetry={getRefreshAction()} />
            ) : getInsightForTab() ? (
              <BrutalCard>
                <InsightCard insight={getInsightForTab()} />
              </BrutalCard>
            ) : (
              <BrutalCard>
                <View style={styles.emptyInsight}>
                  <Text style={styles.emptyIcon}>🤖</Text>
                  <Text style={styles.emptyText}>
                    Nhấn nút bên dưới để AI phân tích dữ liệu của bạn
                  </Text>
                  <BrutalButton
                    title="Phân tích ngay"
                    onPress={getRefreshAction() ?? (() => {})}
                    loading={isLoading}
                  />
                </View>
              </BrutalCard>
            )}

            {getInsightForTab() && (
              <BrutalButton
                title="Phân tích lại"
                onPress={getRefreshAction() ?? (() => {})}
                variant="outline"
                fullWidth
                style={styles.refreshButton}
                loading={isLoading}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  insightContainer: {},
  insightTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  insightSummary: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  insightSection: {
    marginBottom: SPACING.lg,
  },
  insightSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  insightItem: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    paddingLeft: SPACING.sm,
  },
  confidenceBar: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  confidenceLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER.radiusFull,
  },
  chatCard: {
    marginBottom: SPACING.lg,
  },
  chatTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chatDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  chatInputRow: {
    marginBottom: SPACING.lg,
  },
  chatInput: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    padding: SPACING.lg,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answerCard: {
    marginTop: SPACING.md,
  },
  answerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  emptyInsight: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  refreshButton: {
    marginTop: SPACING.xl,
  },
});
