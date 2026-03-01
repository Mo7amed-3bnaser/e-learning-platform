import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUsers, FiClock, FiBookOpen, FiShoppingCart, FiInfo, FiPlay, FiHeart } from 'react-icons/fi';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useCallback, memo } from 'react';
import toast from 'react-hot-toast';

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    category: string;
    instructor: {
      name: string;
      avatar?: string;
      channelLogo?: string;
    } | null;
    studentsCount?: number;
    duration?: string;
    lessonsCount?: number;
    isPublished: boolean;
  };
  isPurchased?: boolean;
}

function CourseCard({ course, isPurchased = false }: CourseCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const inWishlist = isInWishlist(course._id);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/checkout/${course._id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/courses/${course._id}`);
  };

  const handleContinueWatching = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/watch/${course._id}`);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      router.push('/login');
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(course._id);
        toast.success('تمت إزالة الكورس من قائمة الرغبات');
      } else {
        await addToWishlist(course._id);
        toast.success('تمت إضافة الكورس لقائمة الرغبات');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/30 hover:-translate-y-1 hover-lift h-full flex flex-col">
      {/* صورة الكورس */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10 dark:from-primary/20 dark:to-primary-dark/20 image-zoom-container">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover image-zoom"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBookOpen className="w-16 h-16 text-primary/30 dark:text-primary/40" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary dark:text-orange-400 badge-pulse">
            {course.category || 'عام'}
          </span>
        </div>

        {/* Wishlist Button */}
        {!isPurchased && (
          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className={`absolute top-3 left-3 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all ${isTogglingWishlist ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            aria-label={inWishlist ? 'إزالة من قائمة الرغبات' : 'إضافة لقائمة الرغبات'}
          >
            <FiHeart
              className={`w-5 h-5 transition-all ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-400'
                }`}
            />
          </button>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          {isPurchased ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg backdrop-blur-sm flex items-center gap-2 border border-white/20">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span>مشترك</span>
            </div>
          ) : course.price === 0 ? (
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-sm border border-white/20">
              <span className="font-bold text-lg">🎁 مجاني</span>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-500/50 overflow-hidden">
              <div className="px-4 py-2.5 flex items-baseline gap-1">
                <span className="text-xs text-slate-400 dark:text-accent font-medium self-start mt-1">$</span>
                <span className="text-3xl font-black text-primary dark:text-accent">
                  {course.price}
                </span>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 dark:from-primary/30 dark:to-primary-dark/30 px-4 py-1 text-center">
                <span className="text-[10px] font-medium text-primary-dark dark:text-primary-light">دفعة واحدة</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* معلومات الكورس */}
      <div className="p-5 flex flex-col flex-1">
        {/* عنوان الكورس */}
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {course.title}
        </h3>

        {/* الوصف */}
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* معلومات المدرس */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            {course.instructor.channelLogo ? (
              <Image
                src={course.instructor.channelLogo}
                alt={course.instructor.name}
                width={32}
                height={32}
                className="rounded object-cover"
                loading="lazy"
              />
            ) : course.instructor.avatar ? (
              <Image
                src={course.instructor.avatar}
                alt={course.instructor.name}
                width={32}
                height={32}
                className="rounded object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
                {course.instructor.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">المدرس</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {course.instructor.name}
              </p>
            </div>
          </div>
        )}

        {/* إحصائيات */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto">
          {course.studentsCount !== undefined && (
            <div className="flex items-center gap-1">
              <FiUsers className="w-4 h-4" />
              <span>{course.studentsCount} طالب</span>
            </div>
          )}

          {course.lessonsCount !== undefined && (
            <div className="flex items-center gap-1">
              <FiBookOpen className="w-4 h-4" />
              <span>{course.lessonsCount} محاضرة</span>
            </div>
          )}

          {course.duration && (
            <div className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-4 flex gap-2">
          {isPurchased ? (
            /* زر اكمل المشاهدة للكورسات المشتراة */
            <button
              onClick={handleContinueWatching}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:from-green-600 hover:to-green-700"
            >
              <FiPlay className="w-5 h-5" />
              <span>اكمل المشاهدة</span>
            </button>
          ) : (
            /* أزرار التفاصيل والشراء للكورسات الغير مشتراة */
            <>
              {/* زر تفاصيل الكورس */}
              <button
                onClick={handleViewDetails}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-medium transition-all"
              >
                <FiInfo className="w-4 h-4" />
                <span>التفاصيل</span>
              </button>

              {/* زر اشتر الآن */}
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-primary to-primary-dark dark:from-accent dark:to-accent-dark text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all animate-pulse-slow hover:scale-105"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>اشتر الآن</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CourseCard);
