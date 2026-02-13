"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiPlay } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { instructorApi } from "@/lib/instructorApi";
import toast from "react-hot-toast";

export default function InstructorCoursesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) {
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ في جلب الكورسات");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`هل أنت متأكد من حذف الكورس "${title}"؟`)) return;

        try {
            await instructorApi.deleteCourse(id);
            toast.success("تم حذف الكورس بنجاح");
            fetchCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ في حذف الكورس");
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">كورساتي</h1>
                        <p className="text-slate-600 mt-2">إدارة وتحرير كورساتك</p>
                    </div>
                    <Link
                        href="/dashboard/instructor/courses/create"
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        <FiPlus className="w-5 h-5" />
                        إنشاء كورس جديد
                    </Link>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPlus className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">ليس لديك كورسات بعد</h3>
                            <p className="text-slate-600 mb-6">ابدأ بإنشاء أول كورس لك وشارك معرفتك مع الطلاب</p>
                            <Link
                                href="/dashboard/instructor/courses/create"
                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                                <FiPlus />
                                إنشاء أول كورس
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course._id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <img
                                    src={course.thumbnail || "/placeholder-course.jpg"}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full font-medium ${course.isPublished
                                                ? "bg-green-100 text-green-700"
                                                : "bg-orange-100 text-orange-700"
                                                }`}
                                        >
                                            {course.isPublished ? "منشور" : "مسودة"}
                                        </span>
                                        <span className="text-sm text-slate-600">{course.category}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                                        <span>{course.enrolledStudents || 0} طالب</span>
                                        <span className="font-semibold text-primary">{course.price} جنيه</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/instructor/courses/${course._id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                                        >
                                            <FiEdit className="w-4 h-4" />
                                            تعديل
                                        </Link>
                                        <Link
                                            href={`/dashboard/instructor/courses/${course._id}/videos`}
                                            className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                                            title="إدارة الفيديوهات"
                                        >
                                            <FiPlay className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course._id, course.title)}
                                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
