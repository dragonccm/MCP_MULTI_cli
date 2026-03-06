// Setup file for Vitest
import { vi } from 'vitest';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import React from 'react';

// Mock next/link
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: any) => {
      return React.createElement('a', { ...props, href }, children);
    },
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => {
  const Motion = (Tag: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      return React.createElement(Tag, { ...props, ref }, children);
    });
  };

  return {
    motion: {
      div: Motion('div'),
      h1: Motion('h1'),
      p: Motion('p'),
      section: Motion('section'),
      nav: Motion('nav'),
      button: Motion('button'),
      span: Motion('span'),
      path: Motion('path'),
      svg: Motion('svg'),
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock Next.js next/server
vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn().mockImplementation((url, options) => {
      return {
        url,
        json: async () => JSON.parse(options.body),
      };
    }),
    NextResponse: {
      json: vi.fn().mockImplementation((body, init) => {
        return {
          status: init?.status || 200,
          json: async () => body,
        };
      }),
    },
  };
});
