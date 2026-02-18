import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
    // Accept either a rendered element OR a component class/function (e.g. FiHeart or <FiHeart />)
    icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

/**
 * Empty State Component
 * يعرض رسالة عندما لا توجد بيانات
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = '',
}) => {
    // Support both JSX elements and component references (e.g. icon={FiHeart} or icon={<FiHeart />})
    const renderIcon = () => {
        if (!icon) return null;
        if (typeof icon === 'function') {
            const IconComponent = icon as React.ComponentType<{ className?: string }>;
            return <IconComponent className="w-16 h-16" />;
        }
        return icon;
    };

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {/* Icon */}
            {icon && (
                <div className="mb-6 text-gray-400 dark:text-slate-500">
                    {renderIcon()}
                </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2 text-center">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-gray-600 dark:text-slate-400 text-center max-w-md mb-8">
                    {description}
                </p>
            )}

            {/* Action Button */}
            {action && (
                <>
                    {action.href ? (
                        <Link
                            href={action.href}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            onClick={action.onClick}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:from-primary-dark hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {action.label}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

/**
 * No Courses Found
 * لا توجد كورسات
 */
export const NoCoursesFound: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            }
            title={searchTerm ? `لا توجد نتائج لـ "${searchTerm}"` : 'لا توجد كورسات متاحة'}
            description={
                searchTerm
                    ? 'حاول البحث بكلمات مختلفة أو تصفح جميع الكورسات'
                    : 'لم يتم إضافة أي كورسات بعد. تحقق مرة أخرى لاحقاً'
            }
            action={
                searchTerm
                    ? { label: 'عرض جميع الكورسات', href: '/courses' }
                    : { label: 'العودة للصفحة الرئيسية', href: '/' }
            }
        />
    );
};

/**
 * No Orders Found
 * لا توجد طلبات
 */
export const NoOrdersFound: React.FC = () => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
            }
            title="لا توجد طلبات"
            description="لم تقم بإنشاء أي طلبات شراء بعد. ابدأ بتصفح الكورسات المتاحة"
            action={{ label: 'تصفح الكورسات', href: '/courses' }}
        />
    );
};

/**
 * No Comments Found
 * لا توجد تعليقات
 */
export const NoCommentsFound: React.FC = () => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            }
            title="لا توجد تعليقات بعد"
            description="كن أول من يعلق على هذا الفيديو وشارك رأيك"
        />
    );
};

/**
 * No Students Found
 * لا يوجد طلاب
 */
export const NoStudentsFound: React.FC = () => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            }
            title="لا يوجد طلاب"
            description="لم يتم العثور على أي طلاب مطابقين لمعايير البحث"
        />
    );
};

/**
 * No Videos Found
 * لا توجد فيديوهات
 */
export const NoVideosFound: React.FC = () => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            }
            title="لا توجد فيديوهات"
            description="لم يتم إضافة أي فيديوهات لهذا الكورس بعد"
        />
    );
};

/**
 * No Enrolled Courses
 * لا توجد كورسات مسجل فيها
 */
export const NoEnrolledCourses: React.FC = () => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            }
            title="لم تسجل في أي كورس بعد"
            description="ابدأ رحلتك التعليمية الآن واستكشف الكورسات المتاحة"
            action={{ label: 'استكشف الكورسات', href: '/courses' }}
        />
    );
};

/**
 * Search No Results
 * لا توجد نتائج بحث
 */
export const SearchNoResults: React.FC<{ searchTerm: string; onClear?: () => void }> = ({
    searchTerm,
    onClear,
}) => {
    return (
        <EmptyState
            icon={
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            }
            title={`لا توجد نتائج لـ "${searchTerm}"`}
            description="حاول البحث بكلمات مختلفة أو تحقق من الإملاء"
            action={onClear ? { label: 'مسح البحث', onClick: onClear } : undefined}
        />
    );
};

export default EmptyState;
