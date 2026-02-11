'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiEye, FiCheck, FiX, FiTrash2, FiImage } from 'react-icons/fi';
import { ordersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Order {
    _id: string;
    userId: { _id: string; name: string; email: string; phone: string } | null;
    courseId: { _id: string; title: string; price: number; thumbnail: string } | null;
    status: string;
    paymentMethod: string;
    screenshotUrl: string;
    price: number;
    rejectionReason?: string;
    createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await ordersAPI.getAllOrders();
            setOrders(res.data.data || []);
        } catch {
            toast.error('حدث خطأ في تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            await ordersAPI.approveOrder(orderId);
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: 'approved' } : o))
            );
            toast.success('تم قبول الطلب بنجاح');
        } catch {
            toast.error('حدث خطأ في قبول الطلب');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        try {
            setActionLoading(rejectId);
            await ordersAPI.rejectOrder(rejectId, rejectReason || 'لم يتم تحديد سبب');
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === rejectId ? { ...o, status: 'rejected', rejectionReason: rejectReason } : o
                )
            );
            toast.success('تم رفض الطلب');
            setRejectId(null);
            setRejectReason('');
        } catch {
            toast.error('حدث خطأ في رفض الطلب');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await ordersAPI.deleteOrder(deleteId);
            setOrders((prev) => prev.filter((o) => o._id !== deleteId));
            toast.success('تم حذف الطلب بنجاح');
            setDeleteId(null);
        } catch {
            toast.error('حدث خطأ في حذف الطلب');
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const pendingCount = orders.filter((o) => o.status === 'pending').length;

    if (loading) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>إدارة الطلبات</h1>
                    <p>مراجعة وإدارة طلبات الشراء</p>
                </div>
                <div className="admin-table-container">
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
                <h1>إدارة الطلبات</h1>
                <p>مراجعة وإدارة طلبات الشراء ({orders.length} طلب{pendingCount > 0 ? ` • ${pendingCount} قيد المراجعة` : ''})</p>
            </div>

            {/* Filter Tabs */}
            <div className="admin-filter-tabs" style={{ marginBottom: '1.5rem' }}>
                {([
                    { key: 'all', label: `الكل (${orders.length})` },
                    { key: 'pending', label: `قيد المراجعة (${orders.filter(o => o.status === 'pending').length})` },
                    { key: 'approved', label: `مقبول (${orders.filter(o => o.status === 'approved').length})` },
                    { key: 'rejected', label: `مرفوض (${orders.filter(o => o.status === 'rejected').length})` },
                ] as { key: FilterStatus; label: string }[]).map((tab) => (
                    <button
                        key={tab.key}
                        className={`admin-filter-tab ${filter === tab.key ? 'active' : ''}`}
                        onClick={() => setFilter(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-table-container">
                <div className="admin-table-wrapper">
                    {filteredOrders.length === 0 ? (
                        <div className="admin-empty">
                            <FiSearch />
                            <h3>لا توجد طلبات</h3>
                            <p>{filter === 'all' ? 'لم يتم إنشاء أي طلبات بعد' : 'لا توجد طلبات في هذا التصنيف'}</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>الكورس</th>
                                    <th>السعر</th>
                                    <th>طريقة الدفع</th>
                                    <th>الإثبات</th>
                                    <th>الحالة</th>
                                    <th>التاريخ</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{order.userId?.name || 'محذوف'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.userId?.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.courseId?.title || 'محذوف'}
                                        </td>
                                        <td>${order.price}</td>
                                        <td>{getPaymentMethod(order.paymentMethod)}</td>
                                        <td>
                                            {order.screenshotUrl ? (
                                                <button
                                                    className="admin-btn ghost sm"
                                                    onClick={() => setScreenshotUrl(order.screenshotUrl)}
                                                    title="عرض الإثبات"
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                            ) : (
                                                <span style={{ color: '#475569', fontSize: '0.75rem' }}>لا يوجد</span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div className="admin-actions">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="admin-btn success sm"
                                                            onClick={() => handleApprove(order._id)}
                                                            disabled={actionLoading === order._id}
                                                            title="قبول"
                                                        >
                                                            <FiCheck size={14} />
                                                        </button>
                                                        <button
                                                            className="admin-btn warning sm"
                                                            onClick={() => setRejectId(order._id)}
                                                            disabled={actionLoading === order._id}
                                                            title="رفض"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="admin-btn danger sm"
                                                    onClick={() => setDeleteId(order._id)}
                                                    title="حذف"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Screenshot Modal */}
            {screenshotUrl && (
                <div className="admin-modal-overlay" onClick={() => setScreenshotUrl(null)}>
                    <div className="admin-modal admin-screenshot-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <h3>إثبات الدفع</h3>
                        <img src={screenshotUrl} alt="Payment Screenshot" />
                        <div className="admin-modal-actions" style={{ marginTop: '1rem' }}>
                            <button className="admin-btn ghost" onClick={() => setScreenshotUrl(null)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="admin-modal-overlay" onClick={() => { setRejectId(null); setRejectReason(''); }}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>رفض الطلب</h3>
                        <p>يرجى تحديد سبب الرفض (اختياري)</p>
                        <textarea
                            className="admin-form-textarea"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="سبب الرفض..."
                            style={{ minHeight: '80px', marginBottom: '1rem' }}
                        />
                        <div className="admin-modal-actions">
                            <button className="admin-btn danger" onClick={handleReject} disabled={actionLoading === rejectId}>
                                {actionLoading === rejectId ? 'جاري الرفض...' : 'رفض الطلب'}
                            </button>
                            <button className="admin-btn ghost" onClick={() => { setRejectId(null); setRejectReason(''); }}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>حذف الطلب</h3>
                        <p>هل أنت متأكد من حذف هذا الطلب؟</p>
                        <div className="admin-modal-actions">
                            <button className="admin-btn danger" onClick={handleDelete}>حذف</button>
                            <button className="admin-btn ghost" onClick={() => setDeleteId(null)}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
