import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, CATEGORY_ICONS } from '../../src/constants';
import { BrutalCard, BrutalButton, LoadingState, ErrorState } from '../../src/components/ui';
import { useAuthStore, useTransactionStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary, isLoading, error, fetchSummary, fetchTransactions, transactions } = useTransactionStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const now = new Date();
    fetchSummary(now.getMonth() + 1, now.getFullYear());
    fetchTransactions();
  }, [fetchSummary, fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    const now = new Date();
    await Promise.all([
      fetchSummary(now.getMonth() + 1, now.getFullYear()),
      fetchTransactions(),
    ]);
    setRefreshing(false);
  };

  if (isLoading && !summary) {
    return <LoadingState fullScreen />;
  }

  if (error && !summary) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  const currency = user?.currency ?? 'VND';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Xin chào, {user?.name ?? 'bạn'} 👋</Text>
        <Text style={styles.greetingSubtext}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Balance Card */}
      <BrutalCard style={styles.balanceCard} variant="accent">
        <Text style={styles.balanceLabel}>SỐ DƯ THÁNG NÀY</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(summary?.balance ?? 0, currency)}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Thu nhập</Text>
            <Text style={[styles.balanceItemValue, { color: COLORS.success }]}>
              +{formatCurrency(summary?.totalIncome ?? 0, currency)}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Chi tiêu</Text>
            <Text style={[styles.balanceItemValue, { color: COLORS.error }]}>
              -{formatCurrency(summary?.totalExpense ?? 0, currency)}
            </Text>
          </View>
        </View>
      </BrutalCard>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <BrutalButton
          title="+ Giao dịch"
          onPress={() => router.push('/transaction/create')}
          variant="primary"
          size="md"
        />
        <BrutalButton
          title="+ Tài sản"
          onPress={() => router.push('/asset/create')}
          variant="secondary"
          size="md"
        />
      </View>

      {/* Spending by Category */}
      {summary?.byCategory && Object.keys(summary.byCategory).length > 0 && (
        <BrutalCard title="Chi tiêu theo danh mục" style={styles.section}>
          {Object.entries(summary.byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, amount]) => (
              <View key={category} style={styles.categoryRow}>
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category] ?? '📌'}</Text>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(amount, currency)}
                </Text>
              </View>
            ))}
        </BrutalCard>
      )}

      {/* Recent Transactions */}
      <BrutalCard title="Giao dịch gần đây" style={styles.section}>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            <BrutalButton
              title="Thêm giao dịch đầu tiên"
              onPress={() => router.push('/transaction/create')}
              variant="outline"
              size="sm"
            />
          </View>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.recentTx}>
              <Text style={styles.txIcon}>{CATEGORY_ICONS[tx.category] ?? '📌'}</Text>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc} numberOfLines={1}>
                  {tx.description || tx.category}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.date).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: tx.type === 'income' || tx.type === 'receivable' ? COLORS.success : COLORS.error },
                ]}
              >
                {tx.type === 'income' || tx.type === 'receivable' ? '+' : '-'}
                {formatCurrency(Math.abs(tx.amount), tx.currency)}
              </Text>
            </View>
          ))
        )}
      </BrutalCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  greeting: {
    marginBottom: SPACING.xl,
  },
  greetingText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  greetingSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  balanceCard: {
    marginBottom: SPACING.xl,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  balanceItem: {
    flex: 1,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  balanceItemLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  balanceItemValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  categoryName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.error,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  recentTx: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  txIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  txDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  txAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
