import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { BrutalButton, BrutalInput, BrutalCard } from '../../src/components/ui';
import { assetService } from '../../src/services/dataService';
import { AssetType } from '../../src/types';
import { assetSchema } from '../../src/utils/validation';
import { ASSET_TYPES, DEFAULT_CURRENCY } from '../../src/utils/constants';

export default function AddAssetScreen(): React.JSX.Element {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    const parsed = assetSchema.safeParse({
      name,
      type: selectedType,
      balance: balance ? parseFloat(balance) : undefined,
      currency,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    // Check for duplicates
    const existingAssets = assetService.getAll();
    const duplicate = existingAssets.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      Alert.alert(
        'Duplicate Name',
        `An asset named "${name}" already exists. Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: 'Continue',
            onPress: () => {
              createAsset(parsed.data);
            },
          },
        ]
      );
      return;
    }

    createAsset(parsed.data);
  };

  const createAsset = async (data: { name: string; type: AssetType; balance: number; currency: string }) => {
    try {
      await assetService.apiCreate({
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create asset. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <BrutalCard>
        <BrutalInput
          label="Asset Name"
          placeholder="e.g., Cash Wallet, Bitcoin, VNM Stock"
          value={name}
          onChangeText={setName}
          error={errors['name']}
          autoFocus
        />

        {/* Asset Type Selector */}
        <Text style={styles.label}>ASSET TYPE</Text>
        <View style={styles.typeGrid}>
          {ASSET_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeBtn,
                { backgroundColor: t.color + '15' },
                selectedType === t.value && styles.typeBtnActive,
                selectedType === t.value && { borderColor: t.color },
              ]}
              onPress={() => setSelectedType(t.value)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: selectedType === t.value }}
            >
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === t.value && { color: t.color, fontWeight: '800' },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors['type'] && <Text style={styles.error}>{errors['type']}</Text>}

        <BrutalInput
          label="Balance"
          placeholder="0"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
          error={errors['balance']}
        />

        <BrutalInput
          label="Currency"
          placeholder="VND"
          value={currency}
          onChangeText={setCurrency}
          error={errors['currency']}
          autoCapitalize="characters"
        />

        {/* Warning for negative balance */}
        {parseFloat(balance) < 0 && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Negative balance will be highlighted in red
            </Text>
          </View>
        )}
      </BrutalCard>

      <BrutalButton
        title="Add Asset"
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        size="lg"
      />

      <BrutalButton
        title="Cancel"
        onPress={() => router.back()}
        variant="outline"
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  typeBtnActive: {
    borderWidth: borderWidth.thick,
    ...shadows.small,
  },
  typeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: '600',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  warningBox: {
    backgroundColor: colors.warningBg,
    borderWidth: borderWidth.medium,
    borderColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
