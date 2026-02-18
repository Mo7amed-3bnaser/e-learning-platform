"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FiBook, FiClock, FiAward, FiShoppingBag } from 'react-icons/fi';
import { CourseCardSkeleton, NoEnrolledCourses } from '@/components/ui';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';

interface EnrolledCourse {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: {
    name: string;
  };
  progress?: number;
}

interface Order {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // جلب الطلبات
      const ordersResponse = await ordersAPI.getMyOrders();
      const orders = ordersResponse.data.data || [];
      setRecentOrders(orders.slice(0, 5)); // آخر 5 طلبات

      // جلب الكورسات المشترك فيها من الطلبات المقبولة
      const approvedOrders = orders.filter((order: Order) => order.status === 'approved');
      const enrolledCoursesData = approvedOrders.map((order: Order) => ({
        _id: order.courseId._id,
        title: order.courseId.title,
        thumbnail: order.courseId.thumbnail,
        description: '',
        category: '',
        instructor: { name: '' },
        progress: 0,
      }));

      // إزالة الكورسات المكررة بناءً على _id
      const uniqueCourses = enrolledCoursesData.filter((course, index, self) =>
        index === self.findIndex((c) => c._id === course._id)
      );

      setEnrolledCourses(uniqueCourses);

      // حساب الإحصائيات
      setStats({
        totalCourses: uniqueCourses.length,
        completedCourses: 0,
        inProgressCourses: uniqueCourses.length,
      });

    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'مقبول';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <Header />
        {/* Welcome Banner */}
        <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  مرحباً، {user?.name} 👋
                </h1>
                <p className="text-white/80">
                  {user?.email} • {user?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'لوحة التحكم' }]} className="mb-6" />
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">إجمالي الكورسات</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                  <FiBook className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">قيد الدراسة</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.inProgressCourses}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">مكتملة</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedCourses}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* الكورسات المشترك فيها */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    كورساتي
                  </h2>
                  <Link
                    href="/courses"
                    className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm font-medium"
                  >
                    تصفح المزيد ←
                  </Link>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <CourseCardSkeleton key={i} />
                    ))}
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <NoEnrolledCourses />
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course._id}/watch`}
                        className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-100 dark:border-slate-700"
                      >
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiBook className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {course.instructor?.name || 'مدرس غير معروف'}
                          </p>
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                              متابعة الدراسة
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - الطلبات الأخيرة */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <FiShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    طلباتي الأخيرة
                  </h2>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm text-center py-8">
                    لا توجد طلبات بعد
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100 text-sm mb-1">
                          {order.courseId.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        {order.status === 'rejected' && order.rejectionReason && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            السبب: {order.rejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/orders"
                  className="block mt-4 text-center text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm font-medium"
                >
                  عرض جميع الطلبات ←
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
