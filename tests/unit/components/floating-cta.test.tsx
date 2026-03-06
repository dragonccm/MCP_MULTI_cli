import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingCTA } from '../../../src/frontend/src/components/home/floating-cta';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// More explicit mock for this test
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div onClick={onClick} {...props}>{children}</div>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="icon-message" />,
  X: () => <div data-testid="icon-x" />,
  PhoneCall: () => <div data-testid="icon-phone" />,
}));

describe('FloatingCTA Component', () => {
  it('is initially closed', () => {
    render(<FloatingCTA />);
    expect(screen.queryByText(/Messenger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Zalo/i)).not.toBeInTheDocument();
  });

  it('opens and closes when the main button is clicked', async () => {
    render(<FloatingCTA />);
    const mainButton = screen.getByRole('button');
    
    // Open
    fireEvent.click(mainButton);
    await waitFor(() => {
      expect(screen.getByText(/Messenger/i)).toBeInTheDocument();
    });
    
    // Close
    fireEvent.click(mainButton);
    await waitFor(() => {
      expect(screen.queryByText(/Messenger/i)).not.toBeInTheDocument();
    });
  });
});
