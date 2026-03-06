import { render, screen } from '@testing-library/react';
import { Workflow } from '../../../src/frontend/src/components/home/workflow';
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
  Webhook: () => <div data-testid="icon-webhook" />,
  Cpu: () => <div data-testid="icon-cpu" />,
  Database: () => <div data-testid="icon-database" />,
  Slack: () => <div data-testid="icon-slack" />,
  Mail: () => <div data-testid="icon-mail" />,
}));

describe('Workflow Component', () => {
  it('renders the title and description correctly', () => {
    render(<Workflow />);
    expect(screen.getByText(/How We/i)).toBeInTheDocument();
    // Be more specific by checking the heading
    expect(screen.getByRole('heading', { name: /How We Automate Your Business/i })).toBeInTheDocument();
    expect(screen.getByText(/We design and implement complex workflows/i)).toBeInTheDocument();
  });

  it('renders the list of benefits', () => {
    render(<Workflow />);
    expect(screen.getByText(/Instant lead qualification with AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Automated CRM updates/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time notifications/i)).toBeInTheDocument();
  });

  it('renders node names', () => {
    render(<Workflow />);
    expect(screen.getByText(/Lead Capture/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Slack Alert/i)).toBeInTheDocument();
  });
});
