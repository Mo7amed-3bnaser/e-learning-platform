/**
 * Unit Tests - EmptyState Component
 * اختبارات وحدة لمكون الحالة الفارغة
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState } from '@/components/EmptyState';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('EmptyState Component', () => {
  it('should render title', () => {
    render(<EmptyState title="لا توجد كورسات" />);
    expect(screen.getByText('لا توجد كورسات')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <EmptyState
        title="لا توجد كورسات"
        description="ابدأ بإضافة كورسات جديدة"
      />
    );
    expect(screen.getByText('ابدأ بإضافة كورسات جديدة')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(<EmptyState title="لا توجد كورسات" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('should render icon when provided', () => {
    render(
      <EmptyState
        title="لا توجد كورسات"
        icon={<span data-testid="test-icon">📚</span>}
      />
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render link action when href is provided', () => {
    render(
      <EmptyState
        title="لا توجد كورسات"
        action={{ label: 'تصفح الكورسات', href: '/courses' }}
      />
    );
    const link = screen.getByText('تصفح الكورسات');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/courses');
  });

  it('should render button action when onClick is provided', () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        title="لا توجد كورسات"
        action={{ label: 'حاول مرة أخرى', onClick }}
      />
    );
    const button = screen.getByText('حاول مرة أخرى');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="لا توجد كورسات" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
