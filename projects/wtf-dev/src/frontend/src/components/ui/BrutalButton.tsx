import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderWidth, borderRadius, shadows, typography } from '../../theme';

interface BrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function BrutalButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: BrutalButtonProps): React.JSX.Element {
  const bgColor = {
    primary: colors.accent,
    secondary: colors.surface,
    outline: 'transparent',
    danger: colors.error,
  }[variant];

  const txtColor = {
    primary: colors.textInverse,
    secondary: colors.text,
    outline: colors.text,
    danger: colors.textInverse,
  }[variant];

  const padV = { sm: spacing.sm, md: spacing.md, lg: spacing.lg }[size];
  const padH = { sm: spacing.md, md: spacing.xl, lg: spacing.xxl }[size];
  const fontSize = { sm: typography.fontSize.sm, md: typography.fontSize.md, lg: typography.fontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        shadows.medium,
        {
          backgroundColor: bgColor,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: txtColor, fontSize },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
