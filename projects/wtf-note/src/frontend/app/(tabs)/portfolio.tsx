import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, BORDER, SHADOW } from '../../src/constants';
import { BrutalCard, BrutalButton, AssetCard, LoadingState, EmptyState } from '../../src/components/ui';
import { usePortfolioStore } from '../../src/stores';
import { formatCurrency, formatPercentage, formatRelativeDate } from '../../src/utils';
import type { AssetWithValue, NewsArticle } from '../../src/types';

type TabKey = 'portfolio' | 'news';

export default function PortfolioScreen() {
  const router = useRouter();
  const { assets, summary, news, isLoading, newsLoading, fetchAssets, fetchSummary, fetchNews } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchSummary();
    fetchNews();
  }, [fetchAssets, fetchSummary, fetchNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAssets(), fetchSummary(), fetchNews()]);
    setRefreshing(false);
  };

  const assetsWithValue: AssetWithValue[] = assets.map((asset) => {
    const currentPrice = asset.currentPrice ?? asset.purchasePrice;
    const currentValue = currentPrice * asset.quantity;
    const cost = asset.purchasePrice * asset.quantity;
    const gainLoss = currentValue - cost;
    const gainLossPercentage = cost > 0 ? (gainLoss / cost) * 100 : 0;
    return { ...asset, currentValue, gainLoss, gainLossPercentage };
  });

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>
            📊 Danh mục
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.tabActive]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.tabTextActive]}>
            📰 Tin tức
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'portfolio' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {/* Summary Card */}
          {summary && (
            <BrutalCard style={styles.summaryCard} variant="accent">
              <Text style={styles.summaryLabel}>TỔNG GIÁ TRỊ DANH MỤC</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalValue)}
              </Text>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summarySubLabel}>Vốn đầu tư</Text>
                  <Text style={styles.summarySubValue}>{formatCurrency(summary.totalCost)}</Text>
                </View>
                <View style={styles.summaryGain}>
                  <Text style={styles.summarySubLabel}>Lãi/Lỗ</Text>
                  <Text
                    style={[
                      styles.summaryGainValue,
                      { color: summary.totalGainLoss >= 0 ? COLORS.success : COLORS.error },
                    ]}
                  >
                    {summary.totalGainLoss >= 0 ? '▲' : '▼'}{' '}
                    {formatCurrency(Math.abs(summary.totalGainLoss))} ({formatPercentage(summary.gainLossPercentage)})
                  </Text>
                </View>
              </View>
            </BrutalCard>
          )}

          {/* Asset List */}
          {isLoading && assets.length === 0 ? (
            <LoadingState />
          ) : assetsWithValue.length === 0 ? (
            <EmptyState
              icon="📈"
              title="Chưa có tài sản"
              description="Thêm cổ phiếu, crypto hoặc quỹ vào danh mục đầu tư"
              action={
                <BrutalButton
                  title="Thêm tài sản"
                  onPress={() => router.push('/asset/create')}
                />
              }
            />
          ) : (
            <View style={styles.assetList}>
              {assetsWithValue.map((asset) => (
                <AssetCard key={asset.id} asset={asset} style={styles.assetItem} />
              ))}
            </View>
          )}

          <BrutalButton
            title="+ Thêm tài sản"
            onPress={() => router.push('/asset/create')}
            variant="outline"
            fullWidth
            style={styles.addButton}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            newsLoading ? (
              <LoadingState message="Đang tải tin tức..." />
            ) : (
              <EmptyState icon="📰" title="Chưa có tin tức" description="Kéo xuống để tải lại" />
            )
          }
          renderItem={({ item }: { item: NewsArticle }) => (
            <TouchableOpacity
              style={styles.newsCard}
              onPress={() => {
                if (item.url) Linking.openURL(item.url);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.newsDate}>{formatRelativeDate(item.publishedAt)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summarySubLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summarySubValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  summaryGain: {
    alignItems: 'flex-end',
  },
  summaryGainValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginTop: 2,
  },
  assetList: {
    gap: SPACING.md,
  },
  assetItem: {
    marginBottom: 0,
  },
  addButton: {
    marginTop: SPACING.xl,
  },
  newsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.brutalSm,
  },
  newsSource: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  newsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  newsDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  newsDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
});
