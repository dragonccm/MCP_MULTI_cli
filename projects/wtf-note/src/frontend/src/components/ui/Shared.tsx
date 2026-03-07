import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../theme';

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ text, color = COLORS.textInverse, bgColor = COLORS.primary, size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.badgeText, { color }, size === 'sm' && styles.badgeTextSm]}>{text}</Text>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  bgColor?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = COLORS.accent,
  bgColor = COLORS.surfaceAlt,
  height = 12,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const barColor = clampedProgress >= 100 ? COLORS.danger : clampedProgress >= 80 ? COLORS.warning : color;

  return (
    <View>
      <View style={[styles.progressBg, { backgroundColor: bgColor, height }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${clampedProgress}%`, backgroundColor: barColor, height },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.progressLabel, { color: barColor }]}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as number, height },
        style,
      ]}
    />
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>{actionLabel} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSm: {
    fontSize: 9,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  chipTextSelected: {
    color: COLORS.textInverse,
  },
  progressBg: {
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  progressLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'right',
    marginTop: 2,
  },
  skeleton: {
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    minHeight: 200,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyAction: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: BORDER.width,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  emptyActionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
});
