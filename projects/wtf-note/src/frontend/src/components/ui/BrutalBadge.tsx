import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER } from '../../constants';

interface BrutalBadgeProps {
  label: string;
  variant?: 'income' | 'expense' | 'debt' | 'receivable' | 'asset' | 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function BrutalBadge({ label, variant = 'info', size = 'md', style }: BrutalBadgeProps) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    income: { bg: COLORS.successBg, text: COLORS.success },
    expense: { bg: COLORS.errorBg, text: COLORS.error },
    debt: { bg: '#FFF0E6', text: COLORS.debt },
    receivable: { bg: '#E6F0FF', text: COLORS.receivable },
    asset: { bg: COLORS.warningBg, text: COLORS.accentDark },
    info: { bg: COLORS.infoBg, text: COLORS.info },
    success: { bg: COLORS.successBg, text: COLORS.success },
    warning: { bg: COLORS.warningBg, text: COLORS.accentDark },
    error: { bg: COLORS.errorBg, text: COLORS.error },
  };

  const colors = colorMap[variant] ?? colorMap.info;
  const paddingV = size === 'sm' ? 2 : SPACING.xs;
  const paddingH = size === 'sm' ? SPACING.sm : SPACING.md;
  const fontSize = size === 'sm' ? FONT_SIZE.xs : FONT_SIZE.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.text,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderRadius: BORDER.radiusFull,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
