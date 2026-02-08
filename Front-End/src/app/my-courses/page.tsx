"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiClock, FiBookOpen, FiGrid, FiList, FiBook } from 'react-icons/fi';
import { ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import Header from '@/components/Header';
import { useAuthStore } from '@/store/authStore';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
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
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
              <span className="text-slate-500">عدد الكورسات:</span>
              <span className="font-bold text-primary mr-2">{orders.length}</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="عرض شبكي"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="عرض قائمة"
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiBook className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              لا توجد كورسات حتى الآن
            </h2>
            <p className="text-slate-500 mb-6">
              لم تشترك في أي كورس بعد. تصفح الكورسات المتاحة وابدأ رحلة التعلم!
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-l from-primary to-primary-dark text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              تصفح الكورسات
            </button>
          </div>
        ) : (
          /* Courses Grid/List */
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-green-200 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* صورة الكورس */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 ${
                    viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'
                  }`}
                >
                  {order.courseId?.thumbnail ? (
                    <img
                      src={order.courseId.thumbnail}
                      alt={order.courseId.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
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
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {order.courseId?.title || 'كورس غير متاح'}
                  </h3>

                  {/* المدرس */}
                  {order.courseId?.instructor && (
                    <div className="flex items-center gap-2 mb-4">
                      {order.courseId.instructor.avatar ? (
                        <img
                          src={order.courseId.instructor.avatar}
                          alt={order.courseId.instructor.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">
                          {order.courseId.instructor.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm text-slate-600">{order.courseId.instructor.name}</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* زر اكمل المشاهدة */}
                  <button
                    onClick={() => handleContinueWatching(order.courseId?._id)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:from-green-600 hover:to-emerald-700 group"
                  >
                    <FiPlay className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>اكمل المشاهدة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
