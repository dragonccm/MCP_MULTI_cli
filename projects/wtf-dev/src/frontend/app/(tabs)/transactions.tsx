import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';
import { transactionService } from '../../src/services/dataService';
import { TransactionList } from '../../src/features/transactions/components/TransactionList';
import { BrutalButton, BrutalInput, EmptyState, LoadingState } from '../../src/components/ui';

export default function TransactionsScreen(): React.JSX.Element {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await transactionService.fetchAll();
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading transactions..." />
      </SafeAreaView>
    );
  }

  const allTransactions = searchQuery
    ? transactionService.search(searchQuery)
    : transactionService.getAll();

  const totalIncome = transactionService.getTotalIncome();
  const totalExpense = transactionService.getTotalExpense();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <BrutalButton
            title="+ Add"
            onPress={() => router.push('/transactions/add')}
            size="sm"
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: colors.successBg }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              +{new Intl.NumberFormat('vi-VN').format(totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: colors.errorBg }]}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              -{new Intl.NumberFormat('vi-VN').format(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Search */}
        <BrutalInput
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Transaction List */}
        {allTransactions.length > 0 ? (
          <TransactionList
            transactions={allTransactions}
            headerTitle={searchQuery ? `Results (${allTransactions.length})` : 'All Transactions'}
          />
        ) : searchQuery ? (
          <EmptyState
            icon="search-outline"
            title="No Results"
            description={`No transactions found for "${searchQuery}". Try a different keyword.`}
          />
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions"
            description="Start recording your income and expenses."
            action={
              <BrutalButton
                title="Add Transaction"
                onPress={() => router.push('/transactions/add')}
              />
            }
          />
        )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  footer: {
    height: spacing.xxxl,
  },
});
