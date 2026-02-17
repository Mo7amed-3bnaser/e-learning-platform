"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import BrandLoader from './BrandLoader';

const FALLBACK_READY_MS = 4000;

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    if (hasHydrated) {
      setIsReady(true);
      
      // جلب قائمة الرغبات عند تسجيل الدخول
      if (isAuthenticated) {
        fetchWishlist().catch(() => {
          // تجاهل الأخطاء - سيتم إعادة المحاولة عند زيارة صفحة wishlist
        });
      }
    }
  }, [hasHydrated, isAuthenticated, fetchWishlist]);

  // Safety: if hydration never fires (e.g. SSR/localStorage edge case), show content after delay
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), FALLBACK_READY_MS);
    return () => clearTimeout(t);
  }, []);

  const handleLoaderFinish = useCallback(() => {
    setLoaderDone(true);
  }, []);

  // Show the branded loader until both data is ready AND loader animation is done
  if (!isReady || !loaderDone) {
    return (
      <>
        <BrandLoader onFinish={handleLoaderFinish} minimumDuration={2800} />
        {/* Pre-render children hidden so they're ready when loader finishes */}
        {isReady && (
          <div style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}>
            {children}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
