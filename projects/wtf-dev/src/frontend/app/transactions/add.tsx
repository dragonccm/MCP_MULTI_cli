import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { BrutalButton, BrutalInput, BrutalCard } from '../../src/components/ui';
import { assetService, transactionService } from '../../src/services/dataService';
import { TransactionType } from '../../src/types';
import { transactionSchema } from '../../src/utils/validation';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../src/utils/constants';

export default function AddTransactionScreen(): React.JSX.Element {
  const router = useRouter();
  const [txType, setTxType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const assets = assetService.getAll();
  const categories = txType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    assetService.fetchAll();
  }, []);

  const handleSubmit = () => {
    const parsed = transactionSchema.safeParse({
      type: txType,
      amount: amount ? parseFloat(amount) : undefined,
      category: selectedCategory,
      description,
      assetId: selectedAssetId,
      date: new Date().toISOString(),
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

    // Check balance for cash/e-wallet
    const asset = assetService.getById(selectedAssetId);
    if (
      asset &&
      txType === TransactionType.EXPENSE &&
      parseFloat(amount) > asset.balance &&
      (asset.type === 'CASH' || asset.type === 'E_WALLET')
    ) {
      Alert.alert(
        'Insufficient Balance',
        `Transaction amount exceeds ${asset.name} balance. Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: 'Continue',
            onPress: () => createTransaction(parsed.data),
          },
        ]
      );
      return;
    }

    createTransaction(parsed.data);
  };

  const createTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    assetId: string;
    date: string;
  }) => {
    try {
      await transactionService.apiCreate({
        type: data.type,
        amount: data.amount,
        description: data.description,
        assetId: data.assetId,
        date: data.date,
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction.';
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
      {/* Transaction Type Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            txType === TransactionType.EXPENSE && styles.toggleActive,
            txType === TransactionType.EXPENSE && { backgroundColor: colors.errorBg },
          ]}
          onPress={() => setTxType(TransactionType.EXPENSE)}
          accessibilityRole="button"
          accessibilityLabel="Expense"
          accessibilityState={{ selected: txType === TransactionType.EXPENSE }}
        >
          <Ionicons
            name="arrow-down-circle"
            size={20}
            color={txType === TransactionType.EXPENSE ? colors.error : colors.textMuted}
          />
          <Text
            style={[
              styles.toggleText,
              txType === TransactionType.EXPENSE && { color: colors.error },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            txType === TransactionType.INCOME && styles.toggleActive,
            txType === TransactionType.INCOME && { backgroundColor: colors.successBg },
          ]}
          onPress={() => setTxType(TransactionType.INCOME)}
          accessibilityRole="button"
          accessibilityLabel="Income"
          accessibilityState={{ selected: txType === TransactionType.INCOME }}
        >
          <Ionicons
            name="arrow-up-circle"
            size={20}
            color={txType === TransactionType.INCOME ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              styles.toggleText,
              txType === TransactionType.INCOME && { color: colors.success },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <BrutalCard>
        {/* Amount */}
        <BrutalInput
          label="Amount"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          error={errors['amount']}
          autoFocus
        />

        {/* Description */}
        <BrutalInput
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
          error={errors['description']}
        />

        {/* Category */}
        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const catIcon = cat.icon as keyof typeof Ionicons.glyphMap;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.id && styles.categoryActive,
                  selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
                accessibilityState={{ selected: selectedCategory === cat.id }}
              >
                <Ionicons
                  name={catIcon}
                  size={18}
                  color={selectedCategory === cat.id ? cat.color : colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && { color: cat.color, fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors['category'] && <Text style={styles.error}>{errors['category']}</Text>}

        {/* Asset Selector */}
        <Text style={styles.label}>FROM ASSET</Text>
        <View style={styles.assetList}>
          {assets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              style={[
                styles.assetBtn,
                selectedAssetId === asset.id && styles.assetActive,
              ]}
              onPress={() => setSelectedAssetId(asset.id)}
              accessibilityRole="button"
              accessibilityLabel={asset.name}
              accessibilityState={{ selected: selectedAssetId === asset.id }}
            >
              <Text
                style={[
                  styles.assetText,
                  selectedAssetId === asset.id && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                {asset.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors['assetId'] && <Text style={styles.error}>{errors['assetId']}</Text>}
      </BrutalCard>

      <BrutalButton
        title={txType === TransactionType.EXPENSE ? 'Record Expense' : 'Record Income'}
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
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  toggleActive: {
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    ...shadows.small,
  },
  toggleText: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  categoryActive: {
    borderWidth: borderWidth.thick,
    ...shadows.small,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  assetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  assetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.medium,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  assetActive: {
    borderWidth: borderWidth.thick,
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
    ...shadows.small,
  },
  assetText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: '600',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
});
