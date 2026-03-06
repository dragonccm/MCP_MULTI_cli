import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../../theme';
import { formatCurrency } from '../../../utils/format';

interface NetWorthCardProps {
  netWorth: number;
  income: number;
  expense: number;
  currency?: string;
}

export function NetWorthCard({
  netWorth,
  income,
  expense,
  currency = 'VND',
}: NetWorthCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>NET WORTH</Text>
      <Text style={styles.amount}>{formatCurrency(netWorth, currency)}</Text>
      <View style={styles.row}>
        <View style={styles.statBox}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              +{formatCurrency(income, currency)}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <View style={[styles.dot, { backgroundColor: colors.error }]} />
          <View>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: colors.error }]}>
              -{formatCurrency(expense, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent,
    borderWidth: borderWidth.heavy,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.brutal,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 2,
    opacity: 0.8,
  },
  amount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '800',
    color: colors.textInverse,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.medium,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: spacing.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    opacity: 0.7,
    fontWeight: '600',
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
});
