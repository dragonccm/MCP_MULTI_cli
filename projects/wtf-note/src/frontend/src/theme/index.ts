import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#1A1A2E',
  primaryLight: '#16213E',
  accent: '#E94560',
  accentLight: '#FF6B81',
  success: '#2ECC71',
  successLight: '#A8E6CF',
  warning: '#F39C12',
  warningLight: '#FFEAA7',
  danger: '#E74C3C',
  dangerLight: '#FFD5CD',
  info: '#3498DB',
  infoLight: '#D6EAF8',

  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  border: '#1A1A2E',
  borderLight: '#E0E0E0',

  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  income: '#2ECC71',
  expense: '#E94560',
  owed: '#E94560',
  owing: '#2ECC71',

  stock: '#3498DB',
  crypto: '#F39C12',
  realEstate: '#9B59B6',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const BORDER = {
  width: 2,
  widthThick: 3,
  radius: 0,
  radiusSm: 2,
  radiusMd: 4,
} as const;

export const SHADOW = {
  brutal: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  brutalSm: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenPadding: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOW.brutal,
  },
  cardSm: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDER.width,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    ...SHADOW.brutalSm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  body: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.text,
  },
  caption: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  divider: {
    height: BORDER.width,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
