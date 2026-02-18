"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import PageLoader from "@/components/PageLoader";
import {
    FiSave,
    FiUpload,
    FiPlus,
    FiX,
    FiPlay,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { instructorApi } from "@/lib/instructorApi";
import { uploadAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function InstructorEditCoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        level: "beginner",
        thumbnail: "",
        isPublished: false,
        whatYouWillLearn: [""],
        requirements: [""],
    });

    useEffect(() => {
        if (
            !isAuthenticated ||
            (user?.role !== "instructor" && user?.role !== "admin")
        ) {
            router.push("/");
            return;
        }
        fetchCourse();
    }, [isAuthenticated, user, router, id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            // Use the general API to get course details (public endpoint)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/courses/${id}`
            );
            const res = await response.json();
            const course = res.data;

            setForm({
                title: course.title || "",
                description: course.description || "",
                price: String(course.price || 0),
                category: course.category || "",
                level: course.level || "beginner",
                thumbnail: course.thumbnail || "",
                isPublished: course.isPublished || false,
                whatYouWillLearn: course.whatYouWillLearn?.length
                    ? course.whatYouWillLearn
                    : [""],
                requirements: course.requirements?.length
                    ? course.requirements
                    : [""],
            });
        } catch {
            toast.error("حدث خطأ في تحميل بيانات الكورس");
            router.push("/dashboard/instructor/courses");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleThumbnailUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) =>
            setThumbnailPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        try {
            setUploading(true);
            const res = await uploadAPI.uploadImage(file);
            setForm((prev) => ({ ...prev, thumbnail: res.data.data.url }));
            toast.success("تم رفع الصورة بنجاح");
        } catch {
            toast.error("حدث خطأ في رفع الصورة");
            setThumbnailPreview("");
        } finally {
            setUploading(false);
        }
    };

    const addListItem = (field: "whatYouWillLearn" | "requirements") => {
        setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
    };

    const removeListItem = (
        field: "whatYouWillLearn" | "requirements",
        index: number
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const updateListItem = (
        field: "whatYouWillLearn" | "requirements",
        index: number,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const handleTogglePublish = async () => {
        try {
            setPublishLoading(true);
            const res = await instructorApi.togglePublish(id);
            setForm((prev) => ({
                ...prev,
                isPublished: res.data.isPublished,
            }));
            toast.success(
                res.data.isPublished ? "تم نشر الكورس بنجاح" : "تم إخفاء الكورس"
            );
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ");
        } finally {
            setPublishLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.description || !form.category) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        try {
            setSubmitting(true);

            const courseData = {
                title: form.title,
                description: form.description,
                price: Number(form.price) || 0,
                category: form.category,
                level: form.level,
                thumbnail: form.thumbnail,
                whatYouWillLearn: form.whatYouWillLearn.filter((item) =>
                    item.trim()
                ),
                requirements: form.requirements.filter((item) => item.trim()),
            };

            await instructorApi.updateCourse(id, courseData);
            toast.success("تم تحديث الكورس بنجاح");
            router.push("/dashboard/instructor/courses");
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "حدث خطأ في تحديث الكورس"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <PageLoader message="جاري تحميل بيانات الكورس..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Breadcrumb items={[{ label: 'لوحة المدرب', href: '/dashboard/instructor' }, { label: 'كورساتي', href: '/dashboard/instructor/courses' }, { label: 'تعديل الكورس' }]} className="mb-4" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    تعديل الكورس
                                </h1>
                                <p className="text-slate-600 mt-2">
                                    تعديل بيانات &quot;{form.title}&quot;
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTogglePublish}
                                    disabled={publishLoading}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors ${form.isPublished
                                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                        }`}
                                >
                                    {form.isPublished ? (
                                        <FiEyeOff className="w-4 h-4" />
                                    ) : (
                                        <FiEye className="w-4 h-4" />
                                    )}
                                    {publishLoading
                                        ? "جاري..."
                                        : form.isPublished
                                            ? "إخفاء الكورس"
                                            : "نشر الكورس"}
                                </button>
                                <Link
                                    href={`/dashboard/instructor/courses/${id}/videos`}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    <FiPlay className="w-4 h-4" />
                                    إدارة الفيديوهات
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                        <span
                            className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full font-medium ${form.isPublished
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                        >
                            {form.isPublished ? (
                                <>
                                    <FiEye className="w-4 h-4" /> الكورس منشور
                                    ومتاح للطلاب
                                </>
                            ) : (
                                <>
                                    <FiEyeOff className="w-4 h-4" /> الكورس
                                    مسودة (غير منشور)
                                </>
                            )}
                        </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">
                                المعلومات الأساسية
                            </h2>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    عنوان الكورس{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    placeholder="مثال: تعلم React من الصفر للاحتراف"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    وصف الكورس{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-slate-900"
                                    placeholder="اكتب وصفاً شاملاً للكورس..."
                                />
                            </div>

                            {/* Category & Level */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        التصنيف{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        required
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    >
                                        <option value="">اختر التصنيف</option>
                                        <option value="programming">
                                            برمجة
                                        </option>
                                        <option value="design">تصميم</option>
                                        <option value="marketing">
                                            تسويق
                                        </option>
                                        <option value="business">أعمال</option>
                                        <option value="language">لغات</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        المستوى
                                    </label>
                                    <select
                                        name="level"
                                        value={form.level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    >
                                        <option value="beginner">مبتدئ</option>
                                        <option value="intermediate">
                                            متوسط
                                        </option>
                                        <option value="advanced">متقدم</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    السعر ($)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    min="0"
                                    placeholder="499"
                                />
                            </div>

                            {/* Thumbnail */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    صورة الكورس
                                </label>
                                <div
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {thumbnailPreview || form.thumbnail ? (
                                        <img
                                            src={
                                                thumbnailPreview ||
                                                form.thumbnail
                                            }
                                            alt="Thumbnail"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="py-8">
                                            <FiUpload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-600">
                                                {uploading
                                                    ? "جاري الرفع..."
                                                    : "اضغط لاختيار صورة"}
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                ماذا ستتعلم؟
                            </h2>
                            {form.whatYouWillLearn.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) =>
                                            updateListItem(
                                                "whatYouWillLearn",
                                                idx,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                        placeholder={`النقطة ${idx + 1}`}
                                    />
                                    {form.whatYouWillLearn.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeListItem(
                                                    "whatYouWillLearn",
                                                    idx
                                                )
                                            }
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem("whatYouWillLearn")}
                                className="flex items-center gap-1 text-primary font-medium hover:text-primary-dark"
                            >
                                <FiPlus className="w-4 h-4" /> إضافة نقطة
                            </button>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                المتطلبات
                            </h2>
                            {form.requirements.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) =>
                                            updateListItem(
                                                "requirements",
                                                idx,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                        placeholder={`المتطلب ${idx + 1}`}
                                    />
                                    {form.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeListItem(
                                                    "requirements",
                                                    idx
                                                )
                                            }
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addListItem("requirements")}
                                className="flex items-center gap-1 text-primary font-medium hover:text-primary-dark"
                            >
                                <FiPlus className="w-4 h-4" /> إضافة متطلب
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    "جاري الحفظ..."
                                ) : (
                                    <>
                                        <FiSave />
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/dashboard/instructor/courses"
                                    )
                                }
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
