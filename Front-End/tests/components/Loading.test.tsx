/**
 * Unit Tests - Loading Components
 * اختبارات وحدة لمكونات التحميل
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingSpinner, LoadingDots, LoadingBar, FullPageLoading } from '@/components/Loading';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render with default size (md)', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should render with small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('should render with large size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-12', 'h-12');
    });

    it('should render with xl size', () => {
      const { container } = render(<LoadingSpinner size="xl" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-16', 'h-16');
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingSpinner className="mx-auto" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('mx-auto');
    });

    it('should contain an SVG with animate-spin', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('animate-spin');
    });
  });

  describe('LoadingDots', () => {
    it('should render 3 dots', () => {
      const { container } = render(<LoadingDots />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingDots className="my-custom" />);
      expect(container.firstChild).toHaveClass('my-custom');
    });
  });

  describe('LoadingBar', () => {
    it('should render a progress bar', () => {
      const { container } = render(<LoadingBar />);
      expect(container.firstChild).toHaveClass('w-full', 'h-1');
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingBar className="mt-4" />);
      expect(container.firstChild).toHaveClass('mt-4');
    });
  });

  describe('FullPageLoading', () => {
    it('should render default message', () => {
      render(<FullPageLoading />);
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    });

    it('should render custom message', () => {
      render(<FullPageLoading message="جاري حفظ البيانات..." />);
      expect(screen.getByText('جاري حفظ البيانات...')).toBeInTheDocument();
    });
  });
});
