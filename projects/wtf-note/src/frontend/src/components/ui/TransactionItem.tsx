import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../constants';
import { CATEGORY_ICONS, TRANSACTION_TYPE_LABELS } from '../../constants';
import { formatCurrency, formatRelativeDate } from '../../utils/format';
import { BrutalBadge } from './BrutalBadge';
import type { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  style?: ViewStyle;
}

export function TransactionItem({ transaction, onPress, style }: TransactionItemProps) {
  const isPositive = transaction.type === 'income' || transaction.type === 'receivable';
  const amountColor = isPositive ? COLORS.success : COLORS.error;
  const amountPrefix = isPositive ? '+' : '-';
  const icon = CATEGORY_ICONS[transaction.category] ?? '📌';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || transaction.category}
          </Text>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <BrutalBadge
            label={TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
            variant={transaction.type as 'income' | 'expense' | 'debt' | 'receivable' | 'asset'}
            size="sm"
          />
          <Text style={styles.date}>{formatRelativeDate(transaction.date)}</Text>
        </View>
        {transaction.creditorDebtor && (
          <Text style={styles.creditor}>👤 {transaction.creditorDebtor}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    padding: SPACING.md,
    ...SHADOW.brutalSm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER.radius,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  creditor: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
