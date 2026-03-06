import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderWidth, borderRadius, typography } from '../../theme';

interface BrutalBadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function BrutalBadge({
  text,
  color = colors.text,
  bgColor = colors.lemon,
  size = 'sm',
  style,
}: BrutalBadgeProps): React.JSX.Element {
  const fontSize = size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm;
  const pad = size === 'sm' ? spacing.xs : spacing.sm;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bgColor, paddingVertical: pad - 2, paddingHorizontal: pad + 2 },
        style,
      ]}
    >
      <Text style={[styles.text, { color, fontSize }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: borderWidth.medium,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
