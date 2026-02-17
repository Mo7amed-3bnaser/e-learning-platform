'use client';

import { useState } from 'react';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

export interface CourseFilters {
    category?: string;
    level?: string;
    priceRange?: 'free' | 'paid' | 'all';
    rating?: number;
    sortBy?: 'newest' | 'popular' | 'rating' | 'price-low' | 'price-high';
}

interface CourseFiltersProps {
    filters: CourseFilters;
    onFiltersChange: (filters: CourseFilters) => void;
    categories: string[];
}

export default function CourseFiltersComponent({
    filters,
    onFiltersChange,
    categories,
}: CourseFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const levels = [
        { value: 'beginner', label: 'مبتدئ' },
        { value: 'intermediate', label: 'متوسط' },
        { value: 'advanced', label: 'متقدم' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'الأحدث' },
        { value: 'popular', label: 'الأكثر شعبية' },
        { value: 'rating', label: 'الأعلى تقييماً' },
        { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
        { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
    ];

    const priceOptions = [
        { value: 'all', label: 'الكل' },
        { value: 'free', label: 'مجاني' },
        { value: 'paid', label: 'مدفوع' },
    ];

    const ratingOptions = [5, 4, 3, 2, 1];

    const updateFilter = (key: keyof CourseFilters, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            sortBy: 'newest',
            priceRange: 'all',
        });
    };

    const hasActiveFilters =
        filters.category ||
        filters.level ||
        (filters.priceRange && filters.priceRange !== 'all') ||
        filters.rating;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 lg:mb-0">
                <div className="flex items-center gap-4 flex-1">
                    {/* Sort Dropdown - Always Visible */}
                    <div className="flex-1 lg:flex-initial lg:min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            ترتيب حسب
                        </label>
                        <div className="relative">
                            <select
                                value={filters.sortBy || 'newest'}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white dark:bg-slate-700 cursor-pointer text-gray-900 dark:text-slate-100 dark:[color-scheme:dark]"
                                aria-label="ترتيب الكورسات"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Filter Toggle Button - Mobile Only */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-gray-900 dark:text-slate-100"
                        aria-label="إظهار الفلاتر"
                        aria-expanded={showFilters}
                    >
                        <FiFilter size={18} />
                        <span>فلتر</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                    </button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="hidden lg:flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                        aria-label="مسح جميع الفلاتر"
                    >
                        <FiX size={16} />
                        <span>مسح الفلاتر</span>
                    </button>
                )}
            </div>

            {/* Filters Grid */}
            <div
                className={`
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700
          ${showFilters ? 'block' : 'hidden lg:grid'}
        `}
            >
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        التصنيف
                    </label>
                    <select
                        value={filters.category || ''}
                        onChange={(e) => updateFilter('category', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 dark:[color-scheme:dark]"
                        aria-label="تصنيف الكورس"
                    >
                        <option value="">جميع التصنيفات</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Level Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        المستوى
                    </label>
                    <select
                        value={filters.level || ''}
                        onChange={(e) => updateFilter('level', e.target.value || undefined)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 dark:[color-scheme:dark]"
                        aria-label="مستوى الكورس"
                    >
                        <option value="">جميع المستويات</option>
                        {levels.map((level) => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        السعر
                    </label>
                    <select
                        value={filters.priceRange || 'all'}
                        onChange={(e) => updateFilter('priceRange', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 dark:[color-scheme:dark]"
                        aria-label="نطاق السعر"
                    >
                        {priceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        التقييم
                    </label>
                    <select
                        value={filters.rating || ''}
                        onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 dark:[color-scheme:dark]"
                        aria-label="الحد الأدنى للتقييم"
                    >
                        <option value="">جميع التقييمات</option>
                        {ratingOptions.map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} نجوم فأكثر ⭐
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mobile Clear Filters */}
            {hasActiveFilters && showFilters && (
                <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        aria-label="مسح جميع الفلاتر"
                    >
                        <FiX size={18} />
                        <span>مسح جميع الفلاتر</span>
                    </button>
                </div>
            )}

            {/* Active Filters Tags */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    {filters.category && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            <span>التصنيف: {filters.category}</span>
                            <button
                                onClick={() => updateFilter('category', undefined)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                aria-label={`إزالة فلتر التصنيف: ${filters.category}`}
                            >
                                <FiX size={14} />
                            </button>
                        </span>
                    )}
                    {filters.level && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            <span>المستوى: {levels.find(l => l.value === filters.level)?.label}</span>
                            <button
                                onClick={() => updateFilter('level', undefined)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                aria-label={`إزالة فلتر المستوى`}
                            >
                                <FiX size={14} />
                            </button>
                        </span>
                    )}
                    {filters.priceRange && filters.priceRange !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            <span>السعر: {priceOptions.find(p => p.value === filters.priceRange)?.label}</span>
                            <button
                                onClick={() => updateFilter('priceRange', 'all')}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                aria-label="إزالة فلتر السعر"
                            >
                                <FiX size={14} />
                            </button>
                        </span>
                    )}
                    {filters.rating && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            <span>التقييم: {filters.rating}+ ⭐</span>
                            <button
                                onClick={() => updateFilter('rating', undefined)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                                aria-label="إزالة فلتر التقييم"
                            >
                                <FiX size={14} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
