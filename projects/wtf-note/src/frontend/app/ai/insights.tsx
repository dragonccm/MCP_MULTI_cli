import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, EmptyState, Skeleton } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function AIInsightsScreen() {
  const { insights, aiLoading, fetchInsights } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const spendingInsights = insights.filter((i) => i.type === 'spending');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🤖</Text>
        <Text style={styles.headerTitle}>AI SPENDING INSIGHTS</Text>
        <Text style={styles.headerSub}>
          Smart analysis of your spending patterns and savings opportunities
        </Text>
      </View>

      {aiLoading && insights.length === 0 ? (
        <View>
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </View>
      ) : spendingInsights.length === 0 ? (
        <EmptyState
          title="Need more data"
          subtitle="Add 30+ days of transactions for AI insights"
        />
      ) : (
        spendingInsights.map((insight) => (
          <Card key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightContent}>{insight.content}</Text>
            {insight.estimatedSavings !== undefined && insight.estimatedSavings > 0 && (
              <View style={styles.savingsBox}>
                <Text style={styles.savingsLabel}>ESTIMATED SAVINGS</Text>
                <Text style={styles.savingsAmount}>
                  {formatCurrency(insight.estimatedSavings)}
                  /month
                </Text>
              </View>
            )}
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${insight.confidenceScore * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>
                {Math.round(insight.confidenceScore * 100)}%
              </Text>
            </View>
          </Card>
        ))
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  insightCard: {
    padding: SPACING.lg,
  },
  insightTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  insightContent: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  savingsBox: {
    backgroundColor: COLORS.successLight,
    borderWidth: BORDER.width,
    borderColor: COLORS.success,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  savingsLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  savingsAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.success,
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  confidenceLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  confidenceValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
});
