'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiVideo, FiEye } from 'react-icons/fi';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

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
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                            <div className="admin-skeleton" style={{ width: '60px', height: '40px' }} />
                            <div style={{ flex: 1 }}>
                                <div className="admin-skeleton" style={{ width: '60%', height: '16px', marginBottom: '0.5rem' }} />
                                <div className="admin-skeleton" style={{ width: '30%', height: '14px' }} />
                            </div>
                        </div>
                    ))}
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
                <div className="admin-table-wrapper">
                    {courses.length === 0 ? (
                        <div className="admin-empty">
                            <FiEye />
                            <h3>لا توجد كورسات بعد</h3>
                            <p>أضف كورسك الأول من الزر أعلاه</p>
                        </div>
                    ) : (
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
                                {courses.map((course) => (
                                    <tr key={course._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="admin-course-thumb"
                                                    />
                                                ) : (
                                                    <div className="admin-course-thumb" style={{ background: '#334155' }} />
                                                )}
                                                <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {course.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{course.category}</td>
                                        <td>{getLevelLabel(course.level)}</td>
                                        <td>{course.price === 0 ? 'مجاني' : `${course.price} ج.م`}</td>
                                        <td>{course.enrolledStudents || 0}</td>
                                        <td>
                                            {course.rating?.average
                                                ? `${course.rating.average.toFixed(1)} ⭐ (${course.rating.count})`
                                                : 'لا يوجد'}
                                        </td>
                                        <td>
                                            <label className="admin-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={course.isPublished}
                                                    onChange={() => handleTogglePublish(course._id)}
                                                />
                                                <span className="admin-toggle-slider" />
                                            </label>
                                        </td>
                                        <td>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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
