import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { useForm } from '../../src/hooks';
import { debtSchema, type DebtForm } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';
import type { DebtType } from '../../src/types';

export default function AddDebtScreen() {
  const { addDebt } = useAppStore();
  const [debtType, setDebtType] = useState<DebtType>('owed');

  const form = useForm<DebtForm>(
    {
      contactName: '',
      type: 'owed',
      totalAmount: 0,
      remainingBalance: 0,
      dueDate: '',
      isRecurring: false,
      recurrenceInterval: undefined,
    },
    debtSchema
  );

  const handleTypeChange = (type: DebtType) => {
    setDebtType(type);
    form.setValue('type', type);
  };

  const handleSubmit = async () => {
    form.setValue('remainingBalance', form.values.totalAmount);
    await form.handleSubmit(async (data) => {
      await addDebt({
        ...data,
        type: debtType,
        remainingBalance: data.totalAmount,
      });
      Alert.alert('Success', 'Debt record created!', [
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
            style={[styles.typeBtn, debtType === 'owed' && styles.typeBtnActiveOwed]}
            onPress={() => handleTypeChange('owed')}
          >
            <Text style={[styles.typeText, debtType === 'owed' && styles.typeTextActive]}>
              I OWE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, debtType === 'owing' && styles.typeBtnActiveOwing]}
            onPress={() => handleTypeChange('owing')}
          >
            <Text style={[styles.typeText, debtType === 'owing' && styles.typeTextActive]}>
              OWED TO ME
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label={debtType === 'owed' ? 'Creditor Name' : 'Debtor Name'}
          placeholder="Who?"
          value={form.values.contactName}
          onChangeText={(v) => form.setValue('contactName', v)}
          error={form.errors.contactName}
        />

        <Input
          label="Total Amount"
          placeholder="0"
          value={form.values.totalAmount ? String(form.values.totalAmount) : ''}
          onChangeText={(v) => form.setValue('totalAmount', parseFloat(v) || 0)}
          error={form.errors.totalAmount}
          keyboardType="numeric"
        />

        <Input
          label="Due Date"
          placeholder="YYYY-MM-DD"
          value={form.values.dueDate}
          onChangeText={(v) => form.setValue('dueDate', v)}
          error={form.errors.dueDate}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>RECURRING</Text>
          <Switch
            value={form.values.isRecurring}
            onValueChange={(v) => form.setValue('isRecurring', v)}
            trackColor={{ false: COLORS.borderLight, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>

        {form.values.isRecurring && (
          <View style={styles.recurRow}>
            <TouchableOpacity
              style={[
                styles.recurBtn,
                form.values.recurrenceInterval === 'weekly' && styles.recurBtnActive,
              ]}
              onPress={() => form.setValue('recurrenceInterval', 'weekly')}
            >
              <Text
                style={[
                  styles.recurText,
                  form.values.recurrenceInterval === 'weekly' && styles.recurTextActive,
                ]}
              >
                WEEKLY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.recurBtn,
                form.values.recurrenceInterval === 'monthly' && styles.recurBtnActive,
              ]}
              onPress={() => form.setValue('recurrenceInterval', 'monthly')}
            >
              <Text
                style={[
                  styles.recurText,
                  form.values.recurrenceInterval === 'monthly' && styles.recurTextActive,
                ]}
              >
                MONTHLY
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Button
          title="Create Debt Record"
          onPress={handleSubmit}
          loading={form.isSubmitting}
          fullWidth
          size="lg"
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
  typeBtnActiveOwed: {
    backgroundColor: COLORS.danger,
    ...SHADOW.brutalSm,
  },
  typeBtnActiveOwing: {
    backgroundColor: COLORS.success,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  switchLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recurRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  recurBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  recurBtnActive: {
    backgroundColor: COLORS.primary,
  },
  recurText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  recurTextActive: {
    color: COLORS.textInverse,
  },
});
