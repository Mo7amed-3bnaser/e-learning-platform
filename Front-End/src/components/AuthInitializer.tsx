"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // تحميل بيانات المستخدم عند بدء التطبيق
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
