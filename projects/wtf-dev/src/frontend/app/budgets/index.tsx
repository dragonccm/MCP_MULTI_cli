import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';
import { budgetService } from '../../src/services/dataService';
import { BudgetCard } from '../../src/features/budgets/components/BudgetCard';
import { BudgetSummary } from '../../src/features/budgets/components/BudgetSummary';
import { BrutalButton, EmptyState, LoadingState } from '../../src/components/ui';
import { Budget } from '../../src/types';
import { ALL_CATEGORIES } from '../../src/utils/constants';

export default function BudgetsScreen(): React.JSX.Element {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await budgetService.fetchAll();
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

  const handleDelete = (budget: Budget) => {
    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await budgetService.apiDelete(budget.id);
            setTick((t) => t + 1);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete budget.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading budgets..." />
      </SafeAreaView>
    );
  }

  const budgets = budgetService.getAll();
  const activeBudgets = budgetService.getActiveBudgets();

  const getCategoryInfo = (categoryId: string) => {
    const cat = ALL_CATEGORIES.find((c) => c.id === categoryId);
    return {
      name: cat?.name ?? 'Unknown',
      color: cat?.color ?? colors.textMuted,
      icon: cat?.icon ?? 'help-circle',
    };
  };

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
          <Text style={styles.title}>Budgets</Text>
          <BrutalButton
            title="+ Add"
            onPress={() => router.push('/budgets/add')}
            size="sm"
          />
        </View>

        {budgets.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="No Budgets Yet"
            description="Set spending limits by category to keep your finances on track."
            action={
              <BrutalButton
                title="Create Budget"
                onPress={() => router.push('/budgets/add')}
              />
            }
          />
        ) : (
          <>
            {activeBudgets.length > 0 && (
              <BudgetSummary budgets={activeBudgets} />
            )}

            <Text style={styles.sectionTitle}>Active Budgets</Text>
            {activeBudgets.length > 0 ? (
              activeBudgets.map((budget) => {
                const catInfo = getCategoryInfo(budget.categoryId);
                return (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    categoryName={catInfo.name}
                    categoryColor={catInfo.color}
                    categoryIcon={catInfo.icon}
                    onPress={handleDelete}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyText}>No active budgets</Text>
            )}
          </>
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
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  footer: {
    height: spacing.xxxl,
  },
});
