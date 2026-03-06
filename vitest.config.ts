import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/backend/src/**',
        'src/frontend/src/lib/**',
        'src/frontend/src/components/**',
      ],
      exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/index.ts',
      'src/backend/src/types/**',
      'src/backend/src/middleware/**',
      'src/backend/src/lib/db.ts',
      'src/frontend/src/components/ui/index.ts',
      'tests/e2e/**',
    ],
    },
    alias: [
      { find: /^react$/, replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime') },
      { find: /^react\/jsx-dev-runtime$/, replacement: path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime') },
      { find: /^react-dom\/client$/, replacement: path.resolve(__dirname, 'node_modules/react-dom/client') },
      { find: '@frontend', replacement: path.resolve(__dirname, './src/frontend/src') },
      { find: '@/lib/constants', replacement: path.resolve(__dirname, './src/frontend/src/lib/constants.ts') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/frontend/src/components') },
      { find: '@/lib/utils', replacement: path.resolve(__dirname, './src/frontend/src/lib/utils') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/backend/src/lib') },
      { find: '@/services', replacement: path.resolve(__dirname, './src/backend/src/services') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/backend/src/utils') },
      { find: '@', replacement: path.resolve(__dirname, './src/backend/src') },
      { find: 'next/link', replacement: path.resolve(__dirname, './node_modules/next/dist/client/link.js') },
      { find: 'next/navigation', replacement: path.resolve(__dirname, './node_modules/next/dist/client/components/navigation.js') },
      { find: 'zod', replacement: path.resolve(__dirname, './node_modules/zod') },
      { find: 'framer-motion', replacement: path.resolve(__dirname, './node_modules/framer-motion') },
      { find: 'react-hook-form', replacement: path.resolve(__dirname, './node_modules/react-hook-form') },
      { find: '@hookform/resolvers', replacement: path.resolve(__dirname, './node_modules/@hookform/resolvers') },
      { find: 'lucide-react', replacement: path.resolve(__dirname, './node_modules/lucide-react') },
    ],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'framer-motion', 'react-hook-form', '@hookform/resolvers'],
  },
});
