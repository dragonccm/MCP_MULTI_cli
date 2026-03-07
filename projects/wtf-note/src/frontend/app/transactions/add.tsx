import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Card, Chip } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { useForm } from '../../src/hooks';
import { transactionSchema, type TransactionForm } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';
import type { TransactionType } from '../../src/types';

const DEFAULT_CATEGORIES = [
  { id: 'food', name: '🍔 Food' },
  { id: 'transport', name: '🚗 Transport' },
  { id: 'shopping', name: '🛍️ Shopping' },
  { id: 'bills', name: '📱 Bills' },
  { id: 'health', name: '🏥 Health' },
  { id: 'entertainment', name: '🎮 Entertainment' },
  { id: 'salary', name: '💼 Salary' },
  { id: 'investment', name: '📈 Investment' },
  { id: 'other', name: '📦 Other' },
];

export default function AddTransactionScreen() {
  const { addTransaction, categories, fetchCategories } = useAppStore();
  const [txType, setTxType] = useState<TransactionType>('expense');
  const form = useForm<TransactionForm>(
    {
      type: 'expense',
      amount: 0,
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
    transactionSchema
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const displayCategories = categories.length > 0
    ? categories.map((c) => ({ id: c.id, name: c.name }))
    : DEFAULT_CATEGORIES;

  const handleTypeChange = (type: TransactionType) => {
    setTxType(type);
    form.setValue('type', type);
  };

  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      await addTransaction({
        ...data,
        type: txType,
      });
      Alert.alert('Success', 'Transaction added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              txType === 'expense' && styles.typeBtnActiveExpense,
            ]}
            onPress={() => handleTypeChange('expense')}
          >
            <Text
              style={[
                styles.typeText,
                txType === 'expense' && styles.typeTextActive,
              ]}
            >
              EXPENSE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              txType === 'income' && styles.typeBtnActiveIncome,
            ]}
            onPress={() => handleTypeChange('income')}
          >
            <Text
              style={[
                styles.typeText,
                txType === 'income' && styles.typeTextActive,
              ]}
            >
              INCOME
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Amount"
          placeholder="0"
          value={form.values.amount ? String(form.values.amount) : ''}
          onChangeText={(v) => form.setValue('amount', parseFloat(v) || 0)}
          error={form.errors.amount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categories}>
          {displayCategories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              selected={form.values.categoryId === cat.id}
              onPress={() => form.setValue('categoryId', cat.id)}
            />
          ))}
        </View>
        {form.errors.categoryId && (
          <Text style={styles.error}>{form.errors.categoryId}</Text>
        )}

        <Input
          label="Date"
          placeholder="YYYY-MM-DD"
          value={form.values.date}
          onChangeText={(v) => form.setValue('date', v)}
          error={form.errors.date}
        />

        <Input
          label="Note (Optional)"
          placeholder="What's this for?"
          value={form.values.note ?? ''}
          onChangeText={(v) => form.setValue('note', v)}
          multiline
          numberOfLines={2}
        />

        <Button
          title="Save Transaction"
          onPress={handleSubmit}
          loading={form.isSubmitting}
          fullWidth
          size="lg"
          variant={txType === 'income' ? 'success' : 'primary'}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeBtnActiveExpense: {
    backgroundColor: COLORS.expense,
    ...SHADOW.brutalSm,
  },
  typeBtnActiveIncome: {
    backgroundColor: COLORS.income,
    ...SHADOW.brutalSm,
  },
  typeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeTextActive: {
    color: COLORS.textInverse,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  error: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
});
