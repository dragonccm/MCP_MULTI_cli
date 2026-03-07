import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'accent' | 'success' | 'danger' | 'warning';
}

export function Card({ children, title, style, variant = 'default' }: CardProps) {
  const accentColors = {
    default: COLORS.border,
    accent: COLORS.accent,
    success: COLORS.success,
    danger: COLORS.danger,
    warning: COLORS.warning,
  };

  return (
    <View style={[styles.card, { borderColor: accentColors[variant] }, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW.brutal,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
});
