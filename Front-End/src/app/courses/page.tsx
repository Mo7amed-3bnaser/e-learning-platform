"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import CourseCard from '@/components/CourseCard';
import { CourseCardSkeleton, NoCoursesFound } from '@/components/ui';
import CourseFiltersComponent, { CourseFilters } from '@/components/CourseFilters';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { useAllCourses, useMyOrders } from '@/hooks/useSWRApi';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  level: string;
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  enrolledStudents?: number;
  duration?: string;
  lessonsCount?: number;
  isPublished: boolean;
  createdAt: string;
}

const PAGE_SIZE = 9;

export default function CoursesPage() {
  // SWR for courses — automatic caching + revalidation
  const { data: coursesData, isLoading: coursesLoading } = useAllCourses();
  const { data: ordersData } = useMyOrders({ errorRetryCount: 0 });

  const courses: Course[] = (coursesData as any)?.data || [];
  const purchasedCourseIds: string[] = useMemo(() => {
    const orders = (ordersData as any)?.data || [];
    return orders
      .filter((order: any) => order.status === 'approved')
      .map((order: any) => {
        const id = typeof order.courseId === 'string'
          ? order.courseId
          : order.courseId?._id;
        return id;
      })
      .filter(Boolean);
  }, [ordersData]);

  const isLoading = coursesLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<CourseFilters>({
    sortBy: 'newest',
    priceRange: 'all',
  });

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filters]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.category)));
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search by title or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((course) => course.category === filters.category);
    }

    // Filter by level
    if (filters.level) {
      filtered = filtered.filter((course) => course.level === filters.level);
    }

    // Filter by price range
    if (filters.priceRange === 'free') {
      filtered = filtered.filter((course) => course.price === 0);
    } else if (filters.priceRange === 'paid') {
      filtered = filtered.filter((course) => course.price > 0);
    }

    // Filter by rating
    if (filters.rating) {
      filtered = filtered.filter(
        (course) => (course.rating?.average || 0) >= filters.rating!
      );
    }

    // Sort courses
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [courses, searchQuery, filters]);

  const visibleCourses = useMemo(() => filteredCourses.slice(0, visibleCount), [filteredCourses, visibleCount]);
  const hasMore = visibleCount < filteredCourses.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800" id="main-content">
      {/* Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-linear-to-l from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-14">
          <Breadcrumb items={[{ label: 'الكورسات' }]} variant="dark" className="mb-5 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            تصفح الكورسات 📚
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            اختر الكورس المناسب لك وابدأ رحلة التعلم الآن
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full md:max-w-md">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                aria-label="البحث عن كورس"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                aria-label="عرض شبكي"
                aria-pressed={viewMode === 'grid'}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                aria-label="عرض قائمة"
                aria-pressed={viewMode === 'list'}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400" role="status" aria-live="polite">
            {isLoading ? (
              'جاري التحميل...'
            ) : (
              <>
                عرض <span className="font-bold text-primary">{filteredCourses.length}</span> من{' '}
                <span className="font-bold">{courses.length}</span> كورس
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <CourseFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />

        {/* Courses Grid */}
        {isLoading ? (
          <div
            className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <NoCoursesFound
            searchTerm={searchQuery || filters.category || ''}
          />
        ) : (
          <>
            <div
              className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
                }`}
              role="list"
              aria-label="قائمة الكورسات"
            >
              {visibleCourses.map((course) => (
                <div key={course._id} role="listitem">
                  <CourseCard
                    course={course}
                    isPurchased={purchasedCourseIds.includes(course._id)}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  عرض {visibleCount} من {filteredCourses.length} كورس
                </p>
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  تحميل المزيد
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
