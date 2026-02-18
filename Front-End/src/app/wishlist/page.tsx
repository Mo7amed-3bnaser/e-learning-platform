'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import CourseCard from '@/components/CourseCard';
import PageLoader from '@/components/PageLoader';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { FiHeart } from 'react-icons/fi';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { wishlist, isLoading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    // الانتظار حتى يتم تحميل حالة المصادقة
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // جلب قائمة الرغبات
    fetchWishlist();
  }, [isAuthenticated, _hasHydrated, router, fetchWishlist]);

  // عرض شاشة تحميل أثناء التحقق من حالة المصادقة
  if (!_hasHydrated) {
    return <PageLoader message="جاري التحميل..." />;
  }

  // إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    return null;
  }

  // شاشة التحميل
  if (isLoading) {
    return <PageLoader message="جاري تحميل قائمة الرغبات..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'قائمة الرغبات' }]} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
              قائمة الرغبات
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mr-16">
            الكورسات المفضلة التي تريد الالتحاق بها لاحقاً
          </p>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <EmptyState
            icon={FiHeart}
            title="قائمة الرغبات فارغة"
            description="لم تقم بإضافة أي كورسات لقائمة الرغبات بعد"
            action={{ label: 'تصفح الكورسات', href: '/courses' }}
          />
        ) : (
          <>
            {/* Count */}
            <div className="mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-primary">{wishlist.length}</span>{' '}
                {wishlist.length === 1 ? 'كورس' : 'كورس'}
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((course) => (
                <CourseCard
                  key={course._id}
                  course={{
                    _id: course._id,
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    thumbnail: course.thumbnail,
                    category: course.category,
                    instructor: course.instructor
                      ? {
                          name: course.instructor.name,
                          avatar: course.instructor.avatar,
                        }
                      : null,
                    studentsCount: course.enrolledStudents,
                    isPublished: true,
                  }}
                  isPurchased={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
