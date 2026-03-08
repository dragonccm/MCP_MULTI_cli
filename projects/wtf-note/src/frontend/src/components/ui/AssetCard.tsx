import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../constants';
import { formatCurrency, formatPercentage } from '../../utils/format';
import { BrutalBadge } from './BrutalBadge';
import type { AssetWithValue } from '../../types';

interface AssetCardProps {
  asset: AssetWithValue;
  onPress?: () => void;
  style?: ViewStyle;
}

export function AssetCard({ asset, onPress, style }: AssetCardProps) {
  const isPositive = asset.gainLoss >= 0;

  const typeLabels: Record<string, string> = {
    stock: 'Cổ phiếu',
    crypto: 'Crypto',
    fund: 'Quỹ',
    bond: 'Trái phiếu',
    other: 'Khác',
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
        </View>
        <BrutalBadge
          label={typeLabels[asset.assetType] ?? asset.assetType}
          variant="info"
          size="sm"
        />
      </View>

      <View style={styles.valueRow}>
        <View>
          <Text style={styles.valueLabel}>Giá trị hiện tại</Text>
          <Text style={styles.valueAmount}>
            {formatCurrency(asset.currentValue, asset.currency)}
          </Text>
        </View>
        <View style={styles.gainLossContainer}>
          <Text style={[styles.gainLoss, { color: isPositive ? COLORS.success : COLORS.error }]}>
            {isPositive ? '▲' : '▼'} {formatCurrency(Math.abs(asset.gainLoss), asset.currency)}
          </Text>
          <Text style={[styles.gainLossPercent, { color: isPositive ? COLORS.success : COLORS.error }]}>
            {formatPercentage(asset.gainLossPercentage)}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailText}>SL: {asset.quantity}</Text>
        <Text style={styles.detailText}>Giá mua: {formatCurrency(asset.purchasePrice, asset.currency)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    padding: SPACING.lg,
    ...SHADOW.brutal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  symbol: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    maxWidth: 200,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  valueLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  gainLossContainer: {
    alignItems: 'flex-end',
  },
  gainLoss: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  gainLossPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
