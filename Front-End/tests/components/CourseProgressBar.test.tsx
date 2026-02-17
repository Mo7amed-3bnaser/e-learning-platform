/**
 * Unit Tests - CourseProgressBar Component  
 * اختبارات وحدة لشريط تقدم الكورس
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseProgressBar from '@/components/CourseProgressBar';

describe('CourseProgressBar Component', () => {
  it('should render progress percentage', () => {
    render(
      <CourseProgressBar progress={75} totalVideos={20} completedVideos={15} />
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render completed/total videos count', () => {
    render(
      <CourseProgressBar progress={50} totalVideos={10} completedVideos={5} />
    );
    expect(screen.getByText('5 / 10 درس مكتمل')).toBeInTheDocument();
  });

  it('should render 0% progress', () => {
    render(
      <CourseProgressBar progress={0} totalVideos={10} completedVideos={0} />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 / 10 درس مكتمل')).toBeInTheDocument();
  });

  it('should render completion message at 100%', () => {
    render(
      <CourseProgressBar progress={100} totalVideos={10} completedVideos={10} />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
    // At 100% a completion message appears
    expect(screen.getByText('10 / 10 درس مكتمل')).toBeInTheDocument();
  });

  it('should set progress bar width correctly', () => {
    const { container } = render(
      <CourseProgressBar progress={60} totalVideos={20} completedVideos={12} />
    );
    const progressFill = container.querySelector('[style*="width: 60%"]');
    expect(progressFill).toBeInTheDocument();
  });
});
