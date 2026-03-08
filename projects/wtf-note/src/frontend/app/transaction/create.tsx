import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER, CATEGORIES, CATEGORY_ICONS, TRANSACTION_TYPE_LABELS } from '../../src/constants';
import { BrutalButton, BrutalInput, BrutalSelect } from '../../src/components/ui';
import { useForm } from '../../src/hooks';
import { transactionSchema, type TransactionInput } from '../../src/utils';
import { useTransactionStore } from '../../src/stores';

const TYPE_OPTIONS = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1),
  icon: CATEGORY_ICONS[cat],
}));

export default function CreateTransactionScreen() {
  const router = useRouter();
  const { createTransaction } = useTransactionStore();

  const form = useForm<typeof transactionSchema>({
    schema: transactionSchema,
    initialValues: {
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      creditorDebtor: '',
      currency: 'VND',
      isRecurring: false,
      recurringInterval: undefined,
    },
    onSubmit: async (values: TransactionInput) => {
      await createTransaction({
        ...values,
        amount: Number(values.amount),
      });
      router.back();
    },
  });

  const showCreditorField = form.values.type === 'debt' || form.values.type === 'receivable';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type Selection */}
        <BrutalSelect
          label="Loại giao dịch"
          options={TYPE_OPTIONS}
          value={form.values.type}
          onSelect={(v) => form.setValue('type', v as TransactionInput['type'])}
          error={form.errors.type}
        />

        {/* Amount */}
        <BrutalInput
          label="Số tiền"
          placeholder="0"
          value={form.values.amount ? String(form.values.amount) : ''}
          onChangeText={(v) => {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''));
            form.setValue('amount', isNaN(num) ? 0 : num);
          }}
          error={form.errors.amount}
          keyboardType="numeric"
        />

        {/* Category */}
        <BrutalSelect
          label="Danh mục"
          options={CATEGORY_OPTIONS}
          value={form.values.category}
          onSelect={(v) => form.setValue('category', v)}
          error={form.errors.category}
        />

        {/* Date */}
        <BrutalInput
          label="Ngày (YYYY-MM-DD)"
          placeholder="2024-01-15"
          value={form.values.date}
          onChangeText={(v) => form.setValue('date', v)}
          error={form.errors.date}
        />

        {/* Description */}
        <BrutalInput
          label="Mô tả (tuỳ chọn)"
          placeholder="VD: Ăn trưa với đồng nghiệp"
          value={form.values.description ?? ''}
          onChangeText={(v) => form.setValue('description', v)}
          multiline
          numberOfLines={2}
        />

        {/* Creditor/Debtor */}
        {showCreditorField && (
          <BrutalInput
            label={form.values.type === 'debt' ? 'Chủ nợ' : 'Người nợ'}
            placeholder="Tên người liên quan"
            value={form.values.creditorDebtor ?? ''}
            onChangeText={(v) => form.setValue('creditorDebtor', v)}
          />
        )}

        {/* Currency */}
        <BrutalInput
          label="Tiền tệ"
          value={form.values.currency}
          onChangeText={(v) => form.setValue('currency', v.toUpperCase())}
          maxLength={3}
          autoCapitalize="characters"
        />

        {form.submitError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {form.submitError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <BrutalButton
            title="Lưu giao dịch"
            onPress={form.handleSubmit}
            loading={form.isSubmitting}
            fullWidth
            size="lg"
          />
          <BrutalButton
            title="Hủy"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
          />
        </View>
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
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: BORDER.radius,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
});
