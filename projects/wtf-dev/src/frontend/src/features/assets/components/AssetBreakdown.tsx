import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderWidth, borderRadius } from '../../../theme';
import { AssetGroup } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { BrutalCard } from '../../../components/ui';

interface AssetBreakdownProps {
  groups: AssetGroup[];
  total: number;
}

export function AssetBreakdown({ groups, total }: AssetBreakdownProps): React.JSX.Element {
  return (
    <BrutalCard>
      <Text style={styles.title}>Asset Breakdown</Text>
      {groups.map((group) => {
        const percentage = total > 0 ? Math.abs(group.total / total) * 100 : 0;
        return (
          <View key={group.type} style={styles.row}>
            <View style={[styles.colorDot, { backgroundColor: group.color }]} />
            <Text style={styles.label}>{group.label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[styles.bar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: group.color }]}
              />
            </View>
            <Text style={styles.value}>{formatCurrency(group.total)}</Text>
          </View>
        );
      })}
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    width: 70,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  value: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 90,
    textAlign: 'right',
  },
});
