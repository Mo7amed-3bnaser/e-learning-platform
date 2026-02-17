"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import {
    FiPlus,
    FiTrash2,
    FiEdit2,
    FiArrowRight,
    FiMenu,
    FiSave,
    FiX,
    FiPlay,
    FiAlertCircle,
} from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { instructorApi } from "@/lib/instructorApi";
import toast from "react-hot-toast";

interface Video {
    _id: string;
    title: string;
    description?: string;
    youtubeVideoId?: string;
    duration: number;
    order: number;
    isFreePreview: boolean;
}

export default function InstructorCourseVideosPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: courseId } = use(params);
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [courseTitle, setCourseTitle] = useState("");
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        youtubeVideoId: "",
        duration: "",
        isFreePreview: false,
    });

    useEffect(() => {
        if (
            !isAuthenticated ||
            (user?.role !== "instructor" && user?.role !== "admin")
        ) {
            router.push("/");
            return;
        }
        fetchData();
    }, [isAuthenticated, user, router, courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch course info
            const courseRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/courses/${courseId}`
            );
            const courseData = await courseRes.json();
            setCourseTitle(courseData.data?.title || "");

            // Fetch videos via instructor API
            const videosRes = await instructorApi.getCourseVideos(courseId);
            setVideos(
                (videosRes.data || []).sort(
                    (a: Video, b: Video) => a.order - b.order
                )
            );
        } catch {
            toast.error("حدث خطأ في تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            youtubeVideoId: "",
            duration: "",
            isFreePreview: false,
        });
        setEditingVideo(null);
        setShowForm(false);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.youtubeVideoId || !form.duration) {
            toast.error("يرجى ملء جميع الحقول المطلوبة");
            return;
        }

        try {
            setSubmitting(true);

            if (editingVideo) {
                // Update
                await instructorApi.updateVideo(editingVideo._id, {
                    title: form.title,
                    description: form.description,
                    youtubeVideoId: form.youtubeVideoId,
                    duration: Number(form.duration),
                    isFreePreview: form.isFreePreview,
                });
                toast.success("تم تحديث الفيديو بنجاح");
            } else {
                // Create
                await instructorApi.addVideo({
                    courseId,
                    title: form.title,
                    description: form.description,
                    youtubeVideoId: form.youtubeVideoId,
                    videoProvider: "youtube",
                    duration: Number(form.duration),
                    order: videos.length + 1,
                    isFreePreview: form.isFreePreview,
                });
                toast.success("تم إضافة الفيديو بنجاح");
            }

            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "حدث خطأ"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (video: Video) => {
        setForm({
            title: video.title,
            description: video.description || "",
            youtubeVideoId: video.youtubeVideoId || "",
            duration: String(video.duration),
            isFreePreview: video.isFreePreview,
        });
        setEditingVideo(video);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await instructorApi.deleteVideo(deleteId);
            setVideos((prev) => prev.filter((v) => v._id !== deleteId));
            toast.success("تم حذف الفيديو بنجاح");
            setDeleteId(null);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "حدث خطأ في حذف الفيديو"
            );
        }
    };

    // Drag and Drop
    const handleDragStart = (index: number) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
        setDragOverIndex(index);
    };

    const handleDragEnd = async () => {
        setDragOverIndex(null);
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;

        const reordered = [...videos];
        const [draggedItem] = reordered.splice(dragItem.current, 1);
        reordered.splice(dragOverItem.current, 0, draggedItem);

        // Update order numbers
        const updated = reordered.map((v, i) => ({ ...v, order: i + 1 }));
        setVideos(updated);

        dragItem.current = null;
        dragOverItem.current = null;

        // Save new order to backend
        try {
            await Promise.all(
                updated.map((v) =>
                    instructorApi.updateVideo(v._id, { order: v.order })
                )
            );
            toast.success("تم تحديث ترتيب الفيديوهات");
        } catch {
            toast.error("حدث خطأ في حفظ الترتيب");
            fetchData(); // Revert
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    if (loading) {
        return <PageLoader message="جاري تحميل الفيديوهات..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() =>
                                router.push(
                                    `/dashboard/instructor/courses/${courseId}/edit`
                                )
                            }
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                        >
                            <FiArrowRight />
                            رجوع لتعديل الكورس
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">
                                    إدارة الفيديوهات
                                </h1>
                                <p className="text-slate-600 mt-2">
                                    {courseTitle} ({videos.length} فيديو)
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                                <FiPlus className="w-5 h-5" />
                                إضافة فيديو
                            </button>
                        </div>
                    </div>

                    {/* Drag & Drop Tip */}
                    {videos.length > 1 && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 text-blue-800 text-sm">
                            <FiMenu className="w-5 h-5 flex-shrink-0" />
                            <span>
                                اسحب وأفلت الفيديوهات لتغيير ترتيبها
                            </span>
                        </div>
                    )}

                    {/* Add/Edit Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                {editingVideo
                                    ? "تعديل الفيديو"
                                    : "إضافة فيديو جديد"}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            عنوان الفيديو{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                            placeholder="مثال: مقدمة في React"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            YouTube Video ID{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="youtubeVideoId"
                                            value={form.youtubeVideoId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                            placeholder="مثال: dQw4w9WgXcQ"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            المدة (بالثواني){" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={form.duration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                            placeholder="مثال: 600"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isFreePreview"
                                                checked={form.isFreePreview}
                                                onChange={handleChange}
                                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-slate-700">
                                                معاينة مجانية
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        وصف الفيديو (اختياري)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-slate-900"
                                        placeholder="وصف مختصر للفيديو"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        {submitting
                                            ? "جاري الحفظ..."
                                            : editingVideo
                                                ? "حفظ التعديلات"
                                                : "إضافة الفيديو"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Videos List with Drag & Drop */}
                    {videos.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <FiPlay className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                لا توجد فيديوهات بعد
                            </h3>
                            <p className="text-slate-600 mb-6">
                                أضف فيديوهات جديدة لهذا الكورس
                            </p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                            >
                                <FiPlus className="w-5 h-5" />
                                إضافة أول فيديو
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {videos.map((video, index) => (
                                <div
                                    key={video._id}
                                    className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all ${dragOverIndex === index
                                            ? "border-primary bg-primary/5 scale-[1.02]"
                                            : "hover:border-slate-300"
                                        }`}
                                    draggable
                                    onDragStart={() =>
                                        handleDragStart(index)
                                    }
                                    onDragEnter={() =>
                                        handleDragEnter(index)
                                    }
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* Drag Handle */}
                                    <div className="text-slate-400 hover:text-slate-600">
                                        <FiMenu className="w-5 h-5" />
                                    </div>

                                    {/* Order Number */}
                                    <span className="bg-primary/10 text-primary font-bold text-sm w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {video.order}
                                    </span>

                                    {/* Video Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                            <span>
                                                ⏱{" "}
                                                {formatDuration(
                                                    video.duration
                                                )}
                                            </span>
                                            {video.youtubeVideoId && (
                                                <span>
                                                    📺{" "}
                                                    {video.youtubeVideoId}
                                                </span>
                                            )}
                                            {video.isFreePreview && (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                    مجاني
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleEdit(video)}
                                            className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteId(video._id)
                                            }
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setDeleteId(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <FiAlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                حذف الفيديو
                            </h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            هل أنت متأكد من حذف هذا الفيديو؟ هذا الإجراء لا
                            يمكن التراجع عنه.
                        </p>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                onClick={handleDelete}
                            >
                                حذف
                            </button>
                            <button
                                className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                                onClick={() => setDeleteId(null)}
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
