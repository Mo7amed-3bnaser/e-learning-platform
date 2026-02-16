"use client";

import { useEffect, useState, useMemo } from 'react';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import { coursesAPI, ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import CourseCard from '@/components/CourseCard';
import { CourseCardSkeleton, NoCoursesFound } from '@/components/ui';
import CourseFiltersComponent, { CourseFilters } from '@/components/CourseFilters';
import Header from '@/components/Header';

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CourseFilters>({
    sortBy: 'newest',
    priceRange: 'all',
  });

  useEffect(() => {
    fetchCourses();
    fetchPurchasedCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await coursesAPI.getAllCourses();
      const coursesData = response.data.data || [];
      setCourses(coursesData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      const orders = response.data.data || [];
      const purchasedIds = orders
        .filter((order: any) => order.status === 'approved')
        .map((order: any) => {
          const id = typeof order.courseId === 'string'
            ? order.courseId
            : order.courseId?._id;
          return id;
        })
        .filter(Boolean);
      setPurchasedCourseIds(purchasedIds);
    } catch (error) {
      // Ignore error if user is not logged in
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            تصفح الكورسات 📚
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            اختر الكورس المناسب لك وابدأ رحلة التعلم الآن
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full md:max-w-md">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                aria-label="البحث عن كورس"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                aria-label="عرض شبكي"
                aria-pressed={viewMode === 'grid'}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                aria-label="عرض قائمة"
                aria-pressed={viewMode === 'list'}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600" role="status" aria-live="polite">
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
          <div
            className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
              }`}
            role="list"
            aria-label="قائمة الكورسات"
          >
            {filteredCourses.map((course) => (
              <div key={course._id} role="listitem">
                <CourseCard
                  course={course}
                  isPurchased={purchasedCourseIds.includes(course._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
