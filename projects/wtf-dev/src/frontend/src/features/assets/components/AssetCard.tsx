import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../../theme';
import { Asset } from '../../../types';
import { formatCurrency, getAssetTypeIcon, getAssetTypeColor, getAssetTypeLabel } from '../../../utils/format';
import { BrutalBadge } from '../../../components/ui';

interface AssetCardProps {
  asset: Asset;
  onPress: (asset: Asset) => void;
}

export function AssetCard({ asset, onPress }: AssetCardProps): React.JSX.Element {
  const typeColor = getAssetTypeColor(asset.type);
  const iconName = getAssetTypeIcon(asset.type) as keyof typeof Ionicons.glyphMap;
  const isNegative = asset.balance < 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(asset)}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${asset.name}, ${formatCurrency(asset.balance, asset.currency)}`}
    >
      <View style={[styles.iconBox, { backgroundColor: typeColor + '20' }]}>
        <Ionicons name={iconName} size={24} color={typeColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {asset.name}
        </Text>
        <BrutalBadge
          text={getAssetTypeLabel(asset.type)}
          bgColor={typeColor + '25'}
          color={typeColor}
        />
      </View>
      <Text style={[styles.balance, isNegative && styles.negative]}>
        {formatCurrency(asset.balance, asset.currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  balance: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  negative: {
    color: colors.error,
  },
});
