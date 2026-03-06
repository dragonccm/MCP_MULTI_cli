import { render, screen } from '@testing-library/react';
import { CaseStudies } from '../../../src/frontend/src/components/home/case-studies';
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
  ArrowUpRight: () => <div data-testid="icon-arrow" />,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

describe('CaseStudies Component', () => {
  it('renders correctly', () => {
    render(<CaseStudies />);
    
    expect(screen.getByText(/Real Results for/i)).toBeInTheDocument();
    expect(screen.getByText(/Real Businesses/i)).toBeInTheDocument();

    const studies = [
      'E-commerce Giant Automation',
      'SaaS Lead Gen Engine',
      'Logistics Fleet Optimization',
    ];
    
    studies.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('3.5x')).toBeInTheDocument();
    expect(screen.getByText('20k+')).toBeInTheDocument();
  });
});
