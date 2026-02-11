'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiBook, FiDollarSign, FiClock, FiEye } from 'react-icons/fi';
import { adminAPI, ordersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Stats {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    pendingOrders: number;
}

interface Order {
    _id: string;
    userId: { name: string; email: string } | null;
    courseId: { title: string; price: number } | null;
    status: string;
    paymentMethod: string;
    price: number;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                adminAPI.getDashboardStats(),
                ordersAPI.getAllOrders(),
            ]);

            setStats(statsRes.data.data);
            setRecentOrders((ordersRes.data.data || []).slice(0, 10));
        } catch (error: unknown) {
            console.error('Error fetching dashboard data:', error);
            toast.error('حدث خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="admin-badge green">مقبول</span>;
            case 'rejected': return <span className="admin-badge red">مرفوض</span>;
            case 'pending': return <span className="admin-badge yellow">قيد المراجعة</span>;
            default: return <span className="admin-badge gray">{status}</span>;
        }
    };

    const getPaymentMethod = (method: string) => {
        switch (method) {
            case 'vodafone_cash': return 'فودافون كاش';
            case 'instapay': return 'انستاباي';
            case 'bank_transfer': return 'تحويل بنكي';
            default: return method;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>لوحة التحكم</h1>
                    <p>مرحباً بك في لوحة تحكم منصة مسار</p>
                </div>
                <div className="admin-stats-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="admin-stat-card">
                            <div className="admin-skeleton" style={{ width: '44px', height: '44px', marginBottom: '0.75rem' }} />
                            <div className="admin-skeleton" style={{ width: '80px', height: '28px', marginBottom: '0.5rem' }} />
                            <div className="admin-skeleton" style={{ width: '100px', height: '16px' }} />
                        </div>
                    ))}
                </div>
                <div className="admin-table-container">
                    <div className="admin-table-header">
                        <div className="admin-skeleton" style={{ width: '120px', height: '20px' }} />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem' }}>
                            <div className="admin-skeleton" style={{ width: '100%', height: '20px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1>لوحة التحكم</h1>
                <p>مرحباً بك في لوحة تحكم منصة مسار</p>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon blue">
                            <FiUsers />
                        </div>
                    </div>
                    <p className="admin-stat-value">{stats?.totalStudents || 0}</p>
                    <p className="admin-stat-label">إجمالي الطلاب</p>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon purple">
                            <FiBook />
                        </div>
                    </div>
                    <p className="admin-stat-value">{stats?.totalCourses || 0}</p>
                    <p className="admin-stat-label">إجمالي الكورسات</p>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon green">
                            <FiDollarSign />
                        </div>
                    </div>
                    <p className="admin-stat-value">{stats?.totalRevenue || 0} ج.م</p>
                    <p className="admin-stat-label">إجمالي الإيرادات</p>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <div className="admin-stat-icon orange">
                            <FiClock />
                        </div>
                    </div>
                    <p className="admin-stat-value">{stats?.pendingOrders || 0}</p>
                    <p className="admin-stat-label">طلبات قيد المراجعة</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">آخر الطلبات</h3>
                </div>
                <div className="admin-table-wrapper">
                    {recentOrders.length === 0 ? (
                        <div className="admin-empty">
                            <FiEye />
                            <h3>لا توجد طلبات بعد</h3>
                            <p>ستظهر الطلبات هنا عند إنشائها</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>الكورس</th>
                                    <th>السعر</th>
                                    <th>طريقة الدفع</th>
                                    <th>الحالة</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order.userId?.name || 'محذوف'}</td>
                                        <td>{order.courseId?.title || 'محذوف'}</td>
                                        <td>{order.price} ج.م</td>
                                        <td>{getPaymentMethod(order.paymentMethod)}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
