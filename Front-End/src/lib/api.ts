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
    // لو التوكن منتهي أو غير صالح
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
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
  createCourse: (data: FormData) => api.post('/courses', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Admin only - تعديل كورس
  updateCourse: (id: string, data: FormData) =>
    api.put(`/courses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

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
  getCourseVideos: (courseId: string) => api.get(`/videos/course/${courseId}`),

  // Enrolled/Free preview - مشاهدة فيديو محدد
  getVideoById: (videoId: string) => api.get(`/videos/${videoId}`),

  // Admin only - إضافة فيديو جديد
  createVideo: (data: {
    courseId: string;
    title: string;
    bunnyVideoId: string;
    duration: number;
    order?: number;
    isFreePreview?: boolean;
  }) => api.post('/videos', data),

  // Admin only - تعديل فيديو
  updateVideo: (
    id: string,
    data: {
      title?: string;
      bunnyVideoId?: string;
      duration?: number;
      order?: number;
      isFreePreview?: boolean;
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
  createOrder: (data: FormData) => api.post('/orders', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Student - جلب طلبات المستخدم
  getMyOrders: () => api.get('/orders/my-orders'),

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
  rejectOrder: (id: string, reason: string) =>
    api.patch(`/orders/${id}/reject`, { reason }),

  // Admin - حذف طلب
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

// ============================================
// Admin APIs
// ============================================
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: () => api.get('/admin/dashboard'),

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

export default api;
