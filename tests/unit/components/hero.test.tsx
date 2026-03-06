import { render, screen } from '@testing-library/react';
import { Hero } from '../../../src/frontend/src/components/home/hero';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Hero Component', () => {
  it('renders the main heading correctly', () => {
    render(<Hero />);
    expect(screen.getByText(/Automate\./i)).toBeInTheDocument();
    expect(screen.getByText(/Scale\./i)).toBeInTheDocument();
    expect(screen.getByText(/Dominate\./i)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Hero />);
    expect(screen.getByText(/WTF DEV empowers SMEs with AI-driven workflows/i)).toBeInTheDocument();
  });

  it('renders primary and secondary CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /Start Your Journey/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Case Studies/i })).toBeInTheDocument();
  });

  it('renders the preview engine text', () => {
    render(<Hero />);
    expect(screen.getByText(/AI Processing Engine/i)).toBeInTheDocument();
  });
});
