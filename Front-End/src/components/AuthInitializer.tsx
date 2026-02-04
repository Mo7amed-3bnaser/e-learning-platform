"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // انتظر حتى يتم تحميل البيانات من localStorage
    if (hasHydrated) {
      setIsReady(true);
    }
  }, [hasHydrated]);

  // عرض شاشة تحميل بسيطة أثناء انتظار hydration
  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
