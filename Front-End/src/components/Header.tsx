"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { FiUser, FiLogOut, FiGrid, FiBook, FiUserCheck, FiHeart, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    setShowMobileMenu(false);
    router.push('/');
  };

  // Close mobile menu on route change
  const closeMobile = () => setShowMobileMenu(false);

  return (
    <header
      className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50"
      role="banner"
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link href="/" aria-label="الصفحة الرئيسية - مسار">
          <Logo size="md" />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-2 md:gap-3" role="navigation" aria-label="التنقل الرئيسي">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
            aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          <Link href="/courses" className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-accent font-medium transition-colors">
            الكورسات
          </Link>

          {!isHydrated ? (
            <div className="flex items-center gap-3">
              <div className="w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              <div className="w-28 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3" ref={menuRef}>
              <Link href="/dashboard" className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-accent font-medium transition-colors">
                لوحتي
              </Link>
              <NotificationBell />
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  aria-label="قائمة المستخدم"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 bg-linear-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {user?.name || 'مستخدم'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200" role="menu">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 dark:bg-primary/20 rounded-full">
                        <span className="text-xs font-medium text-primary">
                          {user?.role === 'admin' ? '👨‍💼 مشرف' : user?.role === 'instructor' ? '👨‍🏫 مدرب' : '🎓 طالب'}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        { href: '/my-courses', icon: FiBook, label: 'كورساتي' },
                        { href: '/wishlist', icon: FiHeart, label: 'قائمة الرغبات' },
                        { href: '/profile', icon: FiUser, label: 'الملف الشخصي' },
                        { href: '/dashboard', icon: FiGrid, label: 'لوحة التحكم' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                        </Link>
                      ))}
                      {user?.role === 'instructor' && (
                        <Link href="/dashboard/instructor" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-accent/5 dark:hover:bg-accent/10 transition-colors border-t border-slate-100 dark:border-slate-700">
                          <FiUserCheck className="w-4 h-4 text-accent" />
                          <span className="text-sm text-accent font-medium">لوحة المدرب</span>
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700 mt-1">
                        <FiLogOut className="w-4 h-4" />
                        <span className="text-sm">تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 text-slate-700 dark:text-slate-200 hover:text-primary font-medium transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="px-5 py-2 bg-linear-to-l from-primary to-primary-dark text-white rounded-xl hover:opacity-90 transition-all shadow-sm">
                إنشاء حساب
              </Link>
            </>
          )}
        </nav>

        {/* ── Mobile Right Actions ── */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"
            aria-label="تغيير الثيم"
          >
            {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {isAuthenticated && <NotificationBell />}

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="القائمة"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link href="/courses" onClick={closeMobile}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors">
              الكورسات
            </Link>

            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>

                {[
                  { href: '/dashboard', icon: FiGrid, label: 'لوحتي' },
                  { href: '/my-courses', icon: FiBook, label: 'كورساتي' },
                  { href: '/wishlist', icon: FiHeart, label: 'قائمة الرغبات' },
                  { href: '/profile', icon: FiUser, label: 'الملف الشخصي' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                    <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}

                {user?.role === 'instructor' && (
                  <Link href="/dashboard/instructor" onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/10 text-accent transition-colors">
                    <FiUserCheck className="w-5 h-5" />
                    <span className="font-medium">لوحة المدرب</span>
                  </Link>
                )}

                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-1">
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={closeMobile}
                  className="w-full text-center py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/register" onClick={closeMobile}
                  className="w-full text-center py-3 rounded-xl bg-linear-to-l from-primary to-primary-dark text-white font-medium hover:opacity-90 transition-all">
                  إنشاء حساب مجاني
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
