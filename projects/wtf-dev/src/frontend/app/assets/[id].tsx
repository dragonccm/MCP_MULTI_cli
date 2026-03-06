import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography, borderWidth, borderRadius, shadows } from '../../src/theme';
import { BrutalButton, BrutalCard, BrutalInput, LoadingState } from '../../src/components/ui';
import { assetService, transactionService } from '../../src/services/dataService';
import { formatCurrency, getAssetTypeLabel, getAssetTypeColor, getAssetTypeIcon } from '../../src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { BrutalBadge } from '../../src/components/ui/BrutalBadge';
import { Asset } from '../../src/types';

export default function AssetDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAsset = useCallback(async () => {
    try {
      const data = await assetService.fetchById(id ?? '');
      setAsset(data);
    } catch {
      setAsset(assetService.getById(id ?? ''));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingState message="Loading asset..." />
      </View>
    );
  }

  if (!asset) {
    return (
      <View style={styles.container}>
        <BrutalCard style={styles.centerCard}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Asset not found</Text>
          <BrutalButton title="Go Back" onPress={() => router.back()} variant="outline" />
        </BrutalCard>
      </View>
    );
  }

  const typeColor = getAssetTypeColor(asset.type);
  const iconName = getAssetTypeIcon(asset.type) as keyof typeof Ionicons.glyphMap;
  const isNegative = asset.balance < 0;

  const relatedTransactions = transactionService
    .getAll()
    .filter((t) => t.assetId === asset.id)
    .slice(0, 5);

  const handleEdit = () => {
    setEditName(asset.name);
    setEditBalance(String(asset.balance));
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await assetService.apiUpdate(asset.id, {
        name: editName || asset.name,
        balance: parseFloat(editBalance) || asset.balance,
      });
      setAsset(updated);
      setEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update asset.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    const allAssets = assetService.getAll();
    if (allAssets.length <= 1) {
      Alert.alert('Cannot Delete', 'This is your last asset. Add another one before deleting.');
      return;
    }

    if (relatedTransactions.length > 0) {
      Alert.alert(
        'Warning',
        `This asset has ${relatedTransactions.length} related transactions. Deleting will remove all associated data.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await assetService.apiDelete(asset.id);
                router.back();
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to delete asset.';
                Alert.alert('Error', message);
              }
            },
          },
        ]
      );
      return;
    }

    Alert.alert('Delete Asset', `Are you sure you want to delete "${asset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await assetService.apiDelete(asset.id);
            router.back();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete asset.';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Asset Info Card */}
      <BrutalCard variant="elevated">
        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: typeColor + '20' }]}>
            <Ionicons name={iconName} size={32} color={typeColor} />
          </View>
          <View style={styles.headerInfo}>
            {editing ? (
              <BrutalInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Asset name"
              />
            ) : (
              <Text style={styles.assetName}>{asset.name}</Text>
            )}
            <BrutalBadge
              text={getAssetTypeLabel(asset.type)}
              bgColor={typeColor + '25'}
              color={typeColor}
              size="md"
            />
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          {editing ? (
            <BrutalInput
              value={editBalance}
              onChangeText={setEditBalance}
              keyboardType="numeric"
              placeholder="0"
            />
          ) : (
            <Text style={[styles.balance, isNegative && { color: colors.error }]}>
              {formatCurrency(asset.balance, asset.currency)}
            </Text>
          )}
          <Text style={styles.currency}>{asset.currency}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Created: {new Date(asset.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.metaText}>Updated: {new Date(asset.updatedAt).toLocaleDateString()}</Text>
        </View>
      </BrutalCard>

      {/* Actions */}
      <View style={styles.actions}>
        {editing ? (
          <>
            <BrutalButton title="Save" onPress={handleSave} fullWidth loading={saving} />
            <BrutalButton title="Cancel" onPress={() => setEditing(false)} variant="outline" fullWidth />
          </>
        ) : (
          <>
            <BrutalButton title="Edit Asset" onPress={handleEdit} variant="secondary" fullWidth />
            <BrutalButton title="Delete Asset" onPress={handleDelete} variant="danger" fullWidth />
          </>
        )}
      </View>

      {/* Related Transactions */}
      {relatedTransactions.length > 0 && (
        <BrutalCard>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {relatedTransactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
              <Text
                style={[
                  styles.txAmount,
                  { color: tx.type === 'INCOME' ? colors.success : colors.error },
                ]}
              >
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </Text>
            </View>
          ))}
        </BrutalCard>
      )}
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
  centerCard: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.huge,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.error,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  assetName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  balanceSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  balance: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  currency: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  txDesc: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  txAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
});
