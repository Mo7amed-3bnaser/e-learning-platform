import Link from 'next/link';
import { FiUsers, FiClock, FiBookOpen } from 'react-icons/fi';

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
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course._id}`}>
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
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
              {course.price === 0 ? 'مجاني' : `${course.price} جنيه`}
            </div>
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

          {/* زر التفاصيل */}
          <div className="mt-4">
            <div className="w-full bg-gradient-to-l from-primary to-primary-dark text-white py-2.5 rounded-xl font-medium text-center group-hover:shadow-lg transition-all">
              عرض التفاصيل
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
