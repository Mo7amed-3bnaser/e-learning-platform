'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * Applies theme class to document (dark/light) for Tailwind and CSS variables.
 * Must wrap app so theme is applied after hydration.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useThemeStore((s) => s.theme);

  // قراءة الـ theme من localStorage بشكل synchronous عند أول تحميل على الـ client
  // هذا يضمن إن الـ store يحتوي على القيمة الصحيحة قبل أي render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('masar-theme');
      const parsed = stored ? JSON.parse(stored) : null;
      const savedTheme = (parsed?.state?.theme || 'light') as 'dark' | 'light';
      // نحدث الـ store مباشرة بدون انتظار async rehydration
      useThemeStore.setState({ theme: savedTheme, _hasHydrated: true });
    } catch {
      useThemeStore.setState({ _hasHydrated: true });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
