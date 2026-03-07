import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Card, Input, Chip } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { transactionService } from '../../src/services/data';
import { formatCurrency, formatDate } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

const CATEGORY_OPTIONS = [
  { id: 'food', label: '🍜 Food' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'housing', label: '🏠 Housing' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'entertainment', label: '🎮 Entertainment' },
  { id: 'health', label: '💊 Health' },
  { id: 'education', label: '📚 Education' },
  { id: 'salary', label: '💰 Salary' },
  { id: 'other', label: '📦 Other' },
];

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { transactions, removeTransaction, fetchTransactions } = useAppStore();
  const transaction = transactions.find((t) => t.id === id);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editType, setEditType] = useState(transaction?.type ?? 'expense');
  const [editAmount, setEditAmount] = useState(transaction?.amount.toString() ?? '');
  const [editCategory, setEditCategory] = useState(transaction?.categoryId ?? '');
  const [editDate, setEditDate] = useState(transaction?.date ?? '');
  const [editNote, setEditNote] = useState(transaction?.note ?? '');

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Transaction not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const handleSave = async () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    if (!editCategory) {
      Alert.alert('Error', 'Select a category');
      return;
    }

    setSaving(true);
    try {
      await transactionService.update(id!, {
        type: editType as 'income' | 'expense',
        amount,
        categoryId: editCategory,
        date: editDate,
        note: editNote || undefined,
      });
      await fetchTransactions();
      setEditing(false);
      Alert.alert('Success', 'Transaction updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTransaction(id!);
            router.back();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Delete failed';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  if (editing) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.editContent}>
        <Text style={styles.editTitle}>EDIT TRANSACTION</Text>

        <View style={styles.typeRow}>
          <Button
            title="Expense"
            onPress={() => setEditType('expense')}
            variant={editType === 'expense' ? 'danger' : 'outline'}
            style={styles.typeBtn}
          />
          <Button
            title="Income"
            onPress={() => setEditType('income')}
            variant={editType === 'income' ? 'success' : 'outline'}
            style={styles.typeBtn}
          />
        </View>

        <Input
          label="Amount"
          value={editAmount}
          onChangeText={setEditAmount}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              selected={editCategory === cat.id}
              onPress={() => setEditCategory(cat.id)}
            />
          ))}
        </View>

        <Input
          label="Date"
          value={editDate}
          onChangeText={setEditDate}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Note (optional)"
          value={editNote}
          onChangeText={setEditNote}
          placeholder="Add a note..."
        />

        <View style={styles.editActions}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            variant="primary"
          />
          <Button
            title="Cancel"
            onPress={() => setEditing(false)}
            fullWidth
            variant="outline"
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.viewContent}>
      <Card>
        <View style={styles.header}>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === 'income' ? COLORS.income : COLORS.expense },
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </Text>
          <Text style={styles.type}>{transaction.type.toUpperCase()}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.label}>CATEGORY</Text>
          <Text style={styles.detailValue}>
            {CATEGORY_OPTIONS.find((c) => c.id === transaction.categoryId)?.label ?? transaction.categoryId}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.label}>DATE</Text>
          <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
        </View>
        {transaction.note && (
          <View style={styles.detail}>
            <Text style={styles.label}>NOTE</Text>
            <Text style={styles.detailValue}>{transaction.note}</Text>
          </View>
        )}
        <View style={styles.detail}>
          <Text style={styles.label}>CREATED</Text>
          <Text style={styles.detailValue}>{formatDate(transaction.createdAt)}</Text>
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button
          title="✏️ Edit"
          onPress={() => setEditing(true)}
          variant="outline"
          style={styles.actionBtn}
        />
        <Button
          title="🗑️ Delete"
          onPress={handleDelete}
          variant="danger"
          style={styles.actionBtn}
        />
      </View>

      <Button title="← Back" onPress={() => router.back()} variant="outline" fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  viewContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  editContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  notFound: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  amount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
  },
  type: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: SPACING.xs,
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  editTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBtn: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  editActions: {
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    marginTop: SPACING.sm,
  },
});
