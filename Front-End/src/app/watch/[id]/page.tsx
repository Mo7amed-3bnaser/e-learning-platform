'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowRight, FiPlay, FiClock, FiCheck, FiLock, FiList } from 'react-icons/fi';
import Header from '@/components/Header';
import YouTubePlayer from '@/components/YouTubePlayer';
import VideoComments from '@/components/VideoComments';
import CourseProgressBar from '@/components/CourseProgressBar';
import VideoCompletionButton from '@/components/VideoCompletionButton';
import VideoProgressIndicator from '@/components/VideoProgressIndicator';
import CertificateCard from '@/components/CertificateCard';
import { coursesAPI, videosAPI, ordersAPI } from '@/lib/api';
import { handleApiError, showToast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';

interface Video {
  _id: string;
  title: string;
  description?: string;
  youtubeVideoId: string;
  duration: number;
  order: number;
  isFreePreview: boolean;
  thumbnail?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar?: string;
  } | null;
}

export default function WatchCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const {
    fetchCourseProgress,
    markVideoComplete,
    updateWatchDuration,
    updateLastWatched,
    getVideoProgress,
    courseProgress
  } = useProgressStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [watchDuration, setWatchDuration] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      router.push(`/login?redirect=/watch/${courseId}`);
      return;
    }

    if (courseId) {
      checkEnrollmentAndFetch();
    }
  }, [courseId, isAuthenticated]);

  // Fetch progress on mount and when enrolled
  useEffect(() => {
    if (courseId && isEnrolled) {
      fetchCourseProgress(courseId);
    }
  }, [courseId, isEnrolled]);

  // Track watch duration
  useEffect(() => {
    if (!currentVideo || !courseId) return;

    const interval = setInterval(() => {
      setWatchDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentVideo?._id, courseId]);

  // Auto-save watch duration every 10 seconds
  useEffect(() => {
    if (!currentVideo || !courseId || watchDuration === 0) return;

    if (watchDuration % 10 === 0) {
      updateWatchDuration(courseId, currentVideo._id, watchDuration);
    }
  }, [watchDuration, currentVideo?._id, courseId]);

  // Update last watched when video changes
  useEffect(() => {
    if (currentVideo && courseId && isEnrolled) {
      updateLastWatched(courseId, currentVideo._id);
      // Reset watch duration when changing videos
      setWatchDuration(0);
    }
  }, [currentVideo?._id, courseId, isEnrolled]);

  const checkEnrollmentAndFetch = async () => {
    try {
      setIsLoading(true);

      // التحقق من التسجيل في الكورس
      const enrollmentRes = await ordersAPI.checkEnrollment(courseId);
      const enrolled = enrollmentRes.data.data.isEnrolled;
      setIsEnrolled(enrolled);

      if (!enrolled) {
        showToast('يجب شراء الكورس أولاً للمشاهدة', 'error');
        router.push(`/courses/${courseId}`);
        return;
      }

      // جلب بيانات الكورس
      const courseRes = await coursesAPI.getCourseById(courseId);
      setCourse(courseRes.data.data);

      // جلب الفيديوهات
      const videosRes = await videosAPI.getCourseVideos(courseId);
      const videosData = videosRes.data.data.videos || [];
      const sortedVideos = videosData.sort(
        (a: Video, b: Video) => a.order - b.order
      );
      setVideos(sortedVideos);

      // تشغيل أول فيديو
      if (sortedVideos.length > 0) {
        setCurrentVideo(sortedVideos[0]);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast('يجب شراء الكورس أولاً', 'error');
        router.push(`/courses/${courseId}`);
      } else {
        handleApiError(error);
        router.push('/courses');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    // على الموبايل، إخفاء الـ playlist بعد الاختيار
    if (window.innerWidth < 1024) {
      setShowPlaylist(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-900 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-96 bg-slate-800 rounded-2xl"></div>
              <div className="h-10 bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course || !currentVideo) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-900 pt-[72px]">
        <div className="flex flex-col lg:flex-row">
          {/* منطقة الفيديو */}
          <div className={`flex-1 transition-all duration-300 ${showPlaylist ? 'lg:pl-[340px]' : 'lg:pl-0'}`}>
            {/* التنقل */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
              <div className="container mx-auto flex items-center justify-between max-w-6xl">
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <FiArrowRight className="w-5 h-5" />
                  <span>رجوع للكورس</span>
                </button>

                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="lg:hidden flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <FiList className="w-5 h-5" />
                  <span>{showPlaylist ? 'إخفاء' : 'القائمة'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar - ثابت على مستوى الكورس */}
            <div className="bg-slate-800/50 border-b border-slate-700">
              <div className="container mx-auto px-4 py-4 max-w-6xl">
                {courseProgress[courseId] && (
                  <CourseProgressBar
                    progress={courseProgress[courseId].overallProgress}
                    totalVideos={courseProgress[courseId].totalVideos}
                    completedVideos={courseProgress[courseId].completedVideos}
                  />
                )}
              </div>
            </div>

            {/* مشغل الفيديو */}
            <div className="bg-slate-900 py-4">
              <div className="container mx-auto px-4 max-w-6xl">
                <YouTubePlayer
                  videoId={currentVideo.youtubeVideoId}
                  title={currentVideo.title}
                  autoplay={true}
                  className="w-full"
                />
              </div>
            </div>

            {/* معلومات الفيديو */}
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">{currentVideo.title}</h1>

                <div className="flex items-center gap-4 text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {formatDuration(currentVideo.duration)}
                  </span>
                  <span>الدرس {currentVideo.order} من {videos.length}</span>
                </div>

                {currentVideo.description && (
                  <p className="text-slate-300 mb-6">{currentVideo.description}</p>
                )}

                {/* Completion Button */}
                <div className="mb-6">
                  <VideoCompletionButton
                    videoId={currentVideo._id}
                    courseId={courseId}
                    isCompleted={getVideoProgress(courseId, currentVideo._id)?.completed || false}
                    onComplete={async () => {
                      await markVideoComplete(courseId, currentVideo._id, watchDuration);
                    }}
                  />
                </div>

                {/* الشهادة - تظهر في آخر فيديو فقط عند الإكمال 100% */}
                {videos.findIndex(v => v._id === currentVideo._id) === videos.length - 1 &&
                 courseProgress[courseId]?.overallProgress === 100 && (
                  <div className="mb-6">
                    <CertificateCard
                      courseId={courseId}
                      courseName={course.title}
                      courseProgress={courseProgress[courseId].overallProgress}
                    />
                  </div>
                )}

                {/* التنقل بين الفيديوهات */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                  <button
                    onClick={() => {
                      const prevIndex = videos.findIndex(v => v._id === currentVideo._id) - 1;
                      if (prevIndex >= 0) {
                        setCurrentVideo(videos[prevIndex]);
                      }
                    }}
                    disabled={videos.findIndex(v => v._id === currentVideo._id) === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    <span>الدرس السابق</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextIndex = videos.findIndex(v => v._id === currentVideo._id) + 1;
                      if (nextIndex < videos.length) {
                        setCurrentVideo(videos[nextIndex]);
                      }
                    }}
                    disabled={videos.findIndex(v => v._id === currentVideo._id) === videos.length - 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>الدرس التالي</span>
                    <FiArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                {/* قسم التعليقات */}
                <VideoComments videoId={currentVideo._id} />
              </div>
            </div>
          </div>

          {/* قائمة الفيديوهات (Sidebar) */}
          <div
            className={`fixed lg:fixed top-[72px] left-0 h-[calc(100vh-72px)] w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 overflow-hidden transform transition-transform duration-300 z-40 shadow-2xl ${
              showPlaylist ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-4 border-b border-slate-700/50 shadow-lg">
              <h2 className="font-bold text-white text-lg truncate">{course.title}</h2>
              <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-2">
                <span className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded text-primary font-medium">
                  <FiPlay className="w-3 h-3" />
                  {videos.length} درس
                </span>
                {course.instructor && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>{course.instructor.name}</span>
                  </>
                )}
              </p>
            </div>

            {/* قائمة الدروس */}
            <div className="overflow-y-auto h-[calc(100%-88px)] custom-scrollbar">
              {videos.map((video, index) => {
                const isActive = currentVideo._id === video._id;

                return (
                  <button
                    key={video._id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-right px-4 py-4 flex items-start gap-3 border-b border-slate-700/30 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/20 to-transparent border-r-4 border-r-primary shadow-lg shadow-primary/10'
                        : 'hover:bg-slate-700/50 hover:border-r-2 hover:border-r-slate-600'
                    }`}
                  >
                    {/* Progress Indicator أو رقم الدرس */}
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white shadow-md"
                        >
                          <FiPlay className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700/50 border border-slate-600/50">
                          {courseProgress[courseId] ? (
                            <VideoProgressIndicator
                              completed={getVideoProgress(courseId, video._id)?.completed || false}
                              watchDuration={getVideoProgress(courseId, video._id)?.watchDuration}
                              totalDuration={video.duration}
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-400">{video.order}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* معلومات الدرس */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm leading-snug mb-1.5 ${
                          isActive ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded">
                          <FiClock className="w-3 h-3" />
                          {formatDuration(video.duration)}
                        </span>
                        {video.isFreePreview && (
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded font-medium">
                            معاينة
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overlay للموبايل */}
          {showPlaylist && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowPlaylist(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
