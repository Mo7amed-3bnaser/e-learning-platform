"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { showSuccess, showError, handleApiError } from '@/lib/toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import AvatarUpload from '@/components/AvatarUpload';
import Breadcrumb from '@/components/Breadcrumb';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiHome } from 'react-icons/fi';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, updateUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من تطابق كلمة المرور
    if (formData.password && formData.password !== formData.confirmPassword) {
      showError('كلمة المرور غير متطابقة');
      return;
    }

    if (formData.password && !formData.currentPassword) {
      showError('برجاء إدخال كلمة المرور الحالية');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // إضافة كلمة المرور لو المستخدم كتبها (مع كلمة المرور الحالية)
      if (formData.password) {
        updateData.newPassword = formData.password;
        updateData.currentPassword = formData.currentPassword;
      }

      const response = await authAPI.updateProfile(updateData);
      const updatedUser = response.data.data;

      // تحديث الـ Store
      if (user) {
        updateUser({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        });
      }

      // لو الباسورد اتغير، حدّث التوكن في الـ Store والـ cookie
      if (updatedUser.token && formData.password) {
        setToken(updatedUser.token);
      }

      showSuccess('تم تحديث البيانات بنجاح! ✨');

      // مسح حقول كلمة المرور
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'الملف الشخصي' }]} className="mb-6" />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">الملف الشخصي</h1>
          <p className="text-slate-600 dark:text-slate-400">إدارة بياناتك الشخصية وصورة البروفايل</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white relative">
            <div className="flex items-center gap-6">
              <AvatarUpload
                currentAvatar={user?.avatar}
                userName={user?.name || 'مستخدم'}
                onAvatarUpdate={(url) => {
                  if (user) {
                    updateUser({ ...user, avatar: url });
                  }
                }}
              />
              <div>
                <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                <p className="text-primary-light mb-2">{user?.email}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {user?.role === 'admin' ? '👨‍💼 مشرف' : '🎓 طالب'}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أحمد محمد"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="01012345678"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">تغيير كلمة المرور (اختياري)</h3>
            </div>

            {/* Current Password Field */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="ادخل كلمة المرور الحالية"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="اتركه فارغاً إذا لم ترد التغيير"
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pr-10 pl-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="أعد كتابة كلمة المرور"
                  minLength={6}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-start">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors inline-flex items-center gap-1.5 group"
              >
                <FiLock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
