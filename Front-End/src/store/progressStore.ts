import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { progressAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface VideoProgress {
  videoId: string;
  completed: boolean;
  completedAt?: Date;
  watchDuration: number;
  lastWatchedAt?: Date;
}

interface CourseProgress {
  courseId: string;
  overallProgress: number; // 0-100
  lastWatchedVideo?: string;
  lastWatchedAt?: Date;
  totalVideos: number;
  completedVideos: number;
  videoProgress: Record<string, VideoProgress>; // videoId -> progress
}

interface ProgressState {
  // State
  courseProgress: Record<string, CourseProgress>; // courseId -> progress
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  fetchCourseProgress: (courseId: string) => Promise<void>;
  markVideoComplete: (courseId: string, videoId: string, watchDuration?: number) => Promise<void>;
  updateWatchDuration: (courseId: string, videoId: string, duration: number) => void;
  updateLastWatched: (courseId: string, videoId: string) => void;
  getVideoProgress: (courseId: string, videoId: string) => VideoProgress | null;
  setHasHydrated: (state: boolean) => void;
}

// Debounce helper for watch duration updates
const debounceTimers: Record<string, NodeJS.Timeout> = {};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      courseProgress: {},
      isLoading: false,
      _hasHydrated: false,

      fetchCourseProgress: async (courseId: string) => {
        try {
          set({ isLoading: true });

          const response = await progressAPI.getCourseProgress(courseId);

          if (response.data.success) {
            const progressData = response.data.data;

            set((state) => ({
              courseProgress: {
                ...state.courseProgress,
                [courseId]: {
                  courseId,
                  overallProgress: progressData.overallProgress,
                  lastWatchedVideo: progressData.lastWatchedVideo,
                  lastWatchedAt: progressData.lastWatchedAt,
                  totalVideos: progressData.totalVideos,
                  completedVideos: progressData.completedVideos,
                  videoProgress: progressData.videoProgress
                }
              },
              isLoading: false
            }));
          }
        } catch (error: any) {
          console.error('Error fetching course progress:', error);
          set({ isLoading: false });
          // Don't show error toast for 403 (not enrolled)
          if (error.response?.status !== 403) {
            toast.error('فشل تحميل تقدم الكورس');
          }
        }
      },

      markVideoComplete: async (courseId: string, videoId: string, watchDuration?: number) => {
        try {
          // Optimistic update
          set((state) => {
            const course = state.courseProgress[courseId];
            if (!course) return state;

            const updatedVideoProgress = {
              ...course.videoProgress,
              [videoId]: {
                videoId,
                completed: true,
                completedAt: new Date(),
                watchDuration: watchDuration || course.videoProgress[videoId]?.watchDuration || 0,
                lastWatchedAt: new Date()
              }
            };

            const completedVideos = Object.values(updatedVideoProgress).filter(vp => vp.completed).length;
            const overallProgress = course.totalVideos > 0
              ? Math.round((completedVideos / course.totalVideos) * 100)
              : 0;

            return {
              courseProgress: {
                ...state.courseProgress,
                [courseId]: {
                  ...course,
                  videoProgress: updatedVideoProgress,
                  completedVideos,
                  overallProgress
                }
              }
            };
          });

          // API call
          const response = await progressAPI.markComplete({
            videoId,
            courseId,
            watchDuration
          });

          if (response.data.success) {
            toast.success('تم تحديد الفيديو كمكتمل ✓');
          }
        } catch (error: any) {
          console.error('Error marking video complete:', error);
          toast.error('فشل تحديث التقدم');

          // Revert optimistic update on error
          await get().fetchCourseProgress(courseId);
        }
      },

      updateWatchDuration: (courseId: string, videoId: string, duration: number) => {
        // Update local state immediately
        set((state) => {
          const course = state.courseProgress[courseId];
          if (!course) return state;

          const existingProgress = course.videoProgress[videoId];

          return {
            courseProgress: {
              ...state.courseProgress,
              [courseId]: {
                ...course,
                videoProgress: {
                  ...course.videoProgress,
                  [videoId]: {
                    videoId,
                    completed: existingProgress?.completed || false,
                    completedAt: existingProgress?.completedAt,
                    watchDuration: duration,
                    lastWatchedAt: new Date()
                  }
                }
              }
            }
          };
        });

        // Debounced API call (save every 10 seconds)
        const key = `${courseId}-${videoId}`;
        if (debounceTimers[key]) {
          clearTimeout(debounceTimers[key]);
        }

        debounceTimers[key] = setTimeout(async () => {
          try {
            await progressAPI.updateWatchDuration({
              videoId,
              courseId,
              watchDuration: duration
            });
          } catch (error) {
            console.error('Error updating watch duration:', error);
            // Silent fail - not critical
          }
        }, 10000); // 10 seconds
      },

      updateLastWatched: async (courseId: string, videoId: string) => {
        try {
          // Update local state
          set((state) => {
            const course = state.courseProgress[courseId];
            if (!course) return state;

            return {
              courseProgress: {
                ...state.courseProgress,
                [courseId]: {
                  ...course,
                  lastWatchedVideo: videoId,
                  lastWatchedAt: new Date()
                }
              }
            };
          });

          // API call
          await progressAPI.updateLastWatched({
            courseId,
            videoId
          });
        } catch (error) {
          console.error('Error updating last watched:', error);
          // Silent fail - not critical
        }
      },

      getVideoProgress: (courseId: string, videoId: string): VideoProgress | null => {
        const course = get().courseProgress[courseId];
        if (!course) return null;
        return course.videoProgress[videoId] || null;
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      }
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => localStorage),
      // حفظ البيانات المهمة فقط
      partialize: (state) => ({
        courseProgress: state.courseProgress
      }),
      // عند انتهاء تحميل البيانات من localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      }
    }
  )
);
