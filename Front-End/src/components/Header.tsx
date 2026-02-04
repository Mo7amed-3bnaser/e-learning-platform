"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import Logo from './Logo';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/courses"
            className="px-4 py-2 text-slate-700 hover:text-primary font-medium transition-colors"
          >
            الكورسات
          </Link>

          {isAuthenticated ? (
            // المستخدم مسجل دخول
            <div className="flex items-center gap-3" ref={menuRef}>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-slate-700 hover:text-primary font-medium transition-colors"
              >
                لوحتي
              </Link>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold uppercase overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.name || 'مستخدم'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-lg mb-2">{user?.name || 'مستخدم'}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-medium">البريد:</span>{' '}
                          <span className="font-medium">{user?.email || 'غير متوفر'}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="text-xs text-slate-500 font-medium">الهاتف:</span>{' '}
                          <span className="font-medium">{user?.phone || 'غير متوفر'}</span>
                        </p>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                        <span className="text-xs font-medium text-primary">
                          {user?.role === 'admin' ? '👨‍💼 مشرف' : '🎓 طالب'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">الملف الشخصي</span>
                      </Link>
                      
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <FiGrid className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">لوحة التحكم</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
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
                className="px-6 py-2.5 text-slate-700 hover:text-primary font-medium transition-colors"
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
