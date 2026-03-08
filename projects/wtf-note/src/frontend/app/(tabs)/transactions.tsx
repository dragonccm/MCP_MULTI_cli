import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../src/constants';
import { TransactionItem, BrutalButton, LoadingState, EmptyState } from '../../src/components/ui';
import { useTransactionStore } from '../../src/stores';
import type { TransactionType, Transaction } from '../../src/types';

const TYPE_FILTERS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Thu nhập', value: 'income' },
  { label: 'Chi tiêu', value: 'expense' },
  { label: 'Nợ', value: 'debt' },
  { label: 'Phải thu', value: 'receivable' },
  { label: 'Tài sản', value: 'asset' },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions, isLoading, fetchTransactions, setFilter, pagination } = useTransactionStore();
  const [activeFilter, setActiveFilter] = useState<TransactionType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = useCallback((value: TransactionType | 'all') => {
    setActiveFilter(value);
    if (value === 'all') {
      setFilter({});
    } else {
      setFilter({ type: value });
    }
    fetchTransactions();
  }, [setFilter, fetchTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchTransactions(pagination.page + 1);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => router.push(`/transaction/${item.id}`)}
      style={styles.item}
    />
  );

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={TYPE_FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon="📭"
              title="Chưa có giao dịch"
              description="Thêm giao dịch đầu tiên để bắt đầu theo dõi tài chính"
              action={
                <BrutalButton
                  title="Thêm giao dịch"
                  onPress={() => router.push('/transaction/create')}
                />
              }
            />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/transaction/create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  filterList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radiusFull,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    ...SHADOW.brutalSm,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.textOnPrimary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.md,
  },
  item: {
    marginBottom: 0,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xxl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: BORDER.radiusFull,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER.widthThick,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.brutalLg,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
    marginTop: -2,
  },
});
