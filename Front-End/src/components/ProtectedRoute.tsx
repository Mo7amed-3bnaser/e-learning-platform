"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import PageLoader from './PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // انتظر اكتمال تحميل البيانات من localStorage قبل التحقق
    if (!_hasHydrated) return;

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
  }, [_hasHydrated, isAuthenticated, user, requireAdmin, router]);

  // عرض loading أثناء التحقق أو التحميل
  if (!_hasHydrated || !isAuthenticated) {
    return <PageLoader message="جاري التحقق من الصلاحيات..." />;
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
