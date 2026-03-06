import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { assetService, transactionService } from '../../src/services/dataService';
import { NetWorthCard } from '../../src/features/assets/components/NetWorthCard';
import { AssetBreakdown } from '../../src/features/assets/components/AssetBreakdown';
import { TransactionList } from '../../src/features/transactions/components/TransactionList';
import { BrutalButton, EmptyState, LoadingState } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        assetService.fetchAll(),
        transactionService.fetchAll(),
      ]);
    } catch {
      // Use cached data
    } finally {
      setTick((t) => t + 1);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading your finances..." />
      </SafeAreaView>
    );
  }

  const netWorth = assetService.getNetWorth();
  const assetGroups = assetService.getGrouped();
  const recentTransactions = transactionService.getRecent(5);
  const totalIncome = transactionService.getTotalIncome();
  const totalExpense = transactionService.getTotalExpense();
  const allAssets = assetService.getAll();
  const displayName = user?.displayName ?? 'User';

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
            <Text style={styles.appName}>WTF Finance</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/transactions/add')}
            accessibilityRole="button"
            accessibilityLabel="Add transaction"
          >
            <Ionicons name="add" size={24} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Net Worth */}
        <NetWorthCard
          netWorth={netWorth}
          income={totalIncome}
          expense={totalExpense}
        />

        {/* Quick Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.mint }]}
            onPress={() => router.push('/assets/add')}
            accessibilityRole="button"
            accessibilityLabel="Add asset"
          >
            <Ionicons name="add-circle" size={20} color={colors.text} />
            <Text style={styles.actionText}>Add Asset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.lavender }]}
            onPress={() => router.push('/transactions/add')}
            accessibilityRole="button"
            accessibilityLabel="Add transaction"
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.text} />
            <Text style={styles.actionText}>Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.peach }]}
            onPress={() => router.push('/(tabs)/insights')}
            accessibilityRole="button"
            accessibilityLabel="View insights"
          >
            <Ionicons name="bulb" size={20} color={colors.text} />
            <Text style={styles.actionText}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Asset Breakdown */}
        {allAssets.length > 0 ? (
          <AssetBreakdown groups={assetGroups} total={Math.abs(netWorth)} />
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No Assets Yet"
            description="Add your first asset to start tracking your finances."
            action={
              <BrutalButton
                title="Add Asset"
                onPress={() => router.push('/assets/add')}
                size="sm"
              />
            }
          />
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          <TransactionList
            transactions={recentTransactions}
            showHeader={false}
          />
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions"
            description="Record your first transaction to see activity here."
            action={
              <BrutalButton
                title="Add Transaction"
                onPress={() => router.push('/transactions/add')}
                size="sm"
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
  greeting: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  footer: {
    height: spacing.xxxl,
  },
});
