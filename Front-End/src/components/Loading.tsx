import React from 'react';
import PageLoader from './PageLoader';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

/**
 * Loading Spinner Component
 * دائرة تحميل دوارة
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'text-blue-600',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <svg
                className={`animate-spin ${color}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
};

/**
 * Loading Dots Component
 * نقاط تحميل متحركة
 */
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    );
};

/**
 * Loading Bar Component
 * شريط تحميل أفقي
 */
export const LoadingBar: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`w-full h-1 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden ${className}`}>
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 animate-shimmer" />
        </div>
    );
};

/**
 * Full Page Loading
 * شاشة تحميل كاملة - بتصميم مسار (نفس BrandLoader)
 */
export const FullPageLoading: React.FC<{ message?: string }> = ({ message = 'جاري التحميل...' }) => {
    return <PageLoader message={message} />;
};

/**
 * Inline Loading
 * تحميل داخلي صغير
 */
export const InlineLoading: React.FC<{ message?: string }> = ({ message = 'جاري التحميل...' }) => {
    return (
        <div className="flex items-center justify-center gap-3 py-8">
            <LoadingSpinner size="sm" />
            <span className="text-gray-600 dark:text-slate-400">{message}</span>
        </div>
    );
};

/**
 * Button Loading State
 * حالة تحميل للأزرار
 */
export const ButtonLoading: React.FC = () => {
    return (
        <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" color="text-white" />
            <span>جاري المعالجة...</span>
        </div>
    );
};

/**
 * Card Loading Overlay
 * طبقة تحميل فوق الكارت
 */
export const CardLoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
    return (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-2" />
                {message && <p className="text-sm text-gray-600 dark:text-slate-400">{message}</p>}
            </div>
        </div>
    );
};

/**
 * Pulse Loading
 * تحميل بتأثير النبض
 */
export const PulseLoading: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
    );
};

/**
 * Progress Bar
 * شريط تقدم مع نسبة مئوية
 */
export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({
    progress,
    className = '',
}) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">جاري التحميل</span>
                <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

/**
 * Skeleton Pulse
 * تأثير نبض للـ Skeleton
 */
export const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-slate-600 rounded ${className}`} />
    );
};

export default LoadingSpinner;
