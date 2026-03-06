/**
 * WTF Finance - Refined Light Brutalism Theme
 * Bold borders, soft pastels, strong shadows, clean typography
 */

export const colors = {
  primary: '#2D2D2D',
  primaryLight: '#4A4A4A',
  accent: '#FF6B35',
  accentLight: '#FF8C5A',

  // Soft pastel palette
  lavender: '#E8D5F5',
  mint: '#C8F0E0',
  peach: '#FFD4B8',
  skyBlue: '#B8E0FF',
  lemon: '#FFF3B0',
  rose: '#FFD1DC',

  // Semantic
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F0EB',
  border: '#2D2D2D',
  borderLight: '#D4D0CB',

  text: '#1A1A1A',
  textSecondary: '#6B6560',
  textMuted: '#9E9891',
  textInverse: '#FFFFFF',

  success: '#2ECC71',
  successBg: '#D5F5E3',
  warning: '#F1C40F',
  warningBg: '#FEF9E7',
  error: '#E74C3C',
  errorBg: '#FDEDEC',
  info: '#3498DB',
  infoBg: '#D6EAF8',

  // Asset type colors
  cash: '#2ECC71',
  eWallet: '#3498DB',
  crypto: '#F39C12',
  stock: '#9B59B6',
  debt: '#E74C3C',
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
  heavy: 4,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 6,
  },
  brutal: {
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderWidth,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
