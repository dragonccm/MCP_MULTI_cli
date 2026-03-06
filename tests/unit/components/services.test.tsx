import { render, screen } from '@testing-library/react';
import { Services } from '../../../src/frontend/src/components/home/services';
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
  Search: () => <div data-testid="icon-search" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  Code: () => <div data-testid="icon-code" />,
  MessageSquare: () => <div data-testid="icon-message" />,
  BarChart3: () => <div data-testid="icon-chart" />,
  ArrowUpRight: () => <div data-testid="icon-arrow" />,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-slot="card">{children}</div>,
}));

describe('Services Component', () => {
  it('renders the section title', () => {
    render(<Services />);
    expect(screen.getByText(/Powering Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Growth Engine/i)).toBeInTheDocument();
  });

  it('renders all services', () => {
    render(<Services />);
    const serviceTitles = [
      'AI Business Automation',
      'Technical SEO',
      'Performance Ads',
      'Custom Software',
      'AI Chatbots',
      'Growth Analytics',
    ];
    
    serviceTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('renders service descriptions', () => {
    render(<Services />);
    expect(screen.getByText(/Automate repetitive tasks with n8n/i)).toBeInTheDocument();
    expect(screen.getByText(/High-ROI Google & Meta Ads/i)).toBeInTheDocument();
  });
});
