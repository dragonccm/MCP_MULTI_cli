import { render, screen } from '@testing-library/react';
import { Testimonials } from '../../../src/frontend/src/components/home/testimonials';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { TESTIMONIALS } from '../../../src/frontend/src/lib/constants';

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
  Quote: () => <div data-testid="icon-quote" />,
}));

describe('Testimonials Component', () => {
  it('renders all testimonials correctly', () => {
    render(<Testimonials />);
    
    expect(screen.getByText(/Trusted by/i)).toBeInTheDocument();
    expect(screen.getByText(/Industry Leaders/i)).toBeInTheDocument();

    TESTIMONIALS.forEach(t => {
      expect(screen.getByText(new RegExp(t.name, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(t.role, 'i'))).toBeInTheDocument();
      // Use matcher function to handle text broken up by quotes/whitespace
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && content.includes(t.content);
      })).toBeInTheDocument();
      expect(screen.getByText(t.avatar)).toBeInTheDocument();
    });
  });
});
