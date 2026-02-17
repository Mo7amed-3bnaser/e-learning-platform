import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// إنشاء instance من axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - إضافة التوكن تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // لو السيرفر مش متاح أصلاً - لا نسجل خروج
    if (!error.response) {
      // السيرفر مش متاح أو مشكلة في الشبكة
      console.warn('Server is not available or network error');
      return Promise.reject(error);
    }
    
    // لو التوكن منتهي أو غير صالح فقط في طلبات محمية
    // نتحقق من رسالة الخطأ للتأكد أنها مشكلة توكن وليس مشكلة أخرى
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const isTokenError = 
        errorMessage.includes('توكن') || 
        errorMessage.includes('token') ||
        errorMessage.includes('مصرح') ||
        errorMessage.includes('unauthorized');
      
      // فقط نسجل خروج لو المشكلة فعلاً في التوكن
      // ولو كان في توكن محفوظ (يعني المستخدم كان مسجل دخول)
      if (isTokenError && useAuthStore.getState().token) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// Authentication APIs
// ============================================
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getProfile: () => api.get('/auth/me'),

  updateProfile: (data: { name?: string; email?: string; phone?: string; avatar?: string }) =>
    api.put('/auth/profile', data),

  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),
};

// ============================================
// Courses APIs
// ============================================
export const coursesAPI = {
  // Public - جلب جميع الكورسات المنشورة
  getAllCourses: () => api.get('/courses'),

  // Public/OptionalAuth - تفاصيل كورس معين
  getCourseById: (id: string) => api.get(`/courses/${id}`),

  // Admin only - إنشاء كورس جديد
  createCourse: (data: Record<string, unknown>) => api.post('/courses', data),

  // Admin only - تعديل كورس
  updateCourse: (id: string, data: Record<string, unknown>) =>
    api.put(`/courses/${id}`, data),

  // Admin only - حذف كورس
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),

  // Admin only - نشر/إخفاء كورس
  togglePublish: (id: string) => api.patch(`/courses/${id}/publish`),

  // Admin only - جميع الكورسات (منشورة وغير منشورة)
  getAllCoursesAdmin: () => api.get('/courses/admin/all'),
};

// ============================================
// Videos APIs
// ============================================
export const videosAPI = {
  // Enrolled students only - جلب فيديوهات الكورس
  getCourseVideos: (courseId: string) => api.get(`/videos/${courseId}`),

  // Enrolled/Free preview - مشاهدة فيديو محدد
  getVideoById: (videoId: string) => api.get(`/videos/watch/${videoId}`),

  // Admin only - إضافة فيديو جديد
  createVideo: (data: {
    courseId: string;
    title: string;
    youtubeVideoId: string;
    videoProvider?: string;
    duration: number;
    order?: number;
    isFreePreview?: boolean;
    description?: string;
  }) => api.post('/videos', data),

  // Admin only - تعديل فيديو
  updateVideo: (
    id: string,
    data: {
      title?: string;
      youtubeVideoId?: string;
      duration?: number;
      order?: number;
      isFreePreview?: boolean;
      description?: string;
    }
  ) => api.put(`/videos/${id}`, data),

  // Admin only - حذف فيديو
  deleteVideo: (id: string) => api.delete(`/videos/${id}`),
};

// ============================================
// Orders APIs
// ============================================
export const ordersAPI = {
  // Student - إنشاء طلب شراء جديد
  createOrder: (data: { courseId: string; paymentMethod: string; screenshotUrl: string }) =>
    api.post('/orders', data),

  // Student - جلب طلبات المستخدم
  getMyOrders: () => api.get('/orders/my-orders'),

  // 🎮 Sandbox Payment - دفع تجريبي فوري
  sandboxPayment: (courseId: string) => 
    api.post('/orders/sandbox/pay', { courseId }),

  // Student - التحقق من التسجيل في كورس
  checkEnrollment: (courseId: string) => 
    api.get(`/orders/enrollment/${courseId}`),

  // Admin - جلب الطلبات المعلقة
  getPendingOrders: () => api.get('/orders/pending'),

  // Admin - جلب جميع الطلبات
  getAllOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get('/orders', { params }),

  // Admin - قبول طلب
  approveOrder: (id: string) => api.patch(`/orders/${id}/approve`),

  // Admin - رفض طلب
  rejectOrder: (id: string, rejectionReason: string) =>
    api.patch(`/orders/${id}/reject`, { rejectionReason }),

  // Admin - حذف طلب
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

// ============================================
// Admin APIs
// ============================================
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get('/admin/stats'),

  // Students management
  getAllStudents: () => api.get('/admin/students'),

  searchStudents: (query: string) => api.get(`/admin/students/search?q=${query}`),

  blockStudent: (id: string, isBlocked: boolean) =>
    api.patch(`/admin/students/${id}/block`, { isBlocked }),

  deleteStudent: (id: string) => api.delete(`/admin/students/${id}`),
};

// ============================================
// Upload APIs
// ============================================
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============================================
// Comments APIs
// ============================================
export const commentsAPI = {
  // Public - جلب تعليقات فيديو معين
  getVideoComments: (videoId: string) => api.get(`/comments/${videoId}`),

  // Protected - إضافة تعليق جديد
  addComment: (data: { videoId: string; content: string }) =>
    api.post('/comments', data),

  // Protected - تعديل تعليق
  updateComment: (commentId: string, content: string) =>
    api.put(`/comments/${commentId}`, { content }),

  // Protected - حذف تعليق
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
};

// ============================================
// Progress Tracking APIs
// ============================================
export const progressAPI = {
  // Mark video as complete
  markComplete: (data: { videoId: string; courseId: string; watchDuration?: number }) =>
    api.post('/progress/mark-complete', data),

  // Update watch duration
  updateWatchDuration: (data: { videoId: string; courseId: string; watchDuration: number }) =>
    api.post('/progress/update-watch-duration', data),

  // Get course progress
  getCourseProgress: (courseId: string) =>
    api.get(`/progress/course/${courseId}`),

  // Update last watched video
  updateLastWatched: (data: { courseId: string; videoId: string }) =>
    api.post('/progress/update-last-watched', data),
};

// ============================================
// Certificates APIs
// ============================================
export const certificatesAPI = {
  // Get certificate for a course
  getCertificate: (courseId: string) =>
    api.get(`/certificates/${courseId}`),

  // Verify certificate by ID
  verifyCertificate: (certificateId: string) =>
    api.get(`/certificates/verify/${certificateId}`),
};

// ============================================
// Reviews APIs
// ============================================
export const reviewsAPI = {
  // Get all reviews for a course
  getCourseReviews: (courseId: string) =>
    api.get(`/reviews/${courseId}`),

  // Add or update review
  addOrUpdateReview: (data: { courseId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),

  // Get my review for a course
  getMyReview: (courseId: string) =>
    api.get(`/reviews/my-review/${courseId}`),

  // Check if can review
  canReview: (courseId: string) =>
    api.get(`/reviews/can-review/${courseId}`),

  // Delete review
  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),
};

// ============================================
// Wishlist APIs
// ============================================
export const wishlistAPI = {
  // Get user wishlist
  getWishlist: () => api.get('/wishlist'),

  // Add course to wishlist
  addToWishlist: (courseId: string) =>
    api.post(`/wishlist/${courseId}`),

  // Remove course from wishlist
  removeFromWishlist: (courseId: string) =>
    api.delete(`/wishlist/${courseId}`),

  // Check if course is in wishlist
  checkWishlist: (courseId: string) =>
    api.get(`/wishlist/check/${courseId}`),
};

export default api;
