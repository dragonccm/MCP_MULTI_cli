import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderWidth, borderRadius, shadows } from '../../theme';

interface BrutalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'accent';
  accentColor?: string;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function BrutalCard({
  children,
  variant = 'default',
  accentColor,
  style,
  noPadding = false,
}: BrutalCardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && shadows.brutal,
        variant === 'accent' && { borderLeftWidth: 6, borderLeftColor: accentColor ?? colors.accent },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  padding: {
    padding: spacing.lg,
  },
});
