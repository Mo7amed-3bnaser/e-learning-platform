'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowRight, FiClock, FiUsers, FiBookOpen, FiShoppingCart, FiCheck, FiPlay, FiPlayCircle, FiX, FiLock, FiInfo } from 'react-icons/fi';
import Header from '@/components/Header';
import YouTubePlayer from '@/components/YouTubePlayer';
import { coursesAPI, ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';

interface Video {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
  youtubeVideoId?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  level: string;
  instructor: {
    name: string;
    bio?: string;
    avatar?: string;
    channelLogo?: string;
  };
  enrolledStudents: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  isPublished: boolean;
  videos?: Video[];
  isEnrolled?: boolean;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  const { fetchCourseProgress, courseProgress } = useProgressStore();

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Fetch progress when enrolled
  useEffect(() => {
    if (courseId && isEnrolled) {
      fetchCourseProgress(courseId);
    }
  }, [courseId, isEnrolled]);

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await coursesAPI.getCourseById(courseId);
      const courseData = response.data.data;
      setCourse(courseData);

      // التحقق من التسجيل لو المستخدم مسجل دخول
      if (isAuthenticated) {
        try {
          const enrollmentRes = await ordersAPI.checkEnrollment(courseId);
          setIsEnrolled(enrollmentRes.data.data.isEnrolled);
        } catch (e) {
          // تجاهل الخطأ - المستخدم مش مسجل
        }
      }
    } catch (error) {
      handleApiError(error);
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!course?.videos) return '0:00';
    const total = course.videos.reduce((sum, video) => sum + video.duration, 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} دقيقة`;
  };

  const handleBuyNow = () => {
    router.push(`/checkout/${courseId}`);
  };

  const handleStartWatching = () => {
    router.push(`/watch/${courseId}`);
  };

  const scrollToDetails = () => {
    const detailsSection = document.getElementById('course-details');
    if (detailsSection) {
      detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-slate-200 rounded-2xl"></div>
              <div className="h-10 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* زر الرجوع */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light mb-6 transition-colors"
          >
            <FiArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2 space-y-6" id="course-details">
              {/* صورة الكورس */}
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-white/90 text-lg">{course.description}</p>
                </div>
              </div>

              {/* ما ستتعلمه */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">ما ستتعلمه</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FiCheck className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* محتوى الكورس (أسماء الدروس فقط) */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">محتوى الكورس</h2>

                {course.videos && course.videos.length > 0 ? (
                  <div className="space-y-2">
                    {course.videos
                      .sort((a, b) => a.order - b.order)
                      .map((video, index) => {
                        const canWatch = video.isFreePreview || isEnrolled;

                        return (
                          <div
                            key={video._id}
                            onClick={() => canWatch && video.isFreePreview && !isEnrolled ? setPreviewVideo(video) : null}
                            className={`flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-all ${canWatch && video.isFreePreview && !isEnrolled
                                ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800 cursor-pointer group'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${video.isFreePreview
                                  ? 'bg-green-100 group-hover:bg-green-200'
                                  : 'bg-primary/10'
                                }`}>
                                {video.isFreePreview ? (
                                  <FiPlayCircle className="w-5 h-5 text-green-600" />
                                ) : isEnrolled ? (
                                  <FiPlay className="w-5 h-5 text-primary" />
                                ) : (
                                  <FiLock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                )}
                              </div>
                              <div>
                                <p className={`font-medium ${video.isFreePreview ? 'text-slate-800 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                  {video.title}
                                </p>
                                {video.isFreePreview && (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                    <FiPlay className="w-3 h-3" />
                                    معاينة مجانية - اضغط للمشاهدة
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                <FiClock className="w-4 h-4" />
                                <span>{formatDuration(video.duration)}</span>
                              </div>
                              {video.isFreePreview && !isEnrolled && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                                  مجاني
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">لا توجد دروس متاحة حالياً</p>
                )}
              </div>

              {/* المتطلبات */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">المتطلبات</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-primary mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* نموذج التقييم - يظهر فقط لو الطالب مسجل */}
              {isEnrolled && (
                <ReviewForm
                  courseId={courseId}
                  onReviewSubmitted={() => setReviewRefresh(prev => prev + 1)}
                />
              )}

              {/* قائمة التقييمات - تظهر للجميع */}
              <ReviewsList courseId={courseId} key={reviewRefresh} />
            </div>

            {/* الشريط الجانبي */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* بطاقة الشراء */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700">
                  {isEnrolled ? (
                    // لو الطالب مسجل في الكورس
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-green-600 dark:text-green-400 font-bold text-lg">أنت مسجل في هذا الكورس</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">يمكنك البدء في المشاهدة الآن</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleStartWatching}
                          className="flex-1 bg-gradient-to-l from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <FiPlayCircle className="w-5 h-5" />
                          <span>ابدأ المشاهدة</span>
                        </button>

                        <button
                          onClick={scrollToDetails}
                          className="flex-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 py-4 rounded-xl font-semibold hover:border-primary hover:text-primary dark:hover:border-primary-light dark:hover:text-primary-light transition-all flex items-center justify-center gap-2"
                        >
                          <FiInfo className="w-5 h-5" />
                          <span>تفاصيل الكورس</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // لو الطالب مش مسجل
                    <>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-primary mb-2">
                          ${course.price}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">دفعة واحدة فقط</p>
                      </div>

                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-gradient-to-l from-primary to-primary-dark text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        <span>اشتر الآن</span>
                      </button>
                    </>
                  )}

                  {/* معلومات الكورس */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FiUsers className="w-4 h-4" />
                        الطلاب
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{course.enrolledStudents} طالب</span>
                    </div>

                    {course.videos && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <FiBookOpen className="w-4 h-4" />
                            الدروس
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">{course.videos.length} درس</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <FiClock className="w-4 h-4" />
                            المدة
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">{getTotalDuration()}</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">المستوى</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* معلومات المدرس */}
                {course.instructor && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">المدرب</h3>
                    <div className="flex items-center gap-3">
                      {course.instructor.channelLogo ? (
                        <img
                          src={course.instructor.channelLogo}
                          alt={course.instructor.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold">
                          {course.instructor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{course.instructor.name}</p>
                        {course.instructor.bio && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Video Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-primary to-primary-dark p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiPlay className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">معاينة مجانية</p>
                  <h3 className="text-white font-bold text-lg">{previewVideo.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black">
              {previewVideo.youtubeVideoId ? (
                <YouTubePlayer videoId={previewVideo.youtubeVideoId} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>الفيديو غير متاح</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(previewVideo.duration)}</span>
              </div>
              <button
                onClick={() => {
                  setPreviewVideo(null);
                  handleBuyNow();
                }}
                className="flex items-center gap-2 bg-gradient-to-l from-primary to-primary-dark text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>اشتر الكورس كاملاً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
