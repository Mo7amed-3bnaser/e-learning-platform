/**
 * Unit Tests - StarRating Component
 * اختبارات وحدة لمكون تقييم النجوم
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarRating from '@/components/StarRating';

describe('StarRating Component', () => {
  it('should render 5 star buttons', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('should display the rating number when showNumber is true', () => {
    render(<StarRating rating={4.5} showNumber={true} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should not display the rating number by default', () => {
    render(<StarRating rating={4.5} />);
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('should disable buttons when not interactive', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should enable buttons when interactive', () => {
    render(<StarRating rating={3} interactive={true} onChange={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should call onChange when interactive star is clicked', () => {
    const onChange = jest.fn();
    render(<StarRating rating={3} interactive={true} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[4]); // Click 5th star
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('should not call onChange when not interactive', () => {
    const onChange = jest.fn();
    render(<StarRating rating={3} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
