import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Card, Input, Badge, ProgressBar, EmptyState, Skeleton } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatDate } from '../../src/utils';
import { debtService } from '../../src/services/data';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';
import type { DebtPayment } from '../../src/types';

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { debts, removeDebt, fetchDebts } = useAppStore();
  const debt = debts.find((d) => d.id === id);

  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    if (!id) return;
    try {
      const data = await debtService.getPayments(id);
      setPayments(data);
    } catch {
      // Silently fail
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDebts(), fetchPayments()]);
    setRefreshing(false);
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Enter a valid payment amount');
      return;
    }
    if (debt && amount > debt.remainingBalance) {
      Alert.alert('Warning', 'Payment exceeds remaining balance');
      return;
    }

    setSubmitting(true);
    try {
      await debtService.addPayment(id!, {
        amount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: paymentNote || undefined,
      });
      setPaymentAmount('');
      setPaymentNote('');
      await Promise.all([fetchDebts(), fetchPayments()]);
      Alert.alert('Success', 'Payment recorded!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record payment';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Debt', 'This will permanently remove this debt record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeDebt(id!);
            router.back();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Delete failed';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  if (!debt) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Debt not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const progress = debt.totalAmount > 0
    ? ((debt.totalAmount - debt.remainingBalance) / debt.totalAmount) * 100
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return COLORS.danger;
      case 'paid': return COLORS.success;
      default: return COLORS.warning;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'overdue': return COLORS.dangerLight;
      case 'paid': return COLORS.successLight;
      default: return COLORS.warningLight;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.contactName}>{debt.contactName}</Text>
          <Badge
            text={debt.status.toUpperCase()}
            bgColor={getStatusBg(debt.status)}
            color={getStatusColor(debt.status)}
          />
        </View>
        <Badge
          text={debt.type === 'owed' ? 'I OWE' : 'OWED TO ME'}
          bgColor={debt.type === 'owed' ? COLORS.dangerLight : COLORS.successLight}
          color={debt.type === 'owed' ? COLORS.danger : COLORS.success}
          size="sm"
        />

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>REMAINING</Text>
          <Text style={[styles.amount, { color: debt.type === 'owed' ? COLORS.danger : COLORS.success }]}>
            {formatCurrency(debt.remainingBalance, currency)}
          </Text>
          <Text style={styles.totalAmount}>
            of {formatCurrency(debt.totalAmount, currency)}
          </Text>
        </View>

        <ProgressBar
          progress={progress}
          showLabel
          color={COLORS.success}
        />
      </Card>

      {/* Details */}
      <Card title="DETAILS">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due Date</Text>
          <Text style={styles.detailValue}>{formatDate(debt.dueDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Recurring</Text>
          <Text style={styles.detailValue}>
            {debt.isRecurring ? (debt.recurrenceInterval ?? 'Yes').toUpperCase() : 'NO'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailValue}>{formatDate(debt.createdAt)}</Text>
        </View>
        {debt.paidDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid Date</Text>
            <Text style={[styles.detailValue, { color: COLORS.success }]}>
              {formatDate(debt.paidDate)}
            </Text>
          </View>
        )}
      </Card>

      {/* Record Payment */}
      {debt.status !== 'paid' && (
        <Card title="RECORD PAYMENT">
          <Input
            label="Amount"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            placeholder="0"
          />
          <Input
            label="Note (optional)"
            value={paymentNote}
            onChangeText={setPaymentNote}
            placeholder="Payment note..."
            containerStyle={styles.noteInput}
          />
          <Button
            title={submitting ? 'Recording...' : 'Record Payment'}
            onPress={handleAddPayment}
            loading={submitting}
            fullWidth
            variant="success"
          />
        </Card>
      )}

      {/* Payment History */}
      <Card title="PAYMENT HISTORY">
        {paymentsLoading ? (
          <View>
            <Skeleton height={40} />
            <Skeleton height={40} />
          </View>
        ) : payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            subtitle="Record a payment above"
          />
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount, currency)}
                </Text>
                {payment.note && (
                  <Text style={styles.paymentNote}>{payment.note}</Text>
                )}
              </View>
              <Text style={styles.paymentDate}>
                {formatDate(payment.paymentDate)}
              </Text>
            </View>
          ))
        )}
      </Card>

      {/* Delete */}
      <Button
        title="Delete Debt"
        onPress={handleDelete}
        variant="danger"
        fullWidth
        style={styles.deleteBtn}
      />
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
  notFound: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  headerCard: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  contactName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  amountLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  amount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.xs,
  },
  totalAmount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  noteInput: {
    marginTop: SPACING.sm,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  paymentAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.success,
  },
  paymentNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  paymentDate: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    marginTop: SPACING.lg,
  },
});
