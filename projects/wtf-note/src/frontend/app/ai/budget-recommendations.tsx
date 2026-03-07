import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, EmptyState, Skeleton, Button } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';

export default function BudgetRecommendationsScreen() {
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

  const budgetInsights = insights.filter((i) => i.type === 'budget_recommendation');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💡</Text>
        <Text style={styles.headerTitle}>BUDGET RECOMMENDATIONS</Text>
        <Text style={styles.headerSub}>
          AI-suggested budget limits based on your spending history
        </Text>
      </View>

      {aiLoading && budgetInsights.length === 0 ? (
        <View>
          <Skeleton height={100} />
          <Skeleton height={100} />
        </View>
      ) : budgetInsights.length === 0 ? (
        <EmptyState
          title="Need more history"
          subtitle="3+ months of transactions needed for recommendations"
        />
      ) : (
        budgetInsights.map((insight) => (
          <Card key={insight.id} style={styles.recCard}>
            <Text style={styles.recTitle}>{insight.title}</Text>
            <Text style={styles.recContent}>{insight.content}</Text>
            <Button
              title="Apply Budget"
              onPress={() => {}}
              variant="success"
              size="sm"
              style={styles.applyBtn}
            />
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
    textAlign: 'center',
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  recCard: {
    padding: SPACING.lg,
  },
  recTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recContent: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  applyBtn: {
    alignSelf: 'flex-start',
  },
});
