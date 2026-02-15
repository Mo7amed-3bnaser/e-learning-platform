"use client";

import { useEffect, useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OrderCardSkeleton, NoOrdersFound } from '@/components/ui';
import Link from 'next/link';
import { FiShoppingBag, FiArrowRight, FiFilter, FiClock, FiCheckCircle, FiXCircle, FiPackage } from 'react-icons/fi';

interface Order {
    _id: string;
    courseId: {
        _id: string;
        title: string;
        thumbnail: string;
        price: number;
    };
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod: string;
    price: number;
    screenshotUrl?: string;
    rejectionReason?: string;
    createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data.data || []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'مقبول';
            case 'pending':
                return 'قيد المراجعة';
            case 'rejected':
                return 'مرفوض';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <FiCheckCircle className="w-4 h-4" />;
            case 'pending':
                return <FiClock className="w-4 h-4" />;
            case 'rejected':
                return <FiXCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'vodafone_cash':
                return 'فودافون كاش';
            case 'instapay':
                return 'انستاباي';
            case 'bank_transfer':
                return 'تحويل بنكي';
            default:
                return method;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    const filterTabs: { key: FilterStatus; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: `الكل (${orders.length})`, icon: <FiPackage className="w-4 h-4" /> },
        { key: 'pending', label: `قيد المراجعة (${orders.filter(o => o.status === 'pending').length})`, icon: <FiClock className="w-4 h-4" /> },
        { key: 'approved', label: `مقبول (${orders.filter(o => o.status === 'approved').length})`, icon: <FiCheckCircle className="w-4 h-4" /> },
        { key: 'rejected', label: `مرفوض (${orders.filter(o => o.status === 'rejected').length})`, icon: <FiXCircle className="w-4 h-4" /> },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                {/* Header */}
                <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
                    <div className="max-w-5xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                            >
                                <FiArrowRight className="w-4 h-4" />
                                العودة للوحة التحكم
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FiShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">طلباتي</h1>
                                <p className="text-white/80 text-sm">عرض جميع طلبات الشراء الخاصة بك</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === tab.key
                                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30 hover:text-primary'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Orders List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <OrderCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <NoOrdersFound />
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex gap-4">
                                        {/* Course Thumbnail */}
                                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {order.courseId?.thumbnail ? (
                                                <img
                                                    src={order.courseId.thumbnail}
                                                    alt={order.courseId.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiPackage className="w-8 h-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="font-bold text-slate-800 truncate">
                                                    {order.courseId?.title || 'كورس محذوف'}
                                                </h3>
                                                <span
                                                    className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border whitespace-nowrap ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                <span>{formatDate(order.createdAt)}</span>
                                                {order.paymentMethod && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{getPaymentMethodText(order.paymentMethod)}</span>
                                                    </>
                                                )}
                                                {order.price != null && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="font-semibold text-slate-700">${order.price}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Rejection Reason */}
                                            {order.status === 'rejected' && order.rejectionReason && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                                    <p className="text-sm text-red-700">
                                                        <span className="font-semibold">سبب الرفض:</span> {order.rejectionReason}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action for approved orders */}
                                            {order.status === 'approved' && order.courseId?._id && (
                                                <div className="mt-3">
                                                    <Link
                                                        href={`/courses/${order.courseId._id}`}
                                                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                                                    >
                                                        الذهاب للكورس ←
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
