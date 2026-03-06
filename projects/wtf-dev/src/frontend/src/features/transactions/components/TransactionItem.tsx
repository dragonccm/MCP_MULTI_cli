import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius } from '../../../theme';
import { Transaction, TransactionType } from '../../../types';
import { formatCurrency, formatDateShort } from '../../../utils/format';
import { ALL_CATEGORIES } from '../../../utils/constants';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps): React.JSX.Element {
  const isIncome = transaction.type === TransactionType.INCOME;
  const category = ALL_CATEGORIES.find((c) => c.id === transaction.category);
  const iconName = (category?.icon ?? 'help-circle') as keyof typeof Ionicons.glyphMap;
  const catColor = category?.color ?? colors.textMuted;
  const displayCurrency = transaction.currency ?? 'VND';
  const displayDescription = transaction.description ?? '';
  const displayAssetName = transaction.assetName ?? transaction.asset?.name ?? '';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.85}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${displayDescription}, ${formatCurrency(transaction.amount, displayCurrency)}`}
    >
      <View style={[styles.iconBox, { backgroundColor: catColor + '20' }]}>
        <Ionicons name={iconName} size={20} color={catColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {displayDescription}
        </Text>
        <Text style={styles.meta}>
          {category?.name ?? transaction.category ?? 'Uncategorized'} · {displayAssetName}
        </Text>
      </View>
      <View style={styles.amountBox}>
        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, displayCurrency)}
        </Text>
        <Text style={styles.date}>{formatDateShort(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.error,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});
