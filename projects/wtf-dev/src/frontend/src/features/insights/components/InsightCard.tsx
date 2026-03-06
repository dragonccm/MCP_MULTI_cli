import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../../theme';
import { InsightData } from '../../../types';

interface InsightCardProps {
  insight: InsightData;
}

export function InsightCard({ insight }: InsightCardProps): React.JSX.Element {
  const bgMap: Record<InsightData['type'], string> = {
    tip: colors.infoBg,
    warning: colors.warningBg,
    achievement: colors.successBg,
  };

  const colorMap: Record<InsightData['type'], string> = {
    tip: colors.info,
    warning: colors.warning,
    achievement: colors.success,
  };

  const iconMap: Record<InsightData['type'], keyof typeof Ionicons.glyphMap> = {
    tip: 'bulb',
    warning: 'warning',
    achievement: 'trophy',
  };

  return (
    <View style={[styles.card, { backgroundColor: bgMap[insight.type] }]}>
      <View style={[styles.iconBox, { backgroundColor: colorMap[insight.type] + '30' }]}>
        <Ionicons name={iconMap[insight.type]} size={24} color={colorMap[insight.type]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});
