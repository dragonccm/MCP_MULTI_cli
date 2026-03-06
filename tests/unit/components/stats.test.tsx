import { render, screen } from '@testing-library/react';
import { Stats } from '../../../src/frontend/src/components/home/stats';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { STATS } from '../../../src/frontend/src/lib/constants';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, key) => {
        return ({ children, ...props }: any) => {
          const Component = key as any;
          return <Component {...props}>{children}</Component>;
        };
      },
    }
  ),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Stats Component', () => {
  it('renders all stats correctly', () => {
    render(<Stats />);
    
    STATS.forEach(stat => {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });
});
