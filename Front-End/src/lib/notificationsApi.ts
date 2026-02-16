import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Notification {
    _id: string;
    user: string;
    type: 'order_approved' | 'order_rejected' | 'course_enrolled' | 'certificate_issued' | 'comment_reply' | 'instructor_approved' | 'instructor_rejected' | 'course_published' | 'new_review';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    metadata?: {
        orderId?: string;
        courseId?: string;
        commentId?: string;
        certificateId?: string;
        reviewId?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalNotifications: number;
            hasMore: boolean;
        };
        unreadCount: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        unreadCount: number;
    };
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (page = 1, limit = 20, isRead?: boolean) => {
    const params: any = { page, limit };
    if (isRead !== undefined) {
        params.isRead = isRead;
    }

    const response = await api.get<NotificationsResponse>('/notifications', { params });
    return response.data;
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async () => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async () => {
    const response = await api.delete('/notifications/read');
    return response.data;
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
};
