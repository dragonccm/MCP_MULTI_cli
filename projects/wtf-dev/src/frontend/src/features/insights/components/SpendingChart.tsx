import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius } from '../../../theme';
import { BrutalCard } from '../../../components/ui';

interface SpendingChartProps {
  data: Record<string, number>;
  total: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: '#FF6B35',
  transport: '#3498DB',
  shopping: '#E91E63',
  entertainment: '#9B59B6',
  bills: '#F39C12',
  health: '#E74C3C',
  education: '#1ABC9C',
  other_expense: '#95A5A6',
};

export function SpendingChart({ data, total }: SpendingChartProps): React.JSX.Element {
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <BrutalCard>
      <Text style={styles.title}>Spending by Category</Text>
      <View style={styles.barRow}>
        {sortedEntries.map(([cat, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = CATEGORY_COLORS[cat] ?? colors.textMuted;
          return (
            <View
              key={cat}
              style={[styles.barSegment, { width: `${pct}%`, backgroundColor: color }]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        {sortedEntries.map(([cat, amount]) => {
          const pct = total > 0 ? ((amount / total) * 100).toFixed(0) : '0';
          const color = CATEGORY_COLORS[cat] ?? colors.textMuted;
          return (
            <View key={cat} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {cat.replace('_', ' ')} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    height: 16,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.medium,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
