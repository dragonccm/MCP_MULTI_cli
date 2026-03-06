import { Category, TransactionType, AssetType } from '../types';
import { colors } from '../theme';

export const DEFAULT_CURRENCY = 'VND';

export const ASSET_TYPES = [
  { value: AssetType.CASH, label: 'Cash', icon: 'cash', color: colors.cash },
  { value: AssetType.E_WALLET, label: 'E-Wallet', icon: 'wallet', color: colors.eWallet },
  { value: AssetType.CRYPTO, label: 'Crypto', icon: 'logo-bitcoin', color: colors.crypto },
  { value: AssetType.STOCK, label: 'Stock', icon: 'trending-up', color: colors.stock },
  { value: AssetType.DEBT, label: 'Debt', icon: 'card', color: colors.debt },
] as const;

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drink', icon: 'fast-food', color: '#FF6B35', type: TransactionType.EXPENSE },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#3498DB', type: TransactionType.EXPENSE },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#E91E63', type: TransactionType.EXPENSE },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#9B59B6', type: TransactionType.EXPENSE },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: '#F39C12', type: TransactionType.EXPENSE },
  { id: 'health', name: 'Health', icon: 'medkit', color: '#E74C3C', type: TransactionType.EXPENSE },
  { id: 'education', name: 'Education', icon: 'school', color: '#1ABC9C', type: TransactionType.EXPENSE },
  { id: 'other_expense', name: 'Other', icon: 'ellipsis-horizontal', color: '#95A5A6', type: TransactionType.EXPENSE },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#2ECC71', type: TransactionType.INCOME },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#3498DB', type: TransactionType.INCOME },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#9B59B6', type: TransactionType.INCOME },
  { id: 'gift', name: 'Gift', icon: 'gift', color: '#E91E63', type: TransactionType.INCOME },
  { id: 'other_income', name: 'Other', icon: 'ellipsis-horizontal', color: '#95A5A6', type: TransactionType.INCOME },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
