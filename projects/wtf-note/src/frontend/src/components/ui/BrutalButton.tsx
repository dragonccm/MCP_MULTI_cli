import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../constants';

interface BrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function BrutalButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: BrutalButtonProps) {
  const bgColor = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    outline: COLORS.surface,
    danger: COLORS.error,
  }[variant];

  const txtColor = variant === 'outline' ? COLORS.text : COLORS.textOnPrimary;

  const paddingVertical = { sm: SPACING.sm, md: SPACING.md, lg: SPACING.lg }[size];
  const paddingHorizontal = { sm: SPACING.md, md: SPACING.xl, lg: SPACING.xxl }[size];
  const fontSize = { sm: FONT_SIZE.sm, md: FONT_SIZE.md, lg: FONT_SIZE.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? COLORS.borderLight : bgColor,
          paddingVertical,
          paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: txtColor, fontSize }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    ...SHADOW.brutalSm,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
