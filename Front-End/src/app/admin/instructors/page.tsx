'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    FiSearch,
    FiShield,
    FiShieldOff,
    FiUserMinus,
    FiBook,
    FiMail,
    FiPhone,
} from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '@/components/ui';

interface InstructorProfile {
    bio?: string;
    specialization?: string;
    yearsOfExperience?: string;
    linkedin?: string;
    website?: string;
}

interface Instructor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    avatar?: string;
    instructorProfile?: InstructorProfile;
    coursesCount: number;
    createdAt: string;
}

export default function AdminInstructorsPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [demoteConfirmId, setDemoteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getInstructors();
            setInstructors(res.data.data || []);
        } catch {
            toast.error('حدث خطأ في تحميل المدربين');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (instructorId: string, currentBlocked: boolean) => {
        try {
            setActionLoading(instructorId + '-block');
            await adminAPI.blockInstructor(instructorId);
            setInstructors((prev) =>
                prev.map((i) =>
                    i._id === instructorId ? { ...i, isBlocked: !currentBlocked } : i
                )
            );
            toast.success(currentBlocked ? 'تم إلغاء حظر المدرب' : 'تم حظر المدرب');
        } catch {
            toast.error('حدث خطأ');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDemote = async () => {
        if (!demoteConfirmId) return;
        try {
            setActionLoading(demoteConfirmId + '-demote');
            await adminAPI.demoteInstructor(demoteConfirmId);
            setInstructors((prev) => prev.filter((i) => i._id !== demoteConfirmId));
            toast.success('تم تحويل المدرب إلى طالب وإخفاء كورساته');
            setDemoteConfirmId(null);
        } catch {
            toast.error('حدث خطأ في تنفيذ الإجراء');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const filtered = instructors.filter((i) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            i.name.toLowerCase().includes(q) ||
            i.email.toLowerCase().includes(q) ||
            i.phone.includes(q)
        );
    });

    if (loading && instructors.length === 0) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>إدارة المدربين</h1>
                    <p>عرض وإدارة حسابات المدربين</p>
                </div>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>المدرب</th>
                                <th>التخصص</th>
                                <th>الكورسات</th>
                                <th>الحالة</th>
                                <th>تاريخ الانضمام</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRowSkeleton key={i} columns={6} />
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
                <h1>إدارة المدربين</h1>
                <p>عرض وإدارة حسابات المدربين ({instructors.length} مدرب)</p>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">قائمة المدربين</h3>
                    <div className="admin-search">
                        <FiSearch size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
                        />
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    {filtered.length === 0 ? (
                        <div className="admin-empty">
                            <FiUserMinus size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                            <h3>لا يوجد مدربين</h3>
                            <p>
                                {searchQuery
                                    ? 'لا توجد نتائج للبحث الحالي'
                                    : 'لا يوجد مدربين مسجلين في النظام حتى الآن'}
                            </p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>المدرب</th>
                                    <th>التخصص</th>
                                    <th>الكورسات</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الانضمام</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((instructor) => (
                                    <tr key={instructor._id}>
                                        {/* Name + Email + Phone */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    className="admin-table-avatar"
                                                    style={{ position: 'relative', overflow: 'hidden' }}
                                                >
                                                    {instructor.avatar ? (
                                                        <Image
                                                            src={instructor.avatar}
                                                            alt={instructor.name}
                                                            fill
                                                            sizes="36px"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <span>{instructor.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                                                        {instructor.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.1rem',
                                                            marginTop: '0.2rem',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                color: '#64748b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                            }}
                                                        >
                                                            <FiMail size={10} />
                                                            {instructor.email}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                color: '#64748b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                            }}
                                                        >
                                                            <FiPhone size={10} />
                                                            {instructor.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Specialization */}
                                        <td>
                                            {instructor.instructorProfile?.specialization ? (
                                                <span>{instructor.instructorProfile.specialization}</span>
                                            ) : (
                                                <span style={{ color: '#475569', fontStyle: 'italic' }}>
                                                    غير محدد
                                                </span>
                                            )}
                                        </td>

                                        {/* Courses count */}
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    color: '#a5b4fc',
                                                }}
                                            >
                                                <FiBook size={14} />
                                                {instructor.coursesCount}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            {instructor.isBlocked ? (
                                                <span className="admin-badge red">محظور</span>
                                            ) : (
                                                <span className="admin-badge green">نشط</span>
                                            )}
                                        </td>

                                        {/* Join date */}
                                        <td>{formatDate(instructor.createdAt)}</td>

                                        {/* Actions */}
                                        <td>
                                            <div className="admin-actions">
                                                {/* Block/Unblock */}
                                                <button
                                                    className={`admin-btn ${instructor.isBlocked ? 'success' : 'warning'} sm`}
                                                    onClick={() =>
                                                        handleToggleBlock(instructor._id, instructor.isBlocked)
                                                    }
                                                    disabled={actionLoading === instructor._id + '-block'}
                                                    title={instructor.isBlocked ? 'إلغاء الحظر' : 'حظر المدرب'}
                                                >
                                                    {instructor.isBlocked ? (
                                                        <FiShieldOff size={14} />
                                                    ) : (
                                                        <FiShield size={14} />
                                                    )}
                                                </button>

                                                {/* Demote */}
                                                <button
                                                    className="admin-btn danger sm"
                                                    onClick={() => setDemoteConfirmId(instructor._id)}
                                                    disabled={actionLoading === instructor._id + '-demote'}
                                                    title="تحويل إلى طالب"
                                                >
                                                    <FiUserMinus size={14} />
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

            {/* Demote Confirm Modal */}
            {demoteConfirmId && (
                <div className="admin-modal-overlay" onClick={() => setDemoteConfirmId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>تحويل المدرب إلى طالب</h3>
                        <p>
                            هل أنت متأكد؟ سيتم تحويل هذا المدرب إلى طالب وإخفاء جميع كورساته.
                            يمكنك إعادة قبوله مستقبلاً عن طريق طلبات المدربين.
                        </p>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn danger"
                                onClick={handleDemote}
                                disabled={!!actionLoading}
                            >
                                {actionLoading ? 'جاري التنفيذ...' : 'تأكيد التحويل'}
                            </button>
                            <button
                                className="admin-btn ghost"
                                onClick={() => setDemoteConfirmId(null)}
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
