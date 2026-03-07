import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Card, Badge, EmptyState, Skeleton, Button } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatDate } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function DebtsScreen() {
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { debts, debtsLoading, fetchDebts, removeDebt } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDebts();
    setRefreshing(false);
  };

  const totalOwed = debts
    .filter((d) => d.type === 'owed' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingBalance, 0);
  const totalOwing = debts
    .filter((d) => d.type === 'owing' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingBalance, 0);
  const overdueCount = debts.filter((d) => d.status === 'overdue').length;

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this debt record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeDebt(id) },
    ]);
  };

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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { borderColor: COLORS.danger }]}>
            <Text style={styles.summaryLabel}>OWED</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.danger }]}>
              {formatCurrency(totalOwed, currency)}
            </Text>
          </Card>
          <Card style={[styles.summaryCard, { borderColor: COLORS.success }]}>
            <Text style={styles.summaryLabel}>OWING</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.success }]}>
              {formatCurrency(totalOwing, currency)}
            </Text>
          </Card>
        </View>

        {overdueCount > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              ⚠️ {overdueCount} overdue debt{overdueCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEBT RECORDS</Text>
          <Button
            title="+ Add"
            onPress={() => router.push('/debts/add')}
            variant="primary"
            size="sm"
          />
        </View>

        {debtsLoading && debts.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={80} style={{ marginBottom: SPACING.sm }} />
          ))
        ) : debts.length === 0 ? (
          <EmptyState
            title="No debts"
            subtitle="Track money you owe or are owed"
            actionLabel="Add Debt"
            onAction={() => router.push('/debts/add')}
          />
        ) : (
          debts.map((debt) => (
            <TouchableOpacity
              key={debt.id}
              style={styles.debtItem}
              onPress={() => router.push(`/debts/${debt.id}`)}
              onLongPress={() => handleDelete(debt.id)}
              activeOpacity={0.7}
            >
              <View style={styles.debtHeader}>
                <View style={styles.debtLeft}>
                  <Text style={styles.debtName}>{debt.contactName}</Text>
                  <Badge
                    text={debt.type.toUpperCase()}
                    bgColor={debt.type === 'owed' ? COLORS.dangerLight : COLORS.successLight}
                    color={debt.type === 'owed' ? COLORS.danger : COLORS.success}
                    size="sm"
                  />
                </View>
                <Badge
                  text={debt.status.toUpperCase()}
                  bgColor={getStatusBg(debt.status)}
                  color={getStatusColor(debt.status)}
                />
              </View>
              <View style={styles.debtBody}>
                <View>
                  <Text style={styles.debtLabel}>Remaining</Text>
                  <Text style={styles.debtAmount}>
                    {formatCurrency(debt.remainingBalance, currency)}
                  </Text>
                </View>
                <View style={styles.debtRight}>
                  <Text style={styles.debtLabel}>Due</Text>
                  <Text style={styles.debtDate}>{formatDate(debt.dueDate)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    marginTop: SPACING.xs,
  },
  alertBox: {
    backgroundColor: COLORS.warningLight,
    borderWidth: BORDER.width,
    borderColor: COLORS.warning,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  alertText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  debtItem: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.brutalSm,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  debtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  debtName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  debtBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  debtLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  debtAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    marginTop: 2,
  },
  debtRight: {
    alignItems: 'flex-end',
  },
  debtDate: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginTop: 2,
  },
});
