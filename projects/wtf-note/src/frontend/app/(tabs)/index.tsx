import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Card, Skeleton, EmptyState } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatNumber, formatDate } from '../../src/utils';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER,
  SHADOW,
} from '../../src/theme';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { dashboard, dashboardLoading, fetchDashboard } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const currency = user?.currencyPreference ?? 'VND';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          Hello, {user?.profileName ?? 'User'} 👋
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      {dashboardLoading && !dashboard ? (
        <View>
          <Skeleton height={120} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : (
        <>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(dashboard?.totalBalance ?? 0, currency)}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceStat}>
                <Text style={styles.statLabel}>NET WORTH</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(dashboard?.netWorth ?? 0, currency)}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard} variant="success">
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.miniLabel}>INCOME</Text>
              <Text style={[styles.statAmount, { color: COLORS.income }]}>
                +{formatNumber(dashboard?.monthlyIncome ?? 0)}
              </Text>
            </Card>
            <Card style={styles.statCard} variant="danger">
              <Text style={styles.statIcon}>📉</Text>
              <Text style={styles.miniLabel}>EXPENSE</Text>
              <Text style={[styles.statAmount, { color: COLORS.expense }]}>
                -{formatNumber(dashboard?.monthlyExpense ?? 0)}
              </Text>
            </Card>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>SEE ALL →</Text>
            </TouchableOpacity>
          </View>

          {(!dashboard?.recentTransactions ||
            dashboard.recentTransactions.length === 0) ? (
            <EmptyState
              title="No transactions yet"
              subtitle="Start tracking your finances"
              actionLabel="Add Transaction"
              onAction={() => router.push('/transactions/add')}
            />
          ) : (
            dashboard.recentTransactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.txItem}>
                <View style={styles.txLeft}>
                  <Text style={styles.txNote}>{tx.note ?? 'Transaction'}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.type === 'income' ? COLORS.income : COLORS.expense },
                  ]}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, currency)}
                </Text>
              </View>
            ))
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.income }]}
                onPress={() => router.push('/transactions/add')}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionLabel}>Transaction</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
                onPress={() => router.push('/debts/add')}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionLabel}>Debt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.info }]}
                onPress={() => router.push('/assets/add')}
              >
                <Text style={styles.actionIcon}>📈</Text>
                <Text style={styles.actionLabel}>Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.warning }]}
                onPress={() => router.push('/ai/insights')}
              >
                <Text style={styles.actionIcon}>🤖</Text>
                <Text style={styles.actionLabel}>AI Advisor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  greeting: {
    marginBottom: SPACING.lg,
  },
  greetingText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  balanceStat: {
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  miniLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
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
  },
  quickActions: {
    marginTop: SPACING.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    ...SHADOW.brutalSm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
});
