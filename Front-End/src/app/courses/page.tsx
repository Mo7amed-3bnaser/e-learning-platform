"use client";

import { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { coursesAPI, ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import CourseCard from '@/components/CourseCard';
import CourseSkeleton from '@/components/CourseSkeleton';
import Header from '@/components/Header';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  studentsCount?: number;
  duration?: string;
  lessonsCount?: number;
  isPublished: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCourses();
    fetchPurchasedCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, courses]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await coursesAPI.getAllCourses();
      const coursesData = response.data.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
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
      // استخراج IDs الكورسات المشتراة والمقبولة فقط
      const purchasedIds = orders
        .filter((order: any) => order.status === 'approved')
        .map((order: any) => {
          // courseId قد يكون string أو object بعد populate
          const id = typeof order.courseId === 'string'
            ? order.courseId
            : order.courseId?._id;
          return id;
        })
        .filter(Boolean);
      setPurchasedCourseIds(purchasedIds);
    } catch (error) {
      // في حالة عدم وجود مستخدم مسجل دخول، نتجاهل الخطأ
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // البحث بالاسم
    if (searchQuery.trim()) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // الفلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    setFilteredCourses(filtered);
  };

  // استخراج الفئات الفريدة
  const categories = ['all', ...new Set(courses.map((c) => c.category))];

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

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full md:max-w-md">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-48 pr-10 pl-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="all">جميع الفئات</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-600">
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

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div
            className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
              }`}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <FiSearch className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              لا توجد كورسات
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'جرب تغيير معايير البحث أو الفلترة'
                : 'لم يتم إضافة أي كورسات بعد'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
              }`}
          >
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isPurchased={purchasedCourseIds.includes(course._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
