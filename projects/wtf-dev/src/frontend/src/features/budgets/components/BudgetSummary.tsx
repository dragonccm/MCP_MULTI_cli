import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderWidth, borderRadius } from '../../../theme';
import { Budget } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { BrutalCard } from '../../../components/ui';

interface BudgetSummaryProps {
  budgets: Budget[];
}

export function BudgetSummary({ budgets }: BudgetSummaryProps): React.JSX.Element {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudgeted;
  const progressColor = isOverBudget ? colors.error : overallProgress > 80 ? colors.warning : colors.success;

  return (
    <BrutalCard variant="elevated">
      <Text style={styles.title}>BUDGET OVERVIEW</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Budgeted</Text>
          <Text style={styles.statValue}>{formatCurrency(totalBudgeted)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={[styles.statValue, { color: progressColor }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[styles.barFill, { width: `${overallProgress}%`, backgroundColor: progressColor }]}
        />
      </View>
      <Text style={[styles.statusText, { color: progressColor }]}>
        {isOverBudget
          ? `Over budget by ${formatCurrency(totalSpent - totalBudgeted)}`
          : `${formatCurrency(totalBudgeted - totalSpent)} remaining`}
      </Text>
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  divider: {
    width: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.sm,
  },
  barContainer: {
    height: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.medium,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
});
