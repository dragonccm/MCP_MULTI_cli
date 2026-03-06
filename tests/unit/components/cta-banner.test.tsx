import { render, screen } from '@testing-library/react';
import { CTABanner } from '../../../src/frontend/src/components/home/cta-banner';
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
  ArrowRight: () => <div data-testid="icon-arrow" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className }: any) => <button className={className}>{children}</button>,
}));

describe('CTABanner Component', () => {
  it('renders correctly', () => {
    render(<CTABanner />);
    
    expect(screen.getByText(/Ready to Build the Future\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Join 100\+ businesses/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Book a Free Consultation/i })).toBeInTheDocument();
  });
});
