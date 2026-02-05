"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import Logo from "@/components/Logo";
import LoadingButton from "@/components/LoadingButton";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/lib/api";
import { showSuccess, showError, handleApiError } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    // تحميل البيانات المحفوظة لو موجودة
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remembered-login');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          email: parsed.email || '',
          password: parsed.password || '',
          rememberMe: true,
        };
      }
    }
    return {
      email: '',
      password: '',
      rememberMe: false,
    };
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      const { data } = response.data;
      
      // حفظ البيانات للمرة القادمة إذا كان "تذكرني" مفعل
      if (formData.rememberMe) {
        localStorage.setItem('remembered-login', JSON.stringify({
          email: formData.email,
          password: formData.password,
        }));
      } else {
        localStorage.removeItem('remembered-login');
      }
      
      // حفظ بيانات المستخدم في Store
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar: data.avatar || null,
      };
      
      // حفظ البيانات في Store
      login(data.token, userData);
      
      // عرض رسالة نجاح
      showSuccess(response.data.message || 'تم تسجيل الدخول بنجاح!');
      
      // انتظار قليل لضمان حفظ البيانات في localStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // التوجيه حسب نوع المستخدم
      if (data.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (error: unknown) {
      handleApiError(error);
      // في حالة الخطأ، نحتفظ بالبيانات في النموذج
      // لا نعمل reset للـ form
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        {/* Back Button - Top Right */}
        <Link
          href="/"
          className="absolute top-6 right-6 inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group"
        >
          <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">العودة للرئيسية</span>
        </Link>
        
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex justify-center">
              <Logo size="lg" />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-slate-800">
              مرحباً بعودتك! 👋
            </h1>
            <p className="mt-2 text-slate-500">
              سجل دخولك للمتابعة في رحلة التعلم
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="mr-2 block text-sm text-slate-600 cursor-pointer"
                >
                  تذكرني
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="جاري تسجيل الدخول..."
              variant="primary"
              className="w-full"
            >
              تسجيل الدخول
            </LoadingButton>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-600">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary-dark to-slate-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            ابدأ رحلة التعلم
          </h2>
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            انضم إلى آلاف المتعلمين واكتشف مسارك نحو النجاح مع أفضل الدورات
            التعليمية
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">+500</div>
              <div className="text-white/60 text-sm mt-1">دورة تعليمية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">+10K</div>
              <div className="text-white/60 text-sm mt-1">طالب نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">+50</div>
              <div className="text-white/60 text-sm mt-1">مدرب خبير</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-10 w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-accent/60 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}
