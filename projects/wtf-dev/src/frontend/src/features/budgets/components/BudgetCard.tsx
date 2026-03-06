import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../../theme';
import { Budget } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface BudgetCardProps {
  budget: Budget;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  onPress?: (budget: Budget) => void;
}

export function BudgetCard({
  budget,
  categoryName,
  categoryColor,
  categoryIcon,
  onPress,
}: BudgetCardProps): React.JSX.Element {
  const progress = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
  const remaining = Math.max(budget.amount - budget.spent, 0);
  const isOverBudget = budget.spent > budget.amount;
  const progressColor = isOverBudget ? colors.error : progress > 80 ? colors.warning : colors.success;
  const iconName = categoryIcon as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(budget)}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName} budget, ${formatCurrency(budget.spent)} of ${formatCurrency(budget.amount)}`}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons name={iconName} size={20} color={categoryColor} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.categoryName}>{categoryName}</Text>
          <Text style={styles.period}>{budget.period}</Text>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, { color: progressColor }]}>
            {formatCurrency(budget.spent)}
          </Text>
          <Text style={styles.total}>/ {formatCurrency(budget.amount)}</Text>
        </View>
      </View>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${progress}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.remainingText}>
          {isOverBudget
            ? `Over by ${formatCurrency(budget.spent - budget.amount)}`
            : `${formatCurrency(remaining)} remaining`}
        </Text>
        <Text style={styles.percentText}>{progress.toFixed(0)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  period: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  spent: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  total: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  barContainer: {
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  percentText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
