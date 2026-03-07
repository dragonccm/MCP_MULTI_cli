import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Card, Badge, EmptyState, Skeleton, Button } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatPercent, getChangeColor } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';
import type { AssetType } from '../../src/types';

const ASSET_ICONS: Record<AssetType, string> = {
  stock: '📊',
  crypto: '🪙',
  real_estate: '🏠',
};

const ASSET_COLORS: Record<AssetType, string> = {
  stock: COLORS.stock,
  crypto: COLORS.crypto,
  real_estate: COLORS.realEstate,
};

export default function AssetsScreen() {
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { assets, portfolio, assetsLoading, fetchAssets, fetchPortfolio, removeAsset } =
    useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchPortfolio();
  }, [fetchAssets, fetchPortfolio]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAssets(), fetchPortfolio()]);
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this asset?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAsset(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {portfolio && (
          <Card style={styles.portfolioCard}>
            <Text style={styles.portfolioLabel}>PORTFOLIO VALUE</Text>
            <Text style={styles.portfolioValue}>
              {formatCurrency(portfolio.totalValue, currency)}
            </Text>
            <View style={styles.portfolioStats}>
              <View>
                <Text style={styles.pStatLabel}>INVESTED</Text>
                <Text style={styles.pStatValue}>
                  {formatCurrency(portfolio.totalInvested, currency)}
                </Text>
              </View>
              <View style={styles.pStatRight}>
                <Text style={styles.pStatLabel}>GAIN/LOSS</Text>
                <Text
                  style={[
                    styles.pStatValue,
                    { color: getChangeColor(portfolio.totalGainLoss) },
                  ]}
                >
                  {formatCurrency(portfolio.totalGainLoss, currency)}
                </Text>
              </View>
            </View>

            {portfolio.allocation.length > 0 && (
              <View style={styles.allocationBar}>
                {portfolio.allocation.map((item) => (
                  <View
                    key={item.type}
                    style={[
                      styles.allocationSegment,
                      {
                        flex: item.percentage,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {portfolio.allocation.map((item) => (
              <View key={item.type} style={styles.allocationRow}>
                <View style={[styles.allocationDot, { backgroundColor: item.color }]} />
                <Text style={styles.allocationLabel}>{item.label}</Text>
                <Text style={styles.allocationPercent}>
                  {item.percentage.toFixed(0)}%
                </Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ASSETS</Text>
          <Button
            title="+ Add"
            onPress={() => router.push('/assets/add')}
            variant="primary"
            size="sm"
          />
        </View>

        {assetsLoading && assets.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={80} style={{ marginBottom: SPACING.sm }} />
          ))
        ) : assets.length === 0 ? (
          <EmptyState
            title="No assets yet"
            subtitle="Start tracking your investments"
            actionLabel="Add Asset"
            onAction={() => router.push('/assets/add')}
          />
        ) : (
          assets.map((asset) => {
            const gainLoss = asset.currentValue - asset.purchasePrice * asset.quantity;
            const gainPercent =
              asset.purchasePrice * asset.quantity > 0
                ? (gainLoss / (asset.purchasePrice * asset.quantity)) * 100
                : 0;
            return (
              <TouchableOpacity
                key={asset.id}
                style={styles.assetItem}
                onPress={() => router.push(`/assets/${asset.id}`)}
                onLongPress={() => handleDelete(asset.id)}
                activeOpacity={0.7}
              >
                <View style={styles.assetHeader}>
                  <View style={styles.assetLeft}>
                    <Text style={styles.assetIcon}>
                      {ASSET_ICONS[asset.type]}
                    </Text>
                    <View>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      {asset.symbol && (
                        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                      )}
                    </View>
                  </View>
                  <Badge
                    text={asset.type.replace('_', ' ')}
                    bgColor={ASSET_COLORS[asset.type]}
                    color={COLORS.textInverse}
                    size="sm"
                  />
                </View>
                <View style={styles.assetBody}>
                  <View>
                    <Text style={styles.assetLabel}>VALUE</Text>
                    <Text style={styles.assetValue}>
                      {formatCurrency(asset.currentValue, currency)}
                    </Text>
                  </View>
                  <View style={styles.assetRight}>
                    <Text style={styles.assetLabel}>GAIN/LOSS</Text>
                    <Text
                      style={[
                        styles.assetGain,
                        { color: getChangeColor(gainLoss) },
                      ]}
                    >
                      {formatPercent(gainPercent)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  portfolioCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
  },
  portfolioLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  portfolioValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  pStatLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  pStatValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
    marginTop: 2,
  },
  pStatRight: {
    alignItems: 'flex-end',
  },
  allocationBar: {
    flexDirection: 'row',
    height: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  allocationSegment: {
    height: '100%',
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  allocationDot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  allocationLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHT.medium,
  },
  allocationPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  assetItem: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.brutalSm,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  assetIcon: {
    fontSize: 24,
  },
  assetName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  assetSymbol: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  assetBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  assetLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  assetValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetGain: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    marginTop: 2,
  },
});
