import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, EmptyState, Skeleton, Chip } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

type Period = 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { analytics, dashboardLoading, fetchAnalytics } = useAppStore();
  const [period, setPeriod] = React.useState<Period>('month');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchAnalytics({ period });
  }, [fetchAnalytics, period]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics({ period });
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>SPENDING ANALYTICS</Text>

      <View style={styles.periodRow}>
        {(['week', 'month', 'year'] as Period[]).map((p) => (
          <Chip
            key={p}
            label={p.toUpperCase()}
            selected={period === p}
            onPress={() => setPeriod(p)}
          />
        ))}
      </View>

      {dashboardLoading && !analytics ? (
        <View>
          <Skeleton height={120} />
          <Skeleton height={200} />
        </View>
      ) : !analytics ? (
        <EmptyState
          title="No data"
          subtitle="Add transactions to see analytics"
        />
      ) : (
        <>
          <Card title="BY CATEGORY">
            {analytics.byCategory.length === 0 ? (
              <Text style={styles.noData}>No spending data</Text>
            ) : (
              analytics.byCategory.map((cat) => (
                <View key={cat.categoryId} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catName}>{cat.categoryName}</Text>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmount}>
                      {formatCurrency(cat.amount, currency)}
                    </Text>
                    <Text style={styles.catPercent}>{cat.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card title="BY TIME">
            {analytics.byTime.length === 0 ? (
              <Text style={styles.noData}>No data for this period</Text>
            ) : (
              analytics.byTime.map((item) => (
                <View key={item.period} style={styles.timeRow}>
                  <Text style={styles.timePeriod}>{item.period}</Text>
                  <View style={styles.timeValues}>
                    <Text style={[styles.timeIncome, { color: COLORS.income }]}>
                      +{formatCurrency(item.income, currency)}
                    </Text>
                    <Text style={[styles.timeExpense, { color: COLORS.expense }]}>
                      -{formatCurrency(item.expense, currency)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </>
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
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  noData: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  catDot: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  catName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  catRight: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  catPercent: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  timePeriod: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  timeValues: {
    alignItems: 'flex-end',
  },
  timeIncome: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  timeExpense: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
