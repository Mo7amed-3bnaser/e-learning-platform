import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 * عنصر تحميل يظهر أثناء جلب البيانات
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}) => {
    const baseClasses = 'bg-gray-200 dark:bg-slate-600';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
};

/**
 * Course Card Skeleton
 * هيكل تحميل لكارت الكورس
 */
export const CourseCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Image Skeleton */}
            <Skeleton variant="rectangular" height={200} />

            <div className="p-6 space-y-4">
                {/* Category Badge */}
                <Skeleton width={80} height={24} className="rounded-full" />

                {/* Title */}
                <Skeleton width="100%" height={24} />
                <Skeleton width="80%" height={24} />

                {/* Description */}
                <div className="space-y-2">
                    <Skeleton width="100%" height={16} />
                    <Skeleton width="90%" height={16} />
                    <Skeleton width="70%" height={16} />
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-4">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="60%" height={16} />
                        <Skeleton width="40%" height={14} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <Skeleton width={80} height={24} />
                    <Skeleton width={100} height={36} className="rounded-lg" />
                </div>
            </div>
        </div>
    );
};

/**
 * Table Row Skeleton
 * هيكل تحميل لصف في جدول
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
    return (
        <tr className="border-b">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-6 py-4">
                    <Skeleton height={20} />
                </td>
            ))}
        </tr>
    );
};

/**
 * Comment Skeleton
 * هيكل تحميل للتعليق
 */
export const CommentSkeleton: React.FC = () => {
    return (
        <div className="flex gap-4 p-4 bg-white rounded-lg">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={14} />
                </div>
                <Skeleton width="100%" height={16} />
                <Skeleton width="80%" height={16} />
            </div>
        </div>
    );
};

/**
 * Video Card Skeleton
 * هيكل تحميل لكارت الفيديو
 */
export const VideoCardSkeleton: React.FC = () => {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
            <Skeleton variant="rectangular" width={120} height={68} className="rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton width="70%" height={20} />
                <Skeleton width="40%" height={16} />
            </div>
            <Skeleton variant="circular" width={40} height={40} />
        </div>
    );
};

/**
 * Order Card Skeleton
 * هيكل تحميل لكارت الطلب
 */
export const OrderCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton width={100} height={24} className="rounded-full" />
                <Skeleton width={80} height={20} />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" width={80} height={80} className="rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="80%" height={20} />
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={16} />
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
                <Skeleton width={100} height={24} />
                <Skeleton width={120} height={36} className="rounded-lg" />
            </div>
        </div>
    );
};

/**
 * Page Skeleton
 * هيكل تحميل لصفحة كاملة
 */
export const PageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Skeleton width={300} height={40} />
                    <Skeleton width={500} height={20} />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <CourseCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Skeleton;
