import { render, screen } from '@testing-library/react';
import { Footer } from '../../../src/frontend/src/components/layout/footer';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Cpu: () => <div data-testid="icon-cpu" />,
  Linkedin: () => <div data-testid="icon-linkedin" />,
  Twitter: () => <div data-testid="icon-twitter" />,
  Facebook: () => <div data-testid="icon-facebook" />,
}));

describe('Footer Component', () => {
  it('renders the brand name and description', () => {
    render(<Footer />);
    // Check for brand name in the logo link area specifically or use getAll and pick one
    expect(screen.getAllByText(/WTF/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DEV/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/leading AI-first engineering agency/i)).toBeInTheDocument();
  });

  it('renders company links', () => {
    render(<Footer />);
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Why Us')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
  });

  it('renders social media icons', () => {
    render(<Footer />);
    expect(screen.getByTestId('icon-linkedin')).toBeInTheDocument();
    expect(screen.getByTestId('icon-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('icon-facebook')).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} WTF DEV Agency`, 'i'))).toBeInTheDocument();
  });
});
