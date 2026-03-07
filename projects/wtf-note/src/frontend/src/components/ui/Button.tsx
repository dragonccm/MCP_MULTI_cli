import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const bgColor = {
    primary: COLORS.primary,
    secondary: COLORS.surfaceAlt,
    danger: COLORS.danger,
    success: COLORS.success,
    outline: 'transparent',
  }[variant];

  const txColor = {
    primary: COLORS.textInverse,
    secondary: COLORS.text,
    danger: COLORS.textInverse,
    success: COLORS.textInverse,
    outline: COLORS.text,
  }[variant];

  const padV = { sm: SPACING.xs, md: SPACING.sm + 2, lg: SPACING.md }[size];
  const padH = { sm: SPACING.sm, md: SPACING.md, lg: SPACING.lg }[size];
  const fontSize = { sm: FONT_SIZE.sm, md: FONT_SIZE.md, lg: FONT_SIZE.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.5 : 1,
          borderColor: variant === 'outline' ? COLORS.border : COLORS.border,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: txColor, fontSize },
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
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.brutalSm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
