import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../src/frontend/src/components/ui/card';
import { Input } from '../../../src/frontend/src/components/ui/input';
import { Label } from '../../../src/frontend/src/components/ui/label';
import { Textarea } from '../../../src/frontend/src/components/ui/textarea';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('UI Components', () => {
  describe('Card', () => {
    it('renders all card parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders correctly', () => {
      render(<Input placeholder="Test Input" />);
      expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
    });
    
    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('Label', () => {
    it('renders correctly', () => {
      render(<Label htmlFor="test">Label Text</Label>);
      expect(screen.getByText('Label Text')).toBeInTheDocument();
    });
  });

  describe('Textarea', () => {
    it('renders correctly', () => {
      render(<Textarea placeholder="Test Textarea" />);
      expect(screen.getByPlaceholderText('Test Textarea')).toBeInTheDocument();
    });
  });
});
