"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { FiUser, FiLogOut, FiGrid, FiBook, FiUserCheck, FiHeart, FiSun, FiMoon } from 'react-icons/fi';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // انتظار تحميل البيانات من localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header
      className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50"
      role="banner"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="الصفحة الرئيسية - مسار">
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-2 md:gap-4" role="navigation" aria-label="التنقل الرئيسي">
          {/* Dark mode toggle - accent (orange) color */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
            aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          <Link
            href="/courses"
            className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-accent font-medium transition-colors"
          >
            الكورسات
          </Link>

          {!isHydrated ? (
            // Loading skeleton أثناء التحميل
            <div className="flex items-center gap-3">
              <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div className="w-28 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            // المستخدم مسجل دخول
            <div className="flex items-center gap-3" ref={menuRef}>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-accent font-medium transition-colors"
              >
                لوحتي
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  aria-label="قائمة المستخدم"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold uppercase overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {user?.name || 'مستخدم'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    role="menu"
                    aria-label="خيارات المستخدم"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">{user?.name || 'مستخدم'}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">البريد:</span>{' '}
                          <span className="font-medium">{user?.email || 'غير متوفر'}</span>
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">الهاتف:</span>{' '}
                          <span className="font-medium">{user?.phone || 'غير متوفر'}</span>
                        </p>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 dark:bg-primary/20 rounded-full">
                        <span className="text-xs font-medium text-primary">
                          {user?.role === 'admin' ? '👨‍💼 مشرف' : user?.role === 'instructor' ? '👨‍🏫 مدرب' : '🎓 طالب'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-courses"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <FiBook className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">كورساتي</span>
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <FiHeart className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">قائمة الرغبات</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">الملف الشخصي</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <FiGrid className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">لوحة التحكم</span>
                      </Link>

                      {/* Instructor Dashboard Link - Instructors Only */}
                      {user?.role === 'instructor' && (
                        <Link
                          href="/dashboard/instructor"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-accent/5 dark:hover:bg-accent/10 transition-colors border-t border-slate-100 dark:border-slate-700"
                        >
                          <FiUserCheck className="w-4 h-4 text-accent" />
                          <div className="flex flex-col">
                            <span className="text-sm text-accent font-medium">لوحة المدرب</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">إدارة كورساتك</span>
                          </div>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span className="text-sm">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // المستخدم غير مسجل دخول
            <>
              <Link
                href="/login"
                className="px-6 py-2.5 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary-light font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-sm hover:shadow-md"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
