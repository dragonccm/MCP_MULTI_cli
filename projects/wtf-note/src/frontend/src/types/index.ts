export interface User {
  id: string;
  email: string;
  profileName: string;
  currencyPreference: string;
  baseCurrency: string;
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  debtReminders: boolean;
  budgetAlerts: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  contactName: string;
  type: DebtType;
  totalAmount: number;
  remainingBalance: number;
  dueDate: string;
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  status: DebtStatus;
  createdAt: string;
  paidDate?: string;
}

export type DebtType = 'owed' | 'owing';
export type DebtStatus = 'pending' | 'overdue' | 'paid';
export type RecurrenceInterval = 'monthly' | 'weekly';

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}

export interface Asset {
  id: string;
  userId: string;
  type: AssetType;
  name: string;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  lastPriceUpdate?: string;
  ownershipPercentage?: number;
  linkedDebtId?: string;
  address?: string;
  propertyType?: string;
  walletName?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'stock' | 'crypto' | 'real_estate';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  monthlyLimit: number;
  currentMonthSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  content: string;
  estimatedSavings?: number;
  generatedAt: string;
  confidenceScore: number;
  status: 'active' | 'archived';
}

export type InsightType = 'spending' | 'budget_recommendation' | 'net_worth_projection';

export interface NetWorthProjection {
  year: number;
  optimistic: number;
  base: number;
  conservative: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  allocation: AllocationItem[];
}

export interface AllocationItem {
  type: AssetType;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DashboardOverview {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netWorth: number;
  recentTransactions: Transaction[];
  spendingTrend: SpendingTrendItem[];
}

export interface SpendingTrendItem {
  date: string;
  amount: number;
}

export interface SpendingAnalytics {
  byCategory: CategorySpending[];
  byTime: TimeSpending[];
  trendLine: SpendingTrendItem[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TimeSpending {
  period: string;
  income: number;
  expense: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  profileName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
