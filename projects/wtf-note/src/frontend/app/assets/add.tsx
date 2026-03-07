import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input } from '../../src/components/ui';
import { useAppStore } from '../../src/stores';
import { useForm } from '../../src/hooks';
import { assetSchema, type AssetForm } from '../../src/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER, SHADOW } from '../../src/theme';
import type { AssetType } from '../../src/types';

const ASSET_TYPES: { type: AssetType; icon: string; label: string; color: string }[] = [
  { type: 'stock', icon: '📊', label: 'Stock', color: COLORS.stock },
  { type: 'crypto', icon: '🪙', label: 'Crypto', color: COLORS.crypto },
  { type: 'real_estate', icon: '🏠', label: 'Real Estate', color: COLORS.realEstate },
];

export default function AddAssetScreen() {
  const { addAsset } = useAppStore();
  const [assetType, setAssetType] = useState<AssetType>('stock');

  const form = useForm<AssetForm>(
    {
      type: 'stock',
      name: '',
      symbol: '',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      address: '',
      propertyType: '',
      walletName: '',
      ownershipPercentage: 100,
    },
    assetSchema
  );

  const handleTypeChange = (type: AssetType) => {
    setAssetType(type);
    form.setValue('type', type);
  };

  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      await addAsset({
        ...data,
        type: assetType,
      });
      Alert.alert('Success', 'Asset added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>ASSET TYPE</Text>
        <View style={styles.typeRow}>
          {ASSET_TYPES.map((at) => (
            <TouchableOpacity
              key={at.type}
              style={[
                styles.typeBtn,
                assetType === at.type && { backgroundColor: at.color },
              ]}
              onPress={() => handleTypeChange(at.type)}
            >
              <Text style={styles.typeIcon}>{at.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  assetType === at.type && styles.typeLabelActive,
                ]}
              >
                {at.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Name"
          placeholder={
            assetType === 'stock' ? 'e.g. Apple Inc.'
            : assetType === 'crypto' ? 'e.g. Bitcoin'
            : 'e.g. Downtown Apartment'
          }
          value={form.values.name}
          onChangeText={(v) => form.setValue('name', v)}
          error={form.errors.name}
        />

        {(assetType === 'stock' || assetType === 'crypto') && (
          <Input
            label={assetType === 'stock' ? 'Ticker Symbol' : 'Coin Symbol'}
            placeholder={assetType === 'stock' ? 'AAPL' : 'BTC'}
            value={form.values.symbol ?? ''}
            onChangeText={(v) => form.setValue('symbol', v.toUpperCase())}
            error={form.errors.symbol}
            autoCapitalize="characters"
          />
        )}

        {assetType === 'crypto' && (
          <Input
            label="Wallet / Exchange"
            placeholder="e.g. Binance, MetaMask"
            value={form.values.walletName ?? ''}
            onChangeText={(v) => form.setValue('walletName', v)}
          />
        )}

        {assetType === 'real_estate' && (
          <>
            <Input
              label="Address"
              placeholder="Property address"
              value={form.values.address ?? ''}
              onChangeText={(v) => form.setValue('address', v)}
            />
            <Input
              label="Property Type"
              placeholder="e.g. Apartment, House, Land"
              value={form.values.propertyType ?? ''}
              onChangeText={(v) => form.setValue('propertyType', v)}
            />
            <Input
              label="Ownership %"
              placeholder="100"
              value={
                form.values.ownershipPercentage !== undefined
                  ? String(form.values.ownershipPercentage)
                  : ''
              }
              onChangeText={(v) => form.setValue('ownershipPercentage', parseFloat(v) || 0)}
              keyboardType="numeric"
            />
          </>
        )}

        <Input
          label="Quantity"
          placeholder="0"
          value={form.values.quantity ? String(form.values.quantity) : ''}
          onChangeText={(v) => form.setValue('quantity', parseFloat(v) || 0)}
          error={form.errors.quantity}
          keyboardType="numeric"
        />

        <Input
          label="Purchase Price (per unit)"
          placeholder="0"
          value={form.values.purchasePrice ? String(form.values.purchasePrice) : ''}
          onChangeText={(v) => form.setValue('purchasePrice', parseFloat(v) || 0)}
          error={form.errors.purchasePrice}
          keyboardType="numeric"
        />

        <Input
          label="Purchase Date"
          placeholder="YYYY-MM-DD"
          value={form.values.purchaseDate}
          onChangeText={(v) => form.setValue('purchaseDate', v)}
          error={form.errors.purchaseDate}
        />

        <Button
          title="Add Asset"
          onPress={handleSubmit}
          loading={form.isSubmitting}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  typeLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  typeLabelActive: {
    color: COLORS.textInverse,
  },
});
