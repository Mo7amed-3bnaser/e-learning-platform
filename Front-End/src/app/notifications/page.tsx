'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    type Notification,
} from '@/lib/notificationsApi';
import { showSuccess, showError } from '@/lib/toast';
import { useRouter } from 'next/navigation';

const NOTIFICATION_ICONS: Record<Notification['type'], string> = {
    order_approved: '🎉',
    order_rejected: '❌',
    certificate_issued: '🎓',
    course_enrolled: '📚',
    comment_reply: '💬',
    instructor_approved: '✅',
    instructor_rejected: '🚫',
    course_published: '🚀',
    new_review: '⭐',
};

function formatTimeAgo(date: string) {
    const diffInSeconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [isDeletingRead, setIsDeletingRead] = useState(false);

    const fetchNotifications = useCallback(async (page = 1, currentFilter = filter) => {
        setIsLoading(true);
        try {
            const isRead = currentFilter === 'unread' ? false : currentFilter === 'read' ? true : undefined;
            const response = await getNotifications(page, 15, isRead);
            setNotifications(response.data.notifications);
            setTotalPages(response.data.pagination.totalPages);
            setUnreadCount(response.data.unreadCount);
            setCurrentPage(page);
        } catch {
            showError('حدث خطأ أثناء جلب الإشعارات');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNotifications(1, filter);
    }, [filter, fetchNotifications]);

    const handleMarkAsRead = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id);
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {
                showError('حدث خطأ');
            }
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            showSuccess('تم تحديد جميع الإشعارات كمقروءة');
        } catch {
            showError('حدث خطأ أثناء تحديث الإشعارات');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            showSuccess('تم حذف الإشعار');
        } catch {
            showError('حدث خطأ أثناء حذف الإشعار');
        }
    };

    const handleDeleteAllRead = async () => {
        setIsDeletingRead(true);
        try {
            await deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
            showSuccess('تم حذف جميع الإشعارات المقروءة');
        } catch {
            showError('حدث خطأ أثناء الحذف');
        } finally {
            setIsDeletingRead(false);
        }
    };

    const readCount = notifications.filter(n => n.isRead).length;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <Header />
                <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
                    <Breadcrumb
                        items={[
                            { label: 'لوحة التحكم', href: '/dashboard' },
                            { label: 'الإشعارات' },
                        ]}
                        className="mb-6"
                    />

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6 animate-fadeIn">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">الإشعارات</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    لديك <span className="text-primary font-semibold">{unreadCount}</span> إشعار غير مقروء
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                                >
                                    تحديد الكل كمقروء
                                </button>
                            )}
                            {readCount > 0 && (
                                <button
                                    onClick={handleDeleteAllRead}
                                    disabled={isDeletingRead}
                                    className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    {isDeletingRead ? 'جاري الحذف...' : 'حذف المقروءة'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 mb-4 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit animate-fadeInUp stagger-2">
                        {(['all', 'unread', 'read'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    filter === tab
                                        ? 'bg-primary text-white shadow-sm scale-[1.03]'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {tab === 'all' ? 'الكل' : tab === 'unread' ? 'غير مقروء' : 'مقروء'}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in stagger-3">
                        {isLoading ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="p-4 flex items-start gap-4 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-20 text-center animate-fadeIn">
                                <div className="text-6xl mb-4 animate-float inline-block">🔔</div>
                                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : filter === 'read' ? 'لا توجد إشعارات مقروءة' : 'لا توجد إشعارات'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    ستظهر إشعاراتك هنا عند وصولها
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map((notification, i) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleMarkAsRead(notification)}
                                        style={{ animationDelay: `${Math.min(i * 45, 450)}ms` }}
                                        className={`p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 group animate-fadeInUp ${
                                            !notification.isRead
                                                ? 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110">
                                            {NOTIFICATION_ICONS[notification.type] ?? '🔔'}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-semibold ${!notification.isRead ? 'text-slate-900 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={(e) => handleDelete(notification._id, e)}
                                            className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                                            aria-label="حذف الإشعار"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6 animate-fadeIn">
                            <button
                                onClick={() => fetchNotifications(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => fetchNotifications(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
