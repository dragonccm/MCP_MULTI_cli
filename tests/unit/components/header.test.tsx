import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../../src/frontend/src/components/layout/header';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Cpu: () => <div data-testid="icon-cpu" />,
  Menu: () => <div data-testid="icon-menu" />,
  X: () => <div data-testid="icon-x" />,
}));

describe('Header Component', () => {
  it('renders the logo and brand name', () => {
    render(<Header />);
    expect(screen.getByText(/WTF/i)).toBeInTheDocument();
    expect(screen.getByText(/DEV/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Why Us')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Header />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('changes background on scroll', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-transparent');
  });
});
