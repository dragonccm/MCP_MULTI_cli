import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { Transaction } from '../../../types';
import { groupDateLabel } from '../../../utils/format';
import { TransactionItem } from './TransactionItem';
import { BrutalCard } from '../../../components/ui';

interface TransactionListProps {
  transactions: Transaction[];
  onPressItem?: (tx: Transaction) => void;
  showHeader?: boolean;
  headerTitle?: string;
}

interface GroupedTransactions {
  label: string;
  data: Transaction[];
}

function groupTransactions(txs: Transaction[]): GroupedTransactions[] {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of txs) {
    const label = groupDateLabel(tx.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return Object.entries(groups).map(([label, data]) => ({ label, data }));
}

export function TransactionList({
  transactions,
  onPressItem,
  showHeader = true,
  headerTitle = 'Transactions',
}: TransactionListProps): React.JSX.Element {
  const grouped = groupTransactions(transactions);

  return (
    <BrutalCard noPadding>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{headerTitle}</Text>
        </View>
      )}
      {grouped.map((group) => (
        <View key={group.label}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupLabel}>{group.label}</Text>
          </View>
          <View style={styles.listContent}>
            {group.data.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} onPress={onPressItem} />
            ))}
          </View>
        </View>
      ))}
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  groupLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
});
