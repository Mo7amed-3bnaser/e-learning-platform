import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiClock, FiBookOpen, FiShoppingCart, FiInfo, FiPlay } from 'react-icons/fi';

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
    };
    studentsCount?: number;
    duration?: string;
    lessonsCount?: number;
    isPublished: boolean;
  };
  isPurchased?: boolean;
}

export default function CourseCard({ course, isPurchased = false }: CourseCardProps) {
  const router = useRouter();

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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20 hover:-translate-y-1">
        {/* صورة الكورس */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary-dark/10">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBookOpen className="w-16 h-16 text-primary/30" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary">
              {course.category || 'عام'}
            </span>
          </div>

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
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="px-4 py-2.5 flex items-baseline gap-1">
                  <span className="text-xs text-slate-400 font-medium self-start mt-1">$</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    {course.price}
                  </span>
                </div>
                <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 px-4 py-1 text-center">
                  <span className="text-[10px] font-medium text-primary-dark">دفعة واحدة</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* معلومات الكورس */}
        <div className="p-5">
          {/* عنوان الكورس */}
          <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* الوصف */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* معلومات المدرس */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            {course.instructor.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
                {course.instructor.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500">المدرس</p>
              <p className="text-sm font-medium text-slate-700">
                {course.instructor.name}
              </p>
            </div>
          </div>

          {/* إحصائيات */}
          <div className="flex items-center justify-between text-xs text-slate-500">
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
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-all"
                >
                  <FiInfo className="w-4 h-4" />
                  <span>التفاصيل</span>
                </button>

                {/* زر اشتر الآن */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-primary to-primary-dark text-white py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
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
