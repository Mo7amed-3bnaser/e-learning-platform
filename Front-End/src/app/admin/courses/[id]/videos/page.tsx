'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiEdit2, FiArrowRight, FiMenu, FiSave, FiX, FiPlay } from 'react-icons/fi';
import { videosAPI, coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Video {
    _id: string;
    title: string;
    description?: string;
    youtubeVideoId?: string;
    duration: number;
    order: number;
    isFreePreview: boolean;
}

export default function CourseVideosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params);
    const router = useRouter();
    const [courseTitle, setCourseTitle] = useState('');
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
        title: '',
        description: '',
        youtubeVideoId: '',
        duration: '',
        isFreePreview: false,
    });

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const courseRes = await coursesAPI.getCourseById(courseId);
            setCourseTitle(courseRes.data.data.title);

            // Fetch videos using admin-accessible course data
            const courseVideos = courseRes.data.data.videos || [];
            setVideos(courseVideos.sort((a: Video, b: Video) => a.order - b.order));
        } catch {
            toast.error('حدث خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', youtubeVideoId: '', duration: '', isFreePreview: false });
        setEditingVideo(null);
        setShowForm(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.youtubeVideoId || !form.duration) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setSubmitting(true);

            if (editingVideo) {
                // Update
                await videosAPI.updateVideo(editingVideo._id, {
                    title: form.title,
                    description: form.description,
                    youtubeVideoId: form.youtubeVideoId,
                    duration: Number(form.duration),
                    isFreePreview: form.isFreePreview,
                });
                toast.success('تم تحديث الفيديو بنجاح');
            } else {
                // Create
                await videosAPI.createVideo({
                    courseId,
                    title: form.title,
                    description: form.description,
                    youtubeVideoId: form.youtubeVideoId,
                    videoProvider: 'youtube',
                    duration: Number(form.duration),
                    order: videos.length + 1,
                    isFreePreview: form.isFreePreview,
                });
                toast.success('تم إضافة الفيديو بنجاح');
            }

            resetForm();
            fetchData();
        } catch {
            toast.error('حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (video: Video) => {
        setForm({
            title: video.title,
            description: video.description || '',
            youtubeVideoId: video.youtubeVideoId || '',
            duration: String(video.duration),
            isFreePreview: video.isFreePreview,
        });
        setEditingVideo(video);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await videosAPI.deleteVideo(deleteId);
            setVideos((prev) => prev.filter((v) => v._id !== deleteId));
            toast.success('تم حذف الفيديو بنجاح');
            setDeleteId(null);
        } catch {
            toast.error('حدث خطأ في حذف الفيديو');
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
                    videosAPI.updateVideo(v._id, { order: v.order })
                )
            );
            toast.success('تم تحديث ترتيب الفيديوهات');
        } catch {
            toast.error('حدث خطأ في حفظ الترتيب');
            fetchData(); // Revert
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>إدارة الفيديوهات</h1>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="admin-drag-item" style={{ marginBottom: '0.5rem' }}>
                        <div className="admin-skeleton" style={{ width: '100%', height: '40px' }} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header">
                <div className="admin-page-header-row">
                    <div>
                        <h1>إدارة الفيديوهات</h1>
                        <p>{courseTitle} ({videos.length} فيديو)</p>
                    </div>
                    <div className="admin-actions">
                        <button
                            className="admin-btn primary"
                            onClick={() => { resetForm(); setShowForm(true); }}
                        >
                            <FiPlus size={18} />
                            <span>إضافة فيديو</span>
                        </button>
                        <button className="admin-btn ghost" onClick={() => router.push('/admin/courses')}>
                            <FiArrowRight size={18} />
                            <span>رجوع</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="admin-form" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem' }}>
                        {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-form-label">عنوان الفيديو *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="admin-form-input"
                                    placeholder="مثال: مقدمة في React"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">YouTube Video ID *</label>
                                <input
                                    type="text"
                                    name="youtubeVideoId"
                                    value={form.youtubeVideoId}
                                    onChange={handleChange}
                                    className="admin-form-input"
                                    placeholder="مثال: dQw4w9WgXcQ"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">المدة (بالثواني) *</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleChange}
                                    className="admin-form-input"
                                    placeholder="مثال: 600"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="admin-form-group" style={{ justifyContent: 'flex-end' }}>
                                <div className="admin-checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="isFreePreview"
                                        name="isFreePreview"
                                        checked={form.isFreePreview}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="isFreePreview">معاينة مجانية</label>
                                </div>
                            </div>

                            <div className="admin-form-group full-width">
                                <label className="admin-form-label">وصف الفيديو</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="admin-form-textarea"
                                    placeholder="وصف مختصر للفيديو (اختياري)"
                                    style={{ minHeight: '60px' }}
                                />
                            </div>
                        </div>

                        <div className="admin-form-actions">
                            <button type="submit" className="admin-btn primary" disabled={submitting}>
                                <FiSave size={16} />
                                {submitting ? 'جاري الحفظ...' : editingVideo ? 'حفظ التعديلات' : 'إضافة الفيديو'}
                            </button>
                            <button type="button" className="admin-btn ghost" onClick={resetForm}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Videos List with Drag & Drop */}
            {videos.length === 0 ? (
                <div className="admin-table-container">
                    <div className="admin-empty">
                        <FiPlay />
                        <h3>لا توجد فيديوهات بعد</h3>
                        <p>أضف فيديوهات جديدة لهذا الكورس</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {videos.map((video, index) => (
                        <div
                            key={video._id}
                            className={`admin-drag-item ${dragOverIndex === index ? 'drag-over' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="admin-drag-handle">
                                <FiMenu size={18} />
                            </div>

                            <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.875rem', minWidth: '24px' }}>
                                {video.order}
                            </span>

                            <div className="admin-drag-info">
                                <p className="admin-drag-title">{video.title}</p>
                                <div className="admin-drag-meta">
                                    <span>⏱ {formatDuration(video.duration)}</span>
                                    {video.youtubeVideoId && <span>📺 {video.youtubeVideoId}</span>}
                                    {video.isFreePreview && (
                                        <span className="admin-badge green" style={{ fontSize: '0.7rem', padding: '0.125rem 0.5rem' }}>
                                            مجاني
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="admin-actions">
                                <button className="admin-btn ghost sm" onClick={() => handleEdit(video)} title="تعديل">
                                    <FiEdit2 size={14} />
                                </button>
                                <button className="admin-btn danger sm" onClick={() => setDeleteId(video._id)} title="حذف">
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>حذف الفيديو</h3>
                        <p>هل أنت متأكد من حذف هذا الفيديو؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                        <div className="admin-modal-actions">
                            <button className="admin-btn danger" onClick={handleDelete}>حذف</button>
                            <button className="admin-btn ghost" onClick={() => setDeleteId(null)}>
                                <FiX size={14} /> إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
