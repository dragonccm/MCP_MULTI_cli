import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Set DATABASE_URL BEFORE any imports
const testDbPath = resolve(__dirname, 'prisma/test.db');
process.env.DATABASE_URL = `file:${testDbPath}`;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'tests/**', 'dist/**', 'prisma/**'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
});
