import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#FF6B35',
  primaryLight: '#FF8F65',
  primaryDark: '#E55A2B',
  secondary: '#004E89',
  secondaryLight: '#1A6FB5',
  accent: '#FCBF49',
  accentDark: '#E0A830',

  background: '#FFF8E1',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F0E1',

  text: '#1A1A2E',
  textSecondary: '#555555',
  textLight: '#888888',
  textOnPrimary: '#FFFFFF',

  success: '#2DC653',
  successBg: '#E8F8ED',
  error: '#E63946',
  errorBg: '#FDECEE',
  warning: '#FCBF49',
  warningBg: '#FFF8E1',
  info: '#457B9D',
  infoBg: '#E8F4FD',

  income: '#2DC653',
  expense: '#E63946',
  debt: '#FF6B35',
  receivable: '#004E89',
  asset: '#FCBF49',

  border: '#1A1A2E',
  borderLight: '#CCCCCC',
  shadow: '#1A1A2E',
  overlay: 'rgba(26, 26, 46, 0.5)',

  white: '#FFFFFF',
  black: '#1A1A2E',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 36,
} as const;

export const BORDER = {
  width: 2,
  widthThick: 3,
  radius: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 999,
} as const;

export const SHADOW = {
  brutal: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  brutalSm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  brutalLg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
} as const;

export const BRUTALIST_BASE = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    padding: SPACING.lg,
    ...SHADOW.brutal,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...SHADOW.brutalSm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    borderRadius: BORDER.radius,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  badge: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER.radiusFull,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
});

export const CATEGORIES = [
  'food',
  'transport',
  'housing',
  'utilities',
  'entertainment',
  'shopping',
  'health',
  'education',
  'salary',
  'investment',
  'savings',
  'other',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  housing: '🏠',
  utilities: '💡',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '🏥',
  education: '📚',
  salary: '💰',
  investment: '📈',
  savings: '🏦',
  other: '📌',
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  income: 'Thu nhập',
  expense: 'Chi tiêu',
  debt: 'Nợ',
  receivable: 'Phải thu',
  asset: 'Tài sản',
};

export const API_BASE_URL = 'http://localhost:3000/api';
