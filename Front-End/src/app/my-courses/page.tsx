"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiClock, FiBookOpen, FiGrid, FiList, FiBook, FiInfo } from 'react-icons/fi';
import Image from 'next/image';
import { ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuthStore } from '@/store/authStore';
import { CourseCardSkeleton, NoEnrolledCourses, FullPageLoading } from '@/components/ui';

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
  lessonsCount?: number;
  duration?: string;
}

interface Order {
  _id: string;
  courseId: Course;
  status: string;
  createdAt: string;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getMyOrders();
      const allOrders = response.data.data || [];
      // فلترة الطلبات المقبولة فقط
      const approvedOrders = allOrders.filter((order: Order) => order.status === 'approved');
      setOrders(approvedOrders);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWatching = (courseId: string) => {
    router.push(`/watch/${courseId}`);
  };

  const handleViewDetails = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Header />
        {/* Header skeleton */}
        <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-4 pt-10 pb-14">
            <div className="h-4 w-20 bg-white/20 rounded animate-pulse mb-5" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl animate-pulse" />
              <div>
                <div className="h-10 w-48 bg-white/20 rounded animate-pulse mb-2" />
                <div className="h-5 w-64 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        {/* Course cards skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />

      {/* Page Header */}
      <div className="bg-linear-to-l from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-14">
          <Breadcrumb items={[{ label: 'كورساتي' }]} variant="dark" className="mb-5 opacity-80" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <FiBook className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">كورساتي 📚</h1>
              <p className="text-xl text-white/90 mt-2">
                جميع الكورسات التي اشتركت فيها
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats & View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">عدد الكورسات:</span>
              <span className="font-bold text-primary mr-2">{orders.length}</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              title="عرض شبكي"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              title="عرض قائمة"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Courses Grid/List */}
        {orders.length === 0 ? (
          <NoEnrolledCourses />
        ) : (
          /* Courses Grid/List */
          <div
            className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800/50 ${viewMode === 'list' ? 'flex' : ''
                  }`}
              >
                {/* صورة الكورس */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'
                    }`}
                >
                  {order.courseId?.thumbnail ? (
                    <Image
                      src={order.courseId.thumbnail}
                      alt={order.courseId.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center min-h-[12rem]">
                      <FiBookOpen className="w-16 h-16 text-primary/30" />
                    </div>
                  )}

                  {/* Enrolled Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <span>✓</span>
                      <span>مشترك</span>
                    </div>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-xl">
                      <FiPlay className="w-8 h-8 text-primary mr-[-2px]" />
                    </div>
                  </div>
                </div>

                {/* معلومات الكورس */}
                <div className={`p-5 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  {/* Category */}
                  {order.courseId?.category && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full w-fit mb-2">
                      {order.courseId.category}
                    </span>
                  )}

                  {/* عنوان الكورس */}
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                    {order.courseId?.title || 'كورس غير متاح'}
                  </h3>

                  {/* المدرس */}
                  {order.courseId?.instructor && (
                    <div className="flex items-center gap-2 mb-4">
                      {order.courseId.instructor.avatar ? (
                        <Image
                          src={order.courseId.instructor.avatar}
                          alt={order.courseId.instructor.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">
                          {order.courseId.instructor.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm text-slate-600 dark:text-slate-400">{order.courseId.instructor.name}</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* أزرار التنقل */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleContinueWatching(order.courseId?._id)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:from-green-600 hover:to-emerald-700 group"
                    >
                      <FiPlay className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>اكمل المشاهدة</span>
                    </button>

                    <button
                      onClick={() => handleViewDetails(order.courseId?._id)}
                      className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 py-2.5 rounded-xl font-medium hover:border-primary hover:text-primary dark:hover:border-primary-light dark:hover:text-primary-light transition-all"
                    >
                      <FiInfo className="w-4 h-4" />
                      <span className="text-sm">تفاصيل الكورس</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
