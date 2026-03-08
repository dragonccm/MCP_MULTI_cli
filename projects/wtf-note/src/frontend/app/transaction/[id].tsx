import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, CATEGORY_ICONS, TRANSACTION_TYPE_LABELS } from '../../src/constants';
import { BrutalCard, BrutalButton, BrutalBadge, LoadingState, ErrorState } from '../../src/components/ui';
import { transactionService } from '../../src/services';
import { useTransactionStore } from '../../src/stores';
import { formatCurrency, formatDate } from '../../src/utils';
import type { Transaction } from '../../src/types';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { deleteTransaction } = useTransactionStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await transactionService.getById(id);
        setTransaction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải giao dịch');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Xóa giao dịch',
      'Bạn có chắc muốn xóa giao dịch này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              router.back();
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa giao dịch');
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <LoadingState fullScreen />;
  if (error || !transaction) return <ErrorState message={error ?? 'Không tìm thấy giao dịch'} />;

  const isPositive = transaction.type === 'income' || transaction.type === 'receivable';
  const icon = CATEGORY_ICONS[transaction.category] ?? '📌';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amount Card */}
      <BrutalCard style={styles.amountCard} variant={isPositive ? 'success' : 'error'}>
        <View style={styles.amountHeader}>
          <Text style={styles.amountIcon}>{icon}</Text>
          <BrutalBadge
            label={TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
            variant={transaction.type as 'income' | 'expense' | 'debt' | 'receivable' | 'asset'}
          />
        </View>
        <Text style={[styles.amount, { color: isPositive ? COLORS.success : COLORS.error }]}>
          {isPositive ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </Text>
      </BrutalCard>

      {/* Details */}
      <BrutalCard title="Chi tiết" style={styles.section}>
        <DetailRow label="Danh mục" value={`${icon} ${transaction.category}`} />
        <DetailRow label="Ngày" value={formatDate(transaction.date)} />
        {transaction.description && (
          <DetailRow label="Mô tả" value={transaction.description} />
        )}
        {transaction.creditorDebtor && (
          <DetailRow
            label={transaction.type === 'debt' ? 'Chủ nợ' : 'Người nợ'}
            value={transaction.creditorDebtor}
          />
        )}
        <DetailRow label="Tiền tệ" value={transaction.currency} />
        {transaction.isRecurring && (
          <DetailRow label="Lặp lại" value={transaction.recurringInterval ?? 'Có'} />
        )}
        <DetailRow label="Tạo lúc" value={formatDate(transaction.createdAt, 'dd/MM/yyyy HH:mm')} />
      </BrutalCard>

      {/* Actions */}
      <View style={styles.actions}>
        <BrutalButton
          title="Sửa giao dịch"
          onPress={() => router.push({ pathname: '/transaction/edit', params: { id } })}
          variant="secondary"
          fullWidth
        />
        <BrutalButton
          title="Xóa giao dịch"
          onPress={handleDelete}
          variant="danger"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  amountCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  amountIcon: {
    fontSize: 40,
  },
  amount: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  detailLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.lg,
  },
  actions: {
    gap: SPACING.md,
  },
});
