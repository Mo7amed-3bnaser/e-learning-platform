"use client";

import { useState } from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export default function LoadingButton({
  isLoading = false,
  loadingText = 'جاري التحميل...',
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-l from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    success: 'bg-gradient-to-l from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
    danger: 'bg-gradient-to-l from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        relative
        flex items-center justify-center gap-2
        px-6 py-3 rounded-xl font-medium
        transition-all duration-300
        ${variantClasses[variant]}
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover-lift'}
        ${disabled && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <FiLoader className="w-5 h-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
