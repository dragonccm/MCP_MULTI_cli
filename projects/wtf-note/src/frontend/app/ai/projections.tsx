import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, EmptyState, Skeleton, Input, Button } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { formatCurrency } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

export default function ProjectionsScreen() {
  const { projections, aiLoading, fetchProjections } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [inflationRate, setInflationRate] = useState('3.0');
  const [returnRate, setReturnRate] = useState('7.0');

  useEffect(() => {
    fetchProjections({
      inflationRate: parseFloat(inflationRate),
      returnRate: parseFloat(returnRate),
    });
  }, [fetchProjections, inflationRate, returnRate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjections({
      inflationRate: parseFloat(inflationRate),
      returnRate: parseFloat(returnRate),
    });
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📈</Text>
        <Text style={styles.headerTitle}>NET WORTH PROJECTION</Text>
        <Text style={styles.headerSub}>
          Forecast your financial future based on current trends
        </Text>
      </View>

      <Card title="ASSUMPTIONS">
        <View style={styles.assumptionRow}>
          <Input
            label="Inflation Rate (%)"
            value={inflationRate}
            onChangeText={setInflationRate}
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
          <Input
            label="Return Rate (%)"
            value={returnRate}
            onChangeText={setReturnRate}
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
        </View>
        <Button
          title="Recalculate"
          onPress={onRefresh}
          variant="primary"
          size="sm"
        />
      </Card>

      {aiLoading && projections.length === 0 ? (
        <View>
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </View>
      ) : projections.length === 0 ? (
        <EmptyState
          title="No projections"
          subtitle="Add assets and transactions for projections"
        />
      ) : (
        projections.map((proj) => (
          <Card key={proj.year} style={styles.projCard}>
            <Text style={styles.projYear}>{proj.year} YEAR{proj.year > 1 ? 'S' : ''}</Text>
            <View style={styles.projRow}>
              <View style={styles.projItem}>
                <Text style={styles.projLabel}>OPTIMISTIC</Text>
                <Text style={[styles.projValue, { color: COLORS.success }]}>
                  {formatCurrency(proj.optimistic)}
                </Text>
              </View>
              <View style={styles.projItem}>
                <Text style={styles.projLabel}>BASE</Text>
                <Text style={[styles.projValue, { color: COLORS.info }]}>
                  {formatCurrency(proj.base)}
                </Text>
              </View>
              <View style={styles.projItem}>
                <Text style={styles.projLabel}>CONSERVATIVE</Text>
                <Text style={[styles.projValue, { color: COLORS.warning }]}>
                  {formatCurrency(proj.conservative)}
                </Text>
              </View>
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
    textAlign: 'center',
  },
  headerSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  assumptionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  projCard: {
    padding: SPACING.lg,
  },
  projYear: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  projRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projItem: {
    flex: 1,
    alignItems: 'center',
  },
  projLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    marginTop: 2,
  },
});
