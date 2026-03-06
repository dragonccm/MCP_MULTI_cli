import { render, screen } from '@testing-library/react';
import { WhyUs } from '../../../src/frontend/src/components/home/why-us';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

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

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Zap: () => <div data-testid="icon-zap" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  Users: () => <div data-testid="icon-users" />,
  Brain: () => <div data-testid="icon-brain" />,
}));

describe('WhyUs Component', () => {
  it('renders correctly', () => {
    render(<WhyUs />);
    
    expect(screen.getByText(/Why Choose/i)).toBeInTheDocument();
    expect(screen.getByText(/WTF DEV\?/i)).toBeInTheDocument();

    const reasons = [
      'AI-First Approach',
      'Speed to Market',
      'Data-Driven Results',
      'Dedicated Support',
    ];
    
    reasons.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    expect(screen.getByText(/We don't just build apps/i)).toBeInTheDocument();
    expect(screen.getByText(/Idea to launch in record time/i)).toBeInTheDocument();
  });
});
