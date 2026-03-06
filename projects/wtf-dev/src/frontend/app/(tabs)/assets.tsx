import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';
import { assetService } from '../../src/services/dataService';
import { AssetCard } from '../../src/features/assets/components/AssetCard';
import { BrutalButton, EmptyState, LoadingState } from '../../src/components/ui';
import { Asset } from '../../src/types';

export default function AssetsScreen(): React.JSX.Element {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await assetService.fetchAll();
    } catch {
      // Use cached data
    } finally {
      setTick((t) => t + 1);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading assets..." />
      </SafeAreaView>
    );
  }

  const groups = assetService.getGrouped();
  const allAssets = assetService.getAll();

  const handleAssetPress = (asset: Asset) => {
    router.push(`/assets/${asset.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Assets</Text>
          <BrutalButton
            title="+ Add"
            onPress={() => router.push('/assets/add')}
            size="sm"
          />
        </View>

        {allAssets.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="No Assets Yet"
            description="Start by adding your first asset — cash, e-wallet, crypto, stock, or debt."
            action={
              <BrutalButton
                title="Add First Asset"
                onPress={() => router.push('/assets/add')}
              />
            }
          />
        ) : (
          groups.map((group) => (
            <View key={group.type} style={styles.group}>
              <Text style={styles.groupTitle}>{group.label}</Text>
              {group.assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onPress={handleAssetPress} />
              ))}
            </View>
          ))
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  footer: {
    height: spacing.xxxl,
  },
});
