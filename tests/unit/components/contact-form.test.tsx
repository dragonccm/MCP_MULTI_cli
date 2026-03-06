import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '../../../src/frontend/src/components/home/contact-form';
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
  Send: () => <div data-testid="icon-send" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
}));

// Mock UI components to avoid potential hook issues in sub-components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: any) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

describe('ContactForm Component', () => {
  it('renders the form fields correctly', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How can we help?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<ContactForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    render(<ContactForm />);
    
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'Acme Inc' } });
    fireEvent.change(screen.getByLabelText(/How can we help?/i), { target: { value: 'I need an automated SEO system for my website.' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Message Received!/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
