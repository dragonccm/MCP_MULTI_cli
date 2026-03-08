import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../constants';

interface BrutalCardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'accent' | 'success' | 'error' | 'warning';
  style?: ViewStyle;
  noPadding?: boolean;
}

export function BrutalCard({
  children,
  title,
  variant = 'default',
  style,
  noPadding = false,
}: BrutalCardProps) {
  const borderColor = {
    default: COLORS.border,
    accent: COLORS.accent,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
  }[variant];

  return (
    <View
      style={[
        styles.card,
        { borderColor },
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderRadius: BORDER.radius,
    padding: SPACING.lg,
    ...SHADOW.brutal,
  },
  noPadding: {
    padding: 0,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
});
