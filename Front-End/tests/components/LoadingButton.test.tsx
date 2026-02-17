/**
 * Unit Tests - LoadingButton Component
 * اختبارات وحدة لزر التحميل
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingButton from '@/components/LoadingButton';

describe('LoadingButton Component', () => {
  it('should render children when not loading', () => {
    render(<LoadingButton>تسجيل الدخول</LoadingButton>);
    expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
  });

  it('should show loading text when isLoading is true', () => {
    render(
      <LoadingButton isLoading={true} loadingText="جاري التحميل...">
        تسجيل الدخول
      </LoadingButton>
    );
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    expect(screen.queryByText('تسجيل الدخول')).not.toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        إرسال
      </LoadingButton>
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <LoadingButton disabled={true}>
        إرسال
      </LoadingButton>
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should call onClick when not loading or disabled', () => {
    const onClick = jest.fn();
    render(
      <LoadingButton onClick={onClick}>
        إرسال
      </LoadingButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when loading', () => {
    const onClick = jest.fn();
    render(
      <LoadingButton isLoading={true} onClick={onClick}>
        إرسال
      </LoadingButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <LoadingButton className="w-full">
        إرسال
      </LoadingButton>
    );
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});
