import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../constants';

interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

interface BrutalSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  horizontal?: boolean;
}

export function BrutalSelect({
  label,
  options,
  value,
  onSelect,
  error,
  containerStyle,
  horizontal = false,
}: BrutalSelectProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.options, horizontal && styles.horizontal]}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                horizontal && styles.optionHorizontal,
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
            >
              {option.icon && <Text style={styles.optionIcon}>{option.icon}</Text>}
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  horizontal: {
    flexWrap: 'nowrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    backgroundColor: COLORS.surface,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    ...SHADOW.brutalSm,
  },
  optionHorizontal: {
    flex: 1,
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 16,
  },
  optionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.textOnPrimary,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
});
