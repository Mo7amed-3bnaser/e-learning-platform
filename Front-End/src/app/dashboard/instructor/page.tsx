"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { FiBook, FiUsers, FiDollarSign, FiPlus, FiTrendingUp } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { instructorApi } from "@/lib/instructorApi";
import toast from "react-hot-toast";

export default function InstructorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) {
            toast.error("يجب أن تكون مدرباً للوصول لهذه الصفحة");
            router.push("/");
            return;
        }

        fetchCourses();
    }, [isAuthenticated, user, router]);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const response = await instructorApi.getMyCourses();
            setCourses(response.data || []);

            // Calculate stats
            const published = response.data.filter((c: any) => c.isPublished).length;
            const totalEnrolled = response.data.reduce((sum: number, c: any) => sum + (c.enrolledStudents || 0), 0);
            const revenue = response.data.reduce((sum: number, c: any) => sum + ((c.enrolledStudents || 0) * c.price), 0);

            setStats({
                totalCourses: response.data.length,
                publishedCourses: published,
                totalStudents: totalEnrolled,
                totalRevenue: revenue,
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ في جلب الكورسات");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <div className="container mx-auto px-6 py-20">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="container mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">لوحة تحكم المدرب</h1>
                    <p className="text-slate-600 mt-2">إدارة كورساتك وتتبع إحصائياتك</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">إجمالي الكورسات</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCourses}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FiBook className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">الكورسات المنشورة</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.publishedCourses}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">إجمالي الطلاب</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiUsers className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">الإيرادات المتوقعة</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRevenue} جنيه</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FiDollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="bg-gradient-to-l from-primary to-primary-dark rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">جاهز لإنشاء كورس جديد؟</h2>
                                <p className="text-white/80">شارك معرفتك مع آلاف الطلاب</p>
                            </div>
                            <Link
                                href="/dashboard/instructor/courses/create"
                                className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                            >
                                <FiPlus className="w-5 h-5" />
                                إنشاء كورس جديد
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">كورساتي</h2>
                            <Link
                                href="/dashboard/instructor/courses"
                                className="text-primary hover:text-primary-dark font-medium"
                            >
                                عرض الكل
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        {courses.length === 0 ? (
                            <div className="text-center py-12">
                                <FiBook className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">ليس لديك كورسات بعد</p>
                                <Link
                                    href="/dashboard/instructor/courses/create"
                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                                >
                                    <FiPlus />
                                    إنشاء أول كورس
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courses.slice(0, 5).map((course) => (
                                    <div
                                        key={course._id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={course.thumbnail || "/placeholder-course.jpg"}
                                                alt={course.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                    <span>{course.enrolledStudents || 0} طالب</span>
                                                    <span>•</span>
                                                    <span>{course.price} جنيه</span>
                                                    <span>•</span>
                                                    <span className={course.isPublished ? "text-green-600" : "text-orange-600"}>
                                                        {course.isPublished ? "منشور" : "مسودة"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/instructor/courses/${course._id}/edit`}
                                            className="text-primary hover:text-primary-dark font-medium"
                                        >
                                            تعديل
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
