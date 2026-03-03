'use client';

import './admin.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // انتظر اكتمال تحميل البيانات من localStorage
        if (!_hasHydrated) return;

        const currentUser = useAuthStore.getState().user;
        const currentIsAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!currentIsAuthenticated || !currentUser) {
            router.replace('/login');
            return;
        }

        if (currentUser.role !== 'admin') {
            router.replace('/');
            return;
        }

        setIsLoading(false);
    }, [_hasHydrated, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="admin-wrapper" dir="rtl">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="admin-main">
                {/* Mobile header */}
                <div className="admin-mobile-header">
                    <button
                        className="admin-hamburger"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <h1 className="admin-mobile-title">لوحة التحكم</h1>
                </div>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
