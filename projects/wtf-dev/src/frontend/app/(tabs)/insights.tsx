import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { transactionService, budgetService } from '../../src/services/dataService';
import { SpendingChart } from '../../src/features/insights/components/SpendingChart';
import { InsightCard } from '../../src/features/insights/components/InsightCard';
import { BudgetSummary } from '../../src/features/budgets/components/BudgetSummary';
import { BrutalCard, BrutalButton, LoadingState } from '../../src/components/ui';
import { InsightData } from '../../src/types';
import { formatCurrency } from '../../src/utils/format';

const MOCK_INSIGHTS: InsightData[] = [
  {
    title: 'Spending Trend',
    description: 'Your food spending is 15% higher than last month. Consider meal prepping to save.',
    type: 'warning',
    icon: 'trending-up',
  },
  {
    title: 'Savings Goal',
    description: 'You saved 20% of your income this month. Great progress toward your goal!',
    type: 'achievement',
    icon: 'trophy',
  },
  {
    title: 'Budget Tip',
    description: 'Setting a weekly budget instead of monthly can help you control daily spending better.',
    type: 'tip',
    icon: 'bulb',
  },
  {
    title: 'Unusual Expense',
    description: 'Shopping expenses spiked this week. This is 3x your weekly average.',
    type: 'warning',
    icon: 'alert-circle',
  },
];

export default function InsightsScreen(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        transactionService.fetchAll(),
        budgetService.fetchAll(),
      ]);
    } catch {
      // Use cached
    } finally {
      setTick((t) => t + 1);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Analyzing your finances..." />
      </SafeAreaView>
    );
  }

  const categorySpending = transactionService.getByCategory();
  const totalExpense = transactionService.getTotalExpense();
  const totalIncome = transactionService.getTotalIncome();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(0) : '0';
  const activeBudgets = budgetService.getActiveBudgets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>Smart analysis of your finances</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <BrutalCard style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{savingsRate}%</Text>
          </BrutalCard>
          <BrutalCard style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </BrutalCard>
        </View>

        {/* Spending Chart */}
        {Object.keys(categorySpending).length > 0 && (
          <SpendingChart data={categorySpending} total={totalExpense} />
        )}

        {/* Budget Tracking */}
        <View style={styles.budgetHeader}>
          <Text style={styles.sectionTitle}>Budget Tracking</Text>
          <TouchableOpacity
            onPress={() => router.push('/budgets')}
            accessibilityRole="link"
            accessibilityLabel="Manage budgets"
          >
            <Text style={styles.manageLink}>Manage →</Text>
          </TouchableOpacity>
        </View>
        {activeBudgets.length > 0 ? (
          <BudgetSummary budgets={activeBudgets} />
        ) : (
          <BrutalCard style={styles.budgetCta}>
            <Ionicons name="pie-chart-outline" size={32} color={colors.textMuted} />
            <Text style={styles.budgetCtaText}>Set spending limits to track your budgets</Text>
            <BrutalButton
              title="Create Budget"
              onPress={() => router.push('/budgets/add')}
              size="sm"
            />
          </BrutalCard>
        )}

        {/* AI Insights */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {MOCK_INSIGHTS.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}

        {/* AI Note */}
        <BrutalCard variant="accent" accentColor={colors.info}>
          <Text style={styles.aiNote}>
            💡 AI insights improve as you log more transactions. Keep tracking for personalized recommendations!
          </Text>
        </BrutalCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  budgetCta: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  budgetCtaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  aiNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  footer: {
    height: spacing.xxxl,
  },
});
