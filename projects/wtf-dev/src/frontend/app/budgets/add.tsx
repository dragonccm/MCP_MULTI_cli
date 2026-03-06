import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { BrutalButton, BrutalInput, BrutalCard } from '../../src/components/ui';
import { budgetService } from '../../src/services/dataService';
import { BudgetPeriod } from '../../src/types';
import { EXPENSE_CATEGORIES } from '../../src/utils/constants';

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export default function AddBudgetScreen(): React.JSX.Element {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!selectedCategoryId) errs['category'] = 'Select a category';
    if (!amount || parseFloat(amount) <= 0) errs['amount'] = 'Enter a valid amount';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endDate = period === 'MONTHLY'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await budgetService.apiCreate({
        categoryId: selectedCategoryId,
        amount: parseFloat(amount),
        period,
        startDate,
        endDate,
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create budget.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <BrutalCard>
        <BrutalInput
          label="Budget Amount"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          error={errors['amount']}
          autoFocus
        />

        {/* Period Selector */}
        <Text style={styles.label}>PERIOD</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.periodBtn,
                period === p.value && styles.periodActive,
              ]}
              onPress={() => setPeriod(p.value)}
              accessibilityRole="button"
              accessibilityLabel={p.label}
              accessibilityState={{ selected: period === p.value }}
            >
              <Text
                style={[
                  styles.periodText,
                  period === p.value && styles.periodTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Selector */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const catIcon = cat.icon as keyof typeof Ionicons.glyphMap;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  selectedCategoryId === cat.id && styles.categoryActive,
                  selectedCategoryId === cat.id && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + '15',
                  },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
                accessibilityState={{ selected: selectedCategoryId === cat.id }}
              >
                <Ionicons
                  name={catIcon}
                  size={18}
                  color={selectedCategoryId === cat.id ? cat.color : colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategoryId === cat.id && { color: cat.color, fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors['category'] && <Text style={styles.error}>{errors['category']}</Text>}
      </BrutalCard>

      <BrutalButton
        title="Create Budget"
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        size="lg"
      />

      <BrutalButton
        title="Cancel"
        onPress={() => router.back()}
        variant="outline"
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  periodActive: {
    borderWidth: borderWidth.thick,
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
    ...shadows.small,
  },
  periodText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  periodTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  categoryActive: {
    borderWidth: borderWidth.thick,
    ...shadows.small,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: '600',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
});
