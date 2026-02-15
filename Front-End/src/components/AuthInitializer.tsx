"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const FALLBACK_READY_MS = 2500;

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      setIsReady(true);
    }
  }, [hasHydrated]);

  // Safety: if hydration never fires (e.g. SSR/localStorage edge case), show content after delay
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), FALLBACK_READY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
