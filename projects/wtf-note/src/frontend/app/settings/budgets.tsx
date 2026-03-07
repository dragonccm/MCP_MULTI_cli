import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, EmptyState, Skeleton, ProgressBar } from '../../src/components/ui';
import { Button, Input } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';
import { useForm } from '../../src/hooks';
import { budgetSchema, type BudgetForm } from '../../src/utils/validation';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

const CATEGORY_OPTIONS = [
  { id: 'food', label: '🍜 Food' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'housing', label: '🏠 Housing' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'entertainment', label: '🎮 Entertainment' },
  { id: 'health', label: '💊 Health' },
  { id: 'education', label: '📚 Education' },
  { id: 'other', label: '📦 Other' },
];

export default function BudgetsScreen() {
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { budgets, budgetsLoading, fetchBudgets, addBudget, categories } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<BudgetForm>(
    { categoryId: '', monthlyLimit: 0 },
    budgetSchema
  );

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  const handleCreateBudget = async () => {
    await form.handleSubmit(async (data) => {
      try {
        await addBudget(data);
        form.reset();
        setShowForm(false);
        Alert.alert('Success', 'Budget created!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create budget';
        Alert.alert('Error', message);
      }
    });
  };

  const existingCategoryIds = budgets.map((b) => b.categoryId);
  const availableCategories = CATEGORY_OPTIONS.filter(
    (c) => !existingCategoryIds.includes(c.id)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>BUDGET TRACKING</Text>
          <Text style={styles.subtitle}>Monthly spending limits by category</Text>
        </View>
        {!showForm && (
          <Button
            title="+ Add"
            onPress={() => setShowForm(true)}
            variant="primary"
            size="sm"
          />
        )}
      </View>

      {showForm && (
        <Card title="NEW BUDGET" variant="accent" style={styles.formCard}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          {availableCategories.length === 0 ? (
            <Text style={styles.noCategories}>All categories have budgets</Text>
          ) : (
            <View style={styles.categoryGrid}>
              {availableCategories.map((cat) => (
                <Button
                  key={cat.id}
                  title={cat.label}
                  onPress={() => form.setValue('categoryId', cat.id)}
                  variant={form.values.categoryId === cat.id ? 'primary' : 'outline'}
                  size="sm"
                />
              ))}
            </View>
          )}
          {form.errors.categoryId && (
            <Text style={styles.errorText}>{form.errors.categoryId}</Text>
          )}

          <Input
            label="Monthly Limit"
            value={form.values.monthlyLimit > 0 ? form.values.monthlyLimit.toString() : ''}
            onChangeText={(text) => form.setValue('monthlyLimit', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            error={form.errors.monthlyLimit}
          />

          <View style={styles.formActions}>
            <Button
              title={form.isSubmitting ? 'Creating...' : 'Create Budget'}
              onPress={handleCreateBudget}
              loading={form.isSubmitting}
              fullWidth
              variant="success"
            />
            <Button
              title="Cancel"
              onPress={() => { setShowForm(false); form.reset(); }}
              fullWidth
              variant="outline"
              style={styles.cancelBtn}
            />
          </View>
        </Card>
      )}

      {budgetsLoading && budgets.length === 0 ? (
        <View>
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : budgets.length === 0 ? (
        <EmptyState
          title="No budgets set"
          subtitle="Set monthly spending limits for categories"
          actionLabel="Create Budget"
          onAction={() => setShowForm(true)}
        />
      ) : (
        budgets.map((budget) => {
          const progress =
            budget.monthlyLimit > 0
              ? (budget.currentMonthSpent / budget.monthlyLimit) * 100
              : 0;
          const isOver = progress >= 100;
          const isWarning = progress >= 80;

          return (
            <Card
              key={budget.id}
              variant={isOver ? 'danger' : isWarning ? 'warning' : 'default'}
              style={styles.budgetCard}
            >
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetName}>
                  {budget.categoryName ?? CATEGORY_OPTIONS.find((c) => c.id === budget.categoryId)?.label ?? 'Category'}
                </Text>
                <Text
                  style={[
                    styles.budgetStatus,
                    { color: isOver ? COLORS.danger : isWarning ? COLORS.warning : COLORS.success },
                  ]}
                >
                  {isOver ? 'OVER BUDGET' : isWarning ? 'WARNING' : 'ON TRACK'}
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                showLabel
                color={COLORS.accent}
              />
              <View style={styles.budgetFooter}>
                <Text style={styles.budgetSpent}>
                  Spent: {formatCurrency(budget.currentMonthSpent, currency)}
                </Text>
                <Text style={styles.budgetLimit}>
                  / {formatCurrency(budget.monthlyLimit, currency)}
                </Text>
              </View>
            </Card>
          );
        })
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noCategories: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  formActions: {
    marginTop: SPACING.md,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
  budgetCard: {
    padding: SPACING.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  budgetName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  budgetStatus: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  budgetSpent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  budgetLimit: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
  },
});
