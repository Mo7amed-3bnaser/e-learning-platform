import useSWR, { SWRConfiguration } from 'swr';
import { coursesAPI, ordersAPI, reviewsAPI, progressAPI, certificatesAPI, commentsAPI } from '@/lib/api';

/**
 * SWR hooks for data caching + automatic revalidation
 * يوفر caching للبيانات + إعادة تحميل تلقائية
 */

// ─── Default SWR config ───
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,     // Deduplicate requests within 5s
  errorRetryCount: 2,
};

// ─── Generic fetcher helpers ───
const fetcher = async <T>(fn: () => Promise<{ data: T }>): Promise<T> => {
  const response = await fn();
  return response.data;
};

// ═══════════════════════════════════
// Courses Hooks
// ═══════════════════════════════════

/** Fetch all published courses */
export function useAllCourses(config?: SWRConfiguration) {
  return useSWR(
    'courses/all',
    () => fetcher(() => coursesAPI.getAllCourses()),
    { ...defaultConfig, ...config }
  );
}

/** Fetch course details by ID */
export function useCourse(courseId: string | null, config?: SWRConfiguration) {
  return useSWR(
    courseId ? `courses/${courseId}` : null,
    () => fetcher(() => coursesAPI.getCourseById(courseId!)),
    { ...defaultConfig, ...config }
  );
}

/** Admin - Fetch all courses */
export function useAllCoursesAdmin(config?: SWRConfiguration) {
  return useSWR(
    'courses/admin/all',
    () => fetcher(() => coursesAPI.getAllCoursesAdmin()),
    { ...defaultConfig, ...config }
  );
}

// ═══════════════════════════════════
// Orders Hooks
// ═══════════════════════════════════

/** Fetch user's orders */
export function useMyOrders(config?: SWRConfiguration) {
  return useSWR(
    'orders/my-orders',
    () => fetcher(() => ordersAPI.getMyOrders()),
    { ...defaultConfig, ...config }
  );
}

/** Check enrollment status */
export function useEnrollmentCheck(courseId: string | null, config?: SWRConfiguration) {
  return useSWR(
    courseId ? `orders/enrollment/${courseId}` : null,
    () => fetcher(() => ordersAPI.checkEnrollment(courseId!)),
    { ...defaultConfig, ...config }
  );
}

// ═══════════════════════════════════
// Reviews Hooks
// ═══════════════════════════════════

/** Fetch course reviews */
export function useCourseReviews(courseId: string | null, config?: SWRConfiguration) {
  return useSWR(
    courseId ? `reviews/${courseId}` : null,
    () => fetcher(() => reviewsAPI.getCourseReviews(courseId!)),
    { ...defaultConfig, ...config }
  );
}

// ═══════════════════════════════════
// Progress Hooks
// ═══════════════════════════════════

/** Fetch course progress */
export function useCourseProgress(courseId: string | null, config?: SWRConfiguration) {
  return useSWR(
    courseId ? `progress/course/${courseId}` : null,
    () => fetcher(() => progressAPI.getCourseProgress(courseId!)),
    { ...defaultConfig, ...config }
  );
}

// ═══════════════════════════════════
// Comments Hooks
// ═══════════════════════════════════

/** Fetch video comments */
export function useVideoComments(videoId: string | null, config?: SWRConfiguration) {
  return useSWR(
    videoId ? `comments/${videoId}` : null,
    () => fetcher(() => commentsAPI.getVideoComments(videoId!)),
    { ...defaultConfig, ...config }
  );
}

// ═══════════════════════════════════
// Certificates Hooks
// ═══════════════════════════════════

/** Fetch certificate for course */
export function useCourseCertificate(courseId: string | null, config?: SWRConfiguration) {
  return useSWR(
    courseId ? `certificates/${courseId}` : null,
    () => fetcher(() => certificatesAPI.getCertificate(courseId!)),
    { ...defaultConfig, shouldRetryOnError: false, ...config }
  );
}
