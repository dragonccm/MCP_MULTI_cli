import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Card, Chip, EmptyState, Skeleton } from '../../src/components/ui';
import { Button } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatDate } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';
import type { TransactionType } from '../../src/types';

export default function TransactionsScreen() {
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const {
    transactions,
    transactionsLoading,
    fetchTransactions,
    removeTransaction,
  } = useAppStore();
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filtered =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeTransaction(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filters}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Income" selected={filter === 'income'} onPress={() => setFilter('income')} />
          <Chip label="Expense" selected={filter === 'expense'} onPress={() => setFilter('expense')} />
        </View>
        <Button
          title="+ Add"
          onPress={() => router.push('/transactions/add')}
          variant="primary"
          size="sm"
        />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactionsLoading && transactions.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={60} style={{ marginBottom: SPACING.sm }} />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            subtitle="Tap + to add your first transaction"
            actionLabel="Add Transaction"
            onAction={() => router.push('/transactions/add')}
          />
        ) : (
          filtered.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              style={styles.txItem}
              onLongPress={() => handleDelete(tx.id)}
              onPress={() => router.push(`/transactions/${tx.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.txLeft}>
                <View style={styles.txRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          tx.type === 'income' ? COLORS.successLight : COLORS.dangerLight,
                      },
                    ]}
                  >
                    <Text style={styles.typeText}>
                      {tx.type === 'income' ? '↑' : '↓'}
                    </Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txNote} numberOfLines={1}>
                      {tx.note ?? 'Transaction'}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  {
                    color:
                      tx.type === 'income' ? COLORS.income : COLORS.expense,
                  },
                ]}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount, currency)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: BORDER.width,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filters: {
    flexDirection: 'row',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  txLeft: {
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  typeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
  },
  txInfo: {
    flex: 1,
  },
  txNote: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  txDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    marginLeft: SPACING.sm,
  },
});
