import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER } from '../../src/constants';
import { BrutalButton, BrutalInput, BrutalSelect } from '../../src/components/ui';
import { useForm } from '../../src/hooks';
import { assetSchema, type AssetInput } from '../../src/utils';
import { usePortfolioStore } from '../../src/stores';

const ASSET_TYPE_OPTIONS = [
  { value: 'stock', label: 'Cổ phiếu', icon: '📊' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'fund', label: 'Quỹ đầu tư', icon: '🏦' },
  { value: 'bond', label: 'Trái phiếu', icon: '📜' },
  { value: 'other', label: 'Khác', icon: '📌' },
];

export default function CreateAssetScreen() {
  const router = useRouter();
  const { addAsset } = usePortfolioStore();

  const form = useForm<typeof assetSchema>({
    schema: assetSchema,
    initialValues: {
      symbol: '',
      name: '',
      assetType: 'stock',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      currency: 'VND',
      notes: '',
    },
    onSubmit: async (values: AssetInput) => {
      await addAsset({
        ...values,
        quantity: Number(values.quantity),
        purchasePrice: Number(values.purchasePrice),
      });
      router.back();
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrutalSelect
          label="Loại tài sản"
          options={ASSET_TYPE_OPTIONS}
          value={form.values.assetType}
          onSelect={(v) => form.setValue('assetType', v as AssetInput['assetType'])}
          error={form.errors.assetType}
        />

        <BrutalInput
          label="Mã chứng khoán"
          placeholder="VD: VNM, BTC, VFMVN30"
          value={form.values.symbol}
          onChangeText={(v) => form.setValue('symbol', v.toUpperCase())}
          error={form.errors.symbol}
          autoCapitalize="characters"
        />

        <BrutalInput
          label="Tên tài sản"
          placeholder="VD: Vinamilk, Bitcoin"
          value={form.values.name}
          onChangeText={(v) => form.setValue('name', v)}
          error={form.errors.name}
        />

        <BrutalInput
          label="Số lượng"
          placeholder="0"
          value={form.values.quantity ? String(form.values.quantity) : ''}
          onChangeText={(v) => {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''));
            form.setValue('quantity', isNaN(num) ? 0 : num);
          }}
          error={form.errors.quantity}
          keyboardType="numeric"
        />

        <BrutalInput
          label="Giá mua"
          placeholder="0"
          value={form.values.purchasePrice ? String(form.values.purchasePrice) : ''}
          onChangeText={(v) => {
            const num = parseFloat(v.replace(/[^0-9.]/g, ''));
            form.setValue('purchasePrice', isNaN(num) ? 0 : num);
          }}
          error={form.errors.purchasePrice}
          keyboardType="numeric"
        />

        <BrutalInput
          label="Ngày mua (YYYY-MM-DD)"
          placeholder="2024-01-15"
          value={form.values.purchaseDate}
          onChangeText={(v) => form.setValue('purchaseDate', v)}
          error={form.errors.purchaseDate}
        />

        <BrutalInput
          label="Tiền tệ"
          value={form.values.currency}
          onChangeText={(v) => form.setValue('currency', v.toUpperCase())}
          maxLength={3}
          autoCapitalize="characters"
        />

        <BrutalInput
          label="Ghi chú (tuỳ chọn)"
          placeholder="Ghi chú về khoản đầu tư..."
          value={form.values.notes ?? ''}
          onChangeText={(v) => form.setValue('notes', v)}
          multiline
          numberOfLines={3}
        />

        {form.submitError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {form.submitError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <BrutalButton
            title="Thêm tài sản"
            onPress={form.handleSubmit}
            loading={form.isSubmitting}
            fullWidth
            size="lg"
          />
          <BrutalButton
            title="Hủy"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
          />
        </View>
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
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: BORDER.radius,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
});
