'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiVideo } from 'react-icons/fi';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { TableRowSkeleton, NoCoursesFound } from '@/components/ui';
import ResponsiveTable from '@/components/ResponsiveTable';

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    category: string;
    level: string;
    isPublished: boolean;
    enrolledStudents: number;
    rating: { average: number; count: number };
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await coursesAPI.getAllCoursesAdmin();
            setCourses(res.data.data || []);
        } catch {
            toast.error('حدث خطأ في تحميل الكورسات');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (courseId: string) => {
        try {
            const res = await coursesAPI.togglePublish(courseId);
            setCourses((prev) =>
                prev.map((c) =>
                    c._id === courseId ? { ...c, isPublished: res.data.data.isPublished } : c
                )
            );
            toast.success(res.data.message);
        } catch {
            toast.error('حدث خطأ في تغيير حالة النشر');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleting(true);
            await coursesAPI.deleteCourse(deleteId);
            setCourses((prev) => prev.filter((c) => c._id !== deleteId));
            toast.success('تم حذف الكورس بنجاح');
            setDeleteId(null);
        } catch {
            toast.error('حدث خطأ في حذف الكورس');
        } finally {
            setDeleting(false);
        }
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return 'مبتدئ';
            case 'intermediate': return 'متوسط';
            case 'advanced': return 'متقدم';
            default: return level;
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'title',
            label: 'الكورس',
            render: (_: any, course: Course) => (
                <div className="flex items-center gap-3">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-300" />
                    )}
                    <span className="font-semibold max-w-[200px] truncate">
                        {course.title}
                    </span>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'التصنيف',
            hideOnTablet: true,
        },
        {
            key: 'level',
            label: 'المستوى',
            hideOnTablet: true,
            render: (level: string) => getLevelLabel(level),
        },
        {
            key: 'price',
            label: 'السعر',
            render: (price: number) => (price === 0 ? 'مجاني' : `$${price}`),
        },
        {
            key: 'enrolledStudents',
            label: 'الطلاب',
            hideOnTablet: true,
            render: (count: number) => count || 0,
        },
        {
            key: 'rating',
            label: 'التقييم',
            hideOnTablet: true,
            render: (rating: { average: number; count: number }) =>
                rating?.average
                    ? `${rating.average.toFixed(1)} ⭐ (${rating.count})`
                    : 'لا يوجد',
        },
        {
            key: 'isPublished',
            label: 'الحالة',
            render: (_: any, course: Course) => (
                <label className="admin-toggle">
                    <input
                        type="checkbox"
                        checked={course.isPublished}
                        onChange={() => handleTogglePublish(course._id)}
                    />
                    <span className="admin-toggle-slider" />
                </label>
            ),
        },
        {
            key: 'actions',
            label: 'الإجراءات',
            render: (_: any, course: Course) => (
                <div className="admin-actions">
                    <Link
                        href={`/admin/courses/${course._id}/videos`}
                        className="admin-btn ghost sm"
                        title="الفيديوهات"
                    >
                        <FiVideo size={14} />
                    </Link>
                    <Link
                        href={`/admin/courses/${course._id}/edit`}
                        className="admin-btn ghost sm"
                        title="تعديل"
                    >
                        <FiEdit2 size={14} />
                    </Link>
                    <button
                        className="admin-btn danger sm"
                        onClick={() => setDeleteId(course._id)}
                        title="حذف"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    // Mobile card render
    const renderMobileCard = (course: Course) => (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* Course Header */}
            <div className="flex items-start gap-3 mb-4">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {course.category}
                        </span>
                        <span className="text-xs">{getLevelLabel(course.level)}</span>
                    </div>
                </div>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                    <div className="text-gray-500 text-xs mb-1">السعر</div>
                    <div className="font-semibold text-gray-900">
                        {course.price === 0 ? 'مجاني' : `$${course.price}`}
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs mb-1">الطلاب</div>
                    <div className="font-semibold text-gray-900">
                        {course.enrolledStudents || 0}
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs mb-1">التقييم</div>
                    <div className="font-semibold text-gray-900">
                        {course.rating?.average
                            ? `${course.rating.average.toFixed(1)} ⭐`
                            : 'لا يوجد'}
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs mb-1">الحالة</div>
                    <label className="admin-toggle">
                        <input
                            type="checkbox"
                            checked={course.isPublished}
                            onChange={() => handleTogglePublish(course._id)}
                        />
                        <span className="admin-toggle-slider" />
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Link
                    href={`/admin/courses/${course._id}/videos`}
                    className="flex-1 admin-btn ghost sm justify-center"
                >
                    <FiVideo size={16} />
                    <span>الفيديوهات</span>
                </Link>
                <Link
                    href={`/admin/courses/${course._id}/edit`}
                    className="flex-1 admin-btn ghost sm justify-center"
                >
                    <FiEdit2 size={16} />
                    <span>تعديل</span>
                </Link>
                <button
                    className="admin-btn danger sm"
                    onClick={() => setDeleteId(course._id)}
                    title="حذف"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div>
                <div className="admin-page-header">
                    <div className="admin-page-header-row">
                        <div>
                            <h1>إدارة الكورسات</h1>
                            <p>إنشاء وتعديل وإدارة كورسات المنصة</p>
                        </div>
                    </div>
                </div>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>الكورس</th>
                                <th>التصنيف</th>
                                <th>المستوى</th>
                                <th>السعر</th>
                                <th>الطلاب</th>
                                <th>التقييم</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((i) => (
                                <TableRowSkeleton key={i} columns={8} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header">
                <div className="admin-page-header-row">
                    <div>
                        <h1>إدارة الكورسات</h1>
                        <p>إنشاء وتعديل وإدارة كورسات المنصة ({courses.length} كورس)</p>
                    </div>
                    <Link href="/admin/courses/new" className="admin-btn primary">
                        <FiPlus size={18} />
                        <span>إضافة كورس</span>
                    </Link>
                </div>
            </div>

            <div className="admin-table-container">
                {courses.length === 0 ? (
                    <NoCoursesFound />
                ) : (
                    <ResponsiveTable
                        columns={columns}
                        data={courses}
                        keyField="_id"
                        mobileCardRender={renderMobileCard}
                    />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>حذف الكورس</h3>
                        <p>هل أنت متأكد من حذف هذا الكورس؟ سيتم حذف جميع الفيديوهات التابعة له أيضاً. هذا الإجراء لا يمكن التراجع عنه.</p>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'جاري الحذف...' : 'حذف'}
                            </button>
                            <button
                                className="admin-btn ghost"
                                onClick={() => setDeleteId(null)}
                                disabled={deleting}
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
