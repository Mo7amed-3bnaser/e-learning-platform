"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import { FiCheck, FiX, FiClock, FiUser } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { instructorApplicationApi } from "@/lib/instructorApi";
import toast from "react-hot-toast";

export default function InstructorApplicationsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push("/");
            return;
        }
        fetchApplications();
    }, [isAuthenticated, user, router, filter]);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const statusFilter = filter === "all" ? undefined : filter;
            const response = await instructorApplicationApi.getAllApplications(statusFilter);
            setApplications(response.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ في جلب الطلبات");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("هل أنت متأكد من قبول هذا الطلب؟")) return;

        try {
            await instructorApplicationApi.reviewApplication(id, { status: "approved" });
            toast.success("تم قبول الطلب وترقية المستخدم إلى مدرب");
            fetchApplications();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ");
        }
    };

    const handleReject = async () => {
        if (!selectedApp || !rejectionReason.trim()) {
            toast.error("يرجى كتابة سبب الرفض");
            return;
        }

        try {
            await instructorApplicationApi.reviewApplication(selectedApp._id, {
                status: "rejected",
                rejectionReason,
            });
            toast.success("تم رفض الطلب");
            setShowRejectModal(false);
            setRejectionReason("");
            setSelectedApp(null);
            fetchApplications();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ");
        }
    };

    const openRejectModal = (app: any) => {
        setSelectedApp(app);
        setShowRejectModal(true);
    };

    if (isLoading) {
        return <PageLoader message="جاري تحميل طلبات المدربين..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">طلبات المدربين</h1>
                    <p className="text-slate-600 mt-2">مراجعة وقبول/رفض طلبات الانضمام كمدربين</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? "bg-primary text-white"
                                    : "bg-white text-slate-700 border border-slate-200 hover:border-primary"
                                }`}
                        >
                            {status === "all" && "الكل"}
                            {status === "pending" && "قيد المراجعة"}
                            {status === "approved" && "مقبول"}
                            {status === "rejected" && "مرفوض"}
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <p className="text-slate-600">لا توجد طلبات</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div
                                key={app._id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <FiUser className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    {app.firstName} {app.lastName}
                                                </h3>
                                                <p className="text-sm text-slate-600">{app.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">التخصص</p>
                                                <p className="text-sm font-medium text-slate-900">{app.specialization}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">الخبرة</p>
                                                <p className="text-sm font-medium text-slate-900">{app.yearsOfExperience}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">رقم الهاتف</p>
                                                <p className="text-sm font-medium text-slate-900">{app.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                                <span
                                                    className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${app.status === "pending"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : app.status === "approved"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {app.status === "pending" && "قيد المراجعة"}
                                                    {app.status === "approved" && "مقبول"}
                                                    {app.status === "rejected" && "مرفوض"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs text-slate-500 mb-1">النبذة</p>
                                            <p className="text-sm text-slate-700 line-clamp-2">{app.bio}</p>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs text-slate-500 mb-1">المؤهلات</p>
                                            <p className="text-sm text-slate-700 line-clamp-2">{app.qualifications}</p>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs text-slate-500 mb-1">لماذا يريد أن يكون مدرباً؟</p>
                                            <p className="text-sm text-slate-700 line-clamp-2">{app.whyInstructor}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">مواضيع الدورات</p>
                                            <p className="text-sm text-slate-700 line-clamp-2">{app.courseTopics}</p>
                                        </div>

                                        {app.status === "rejected" && app.rejectionReason && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs text-red-600 font-medium mb-1">سبب الرفض:</p>
                                                <p className="text-sm text-red-700">{app.rejectionReason}</p>
                                            </div>
                                        )}
                                    </div>

                                    {app.status === "pending" && (
                                        <div className="flex gap-2 mr-4">
                                            <button
                                                onClick={() => handleApprove(app._id)}
                                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                            >
                                                <FiCheck />
                                                قبول
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(app)}
                                                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                                            >
                                                <FiX />
                                                رفض
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">رفض الطلب</h3>
                        <p className="text-slate-600 mb-4">يرجى كتابة سبب الرفض</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
                            placeholder="مثال: المؤهلات غير كافية..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
                            >
                                تأكيد الرفض
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                    setSelectedApp(null);
                                }}
                                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
