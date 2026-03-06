import { AssetType } from '../types';
import { colors } from '../theme';

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs) return 'Today';
  if (diff < dayMs * 2) return 'Yesterday';
  if (diff < dayMs * 7) return 'This Week';

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function getAssetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    [AssetType.CASH]: 'Cash',
    [AssetType.E_WALLET]: 'E-Wallet',
    [AssetType.CRYPTO]: 'Crypto',
    [AssetType.STOCK]: 'Stock',
    [AssetType.DEBT]: 'Debt',
  };
  return labels[type];
}

export function getAssetTypeColor(type: AssetType): string {
  const typeColors: Record<AssetType, string> = {
    [AssetType.CASH]: colors.cash,
    [AssetType.E_WALLET]: colors.eWallet,
    [AssetType.CRYPTO]: colors.crypto,
    [AssetType.STOCK]: colors.stock,
    [AssetType.DEBT]: colors.debt,
  };
  return typeColors[type];
}

export function getAssetTypeIcon(type: AssetType): string {
  const icons: Record<AssetType, string> = {
    [AssetType.CASH]: 'cash',
    [AssetType.E_WALLET]: 'wallet',
    [AssetType.CRYPTO]: 'logo-bitcoin',
    [AssetType.STOCK]: 'trending-up',
    [AssetType.DEBT]: 'card',
  };
  return icons[type];
}

export function groupDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs) return 'Today';
  if (diff < dayMs * 2) return 'Yesterday';
  if (diff < dayMs * 7) return 'This Week';
  if (diff < dayMs * 14) return 'Last Week';
  if (diff < dayMs * 30) return 'This Month';
  return 'Older';
}
