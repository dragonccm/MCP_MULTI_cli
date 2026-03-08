import dotenv from 'dotenv';
import path from 'path';

// Only load .env if DATABASE_URL is not already set (e.g., in test environment)
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  MARKETSTACK_API_KEY: process.env.MARKETSTACK_API_KEY || '',
  CURRENCY_API_KEY: process.env.CURRENCY_API_KEY || '',

  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
} as const;
