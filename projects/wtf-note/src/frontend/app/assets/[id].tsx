import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Card, Input, Badge } from '../../src/components/ui';
import { useAppStore, useAuthStore } from '../../src/stores';
import { formatCurrency, formatDate, formatPercent, getChangeColor } from '../../src/utils';
import { assetService, marketService } from '../../src/services/data';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER } from '../../src/theme';

const ASSET_ICONS: Record<string, string> = {
  stock: '📊',
  crypto: '🪙',
  real_estate: '🏠',
};

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currency = useAuthStore((s) => s.user?.currencyPreference ?? 'VND');
  const { assets, removeAsset, fetchAssets } = useAppStore();
  const asset = assets.find((a) => a.id === id);

  const [manualPrice, setManualPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refreshingPrice, setRefreshingPrice] = useState(false);

  if (!asset) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Asset not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const totalInvested = asset.purchasePrice * asset.quantity;
  const gainLoss = asset.currentValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  const handleRefreshPrice = async () => {
    if (!asset.symbol) return;
    setRefreshingPrice(true);
    try {
      if (asset.type === 'stock') {
        await marketService.getStockPrice(asset.symbol);
      } else if (asset.type === 'crypto') {
        await marketService.getCryptoPrice(asset.symbol);
      }
      await fetchAssets();
      Alert.alert('Success', 'Price updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Price refresh failed';
      Alert.alert('Error', message);
    } finally {
      setRefreshingPrice(false);
    }
  };

  const handleUpdateManualPrice = async () => {
    const price = parseFloat(manualPrice);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Enter a valid price');
      return;
    }

    setUpdating(true);
    try {
      await assetService.update(id!, { currentValue: price * asset.quantity });
      await fetchAssets();
      setManualPrice('');
      Alert.alert('Success', 'Value updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      Alert.alert('Error', message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Asset', 'This will permanently remove this asset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAsset(id!);
            router.back();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Delete failed';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{ASSET_ICONS[asset.type] ?? '💰'}</Text>
            <View>
              <Text style={styles.assetName}>{asset.name}</Text>
              {asset.symbol && (
                <Text style={styles.symbol}>{asset.symbol.toUpperCase()}</Text>
              )}
            </View>
          </View>
          <Badge
            text={asset.type.replace('_', ' ').toUpperCase()}
            bgColor={
              asset.type === 'stock' ? COLORS.infoLight :
              asset.type === 'crypto' ? COLORS.warningLight :
              '#F3E8FF'
            }
            color={
              asset.type === 'stock' ? COLORS.info :
              asset.type === 'crypto' ? COLORS.warning :
              '#9B59B6'
            }
          />
        </View>

        <View style={styles.valueSection}>
          <Text style={styles.valueLabel}>CURRENT VALUE</Text>
          <Text style={styles.currentValue}>
            {formatCurrency(asset.currentValue, currency)}
          </Text>
          <Text style={[styles.gainLoss, { color: getChangeColor(gainLoss) }]}>
            {gainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainLoss), currency)}
            {' '}({formatPercent(gainLossPercent)})
          </Text>
        </View>

        {asset.lastPriceUpdate && (
          <Text style={styles.lastUpdate}>
            Last updated: {formatDate(asset.lastPriceUpdate)}
          </Text>
        )}
      </Card>

      {/* Investment Details */}
      <Card title="INVESTMENT DETAILS">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{asset.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purchase Price</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(asset.purchasePrice, currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Invested</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(totalInvested, currency)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purchase Date</Text>
          <Text style={styles.detailValue}>{formatDate(asset.purchaseDate)}</Text>
        </View>
        {asset.ownershipPercentage !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ownership</Text>
            <Text style={styles.detailValue}>{asset.ownershipPercentage}%</Text>
          </View>
        )}
        {asset.walletName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wallet/Exchange</Text>
            <Text style={styles.detailValue}>{asset.walletName}</Text>
          </View>
        )}
        {asset.address && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
              {asset.address}
            </Text>
          </View>
        )}
        {asset.propertyType && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Property Type</Text>
            <Text style={styles.detailValue}>{asset.propertyType}</Text>
          </View>
        )}
      </Card>

      {/* Price Actions */}
      <Card title="UPDATE VALUE">
        {(asset.type === 'stock' || asset.type === 'crypto') && asset.symbol && (
          <Button
            title={refreshingPrice ? 'Fetching...' : 'Refresh Market Price'}
            onPress={handleRefreshPrice}
            loading={refreshingPrice}
            fullWidth
            variant="outline"
            style={styles.refreshBtn}
          />
        )}
        <Input
          label="Manual Price (per unit)"
          value={manualPrice}
          onChangeText={setManualPrice}
          keyboardType="numeric"
          placeholder="Enter price per unit"
        />
        <Button
          title={updating ? 'Updating...' : 'Update Value'}
          onPress={handleUpdateManualPrice}
          loading={updating}
          fullWidth
          variant="primary"
        />
      </Card>

      {/* Delete */}
      <Button
        title="Delete Asset"
        onPress={handleDelete}
        variant="danger"
        fullWidth
        style={styles.deleteBtn}
      />
    </ScrollView>
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
  notFound: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  headerCard: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 36,
  },
  assetName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
  },
  symbol: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  valueSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  valueLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  currentValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  gainLoss: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.xs,
  },
  lastUpdate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  refreshBtn: {
    marginBottom: SPACING.md,
  },
  deleteBtn: {
    marginTop: SPACING.lg,
  },
});
