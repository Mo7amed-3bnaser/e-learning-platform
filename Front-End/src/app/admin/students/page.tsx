'use client';

import { useEffect, useState } from 'react';
import { FiSearch, FiShield, FiShieldOff, FiTrash2, FiUsers } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Student {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    enrolledCourses: unknown[];
    createdAt: string;
    avatar?: string;
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getAllStudents();
            setStudents(res.data.data || []);
        } catch {
            toast.error('حدث خطأ في تحميل الطلاب');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (searchTimeout) clearTimeout(searchTimeout);

        if (!query.trim()) {
            fetchStudents();
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await adminAPI.searchStudents(query);
                setStudents(res.data.data || []);
            } catch {
                toast.error('حدث خطأ في البحث');
            } finally {
                setLoading(false);
            }
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleToggleBlock = async (studentId: string, currentBlocked: boolean) => {
        try {
            setActionLoading(studentId);
            await adminAPI.blockStudent(studentId, !currentBlocked);
            setStudents((prev) =>
                prev.map((s) =>
                    s._id === studentId ? { ...s, isBlocked: !currentBlocked } : s
                )
            );
            toast.success(currentBlocked ? 'تم إلغاء حظر الطالب' : 'تم حظر الطالب');
        } catch {
            toast.error('حدث خطأ');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await adminAPI.deleteStudent(deleteId);
            setStudents((prev) => prev.filter((s) => s._id !== deleteId));
            toast.success('تم حذف الطالب بنجاح');
            setDeleteId(null);
        } catch {
            toast.error('حدث خطأ في حذف الطالب');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading && students.length === 0) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>إدارة الطلاب</h1>
                    <p>عرض وإدارة حسابات الطلاب</p>
                </div>
                <div className="admin-table-container">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem' }}>
                            <div className="admin-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <div style={{ flex: 1 }}>
                                <div className="admin-skeleton" style={{ width: '40%', height: '16px', marginBottom: '0.25rem' }} />
                                <div className="admin-skeleton" style={{ width: '60%', height: '14px' }} />
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
                <h1>إدارة الطلاب</h1>
                <p>عرض وإدارة حسابات الطلاب ({students.length} طالب)</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">قائمة الطلاب</h3>
                    <div className="admin-search">
                        <FiSearch size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
                        />
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    {students.length === 0 ? (
                        <div className="admin-empty">
                            <FiUsers />
                            <h3>لا توجد نتائج</h3>
                            <p>{searchQuery ? 'جرب كلمة بحث مختلفة' : 'لم يسجل أي طالب بعد'}</p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>الهاتف</th>
                                    <th>الكورسات</th>
                                    <th>الحالة</th>
                                    <th>تاريخ التسجيل</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="admin-table-avatar">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} />
                                                    ) : (
                                                        <span>{student.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{student.phone}</td>
                                        <td>{student.enrolledCourses?.length || 0}</td>
                                        <td>
                                            {student.isBlocked ? (
                                                <span className="admin-badge red">محظور</span>
                                            ) : (
                                                <span className="admin-badge green">نشط</span>
                                            )}
                                        </td>
                                        <td>{formatDate(student.createdAt)}</td>
                                        <td>
                                            <div className="admin-actions">
                                                <button
                                                    className={`admin-btn ${student.isBlocked ? 'success' : 'warning'} sm`}
                                                    onClick={() => handleToggleBlock(student._id, student.isBlocked)}
                                                    disabled={actionLoading === student._id}
                                                    title={student.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                                                >
                                                    {student.isBlocked ? <FiShieldOff size={14} /> : <FiShield size={14} />}
                                                </button>
                                                <button
                                                    className="admin-btn danger sm"
                                                    onClick={() => setDeleteId(student._id)}
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

            {/* Delete Modal */}
            {deleteId && (
                <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>حذف الطالب</h3>
                        <p>هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته وطلباته. هذا الإجراء لا يمكن التراجع عنه.</p>
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
