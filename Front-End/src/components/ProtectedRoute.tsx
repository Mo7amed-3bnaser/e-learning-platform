"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // التحقق من تسجيل الدخول
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // التحقق من صلاحيات الأدمن
    if (requireAdmin && user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, requireAdmin, router]);

  // عرض loading أثناء التحقق
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ للصلاحيات
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            غير مصرح لك بالدخول
          </h2>
          <p className="text-gray-600">هذه الصفحة مخصصة للمشرفين فقط</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
