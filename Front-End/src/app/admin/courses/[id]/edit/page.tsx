'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiPlus, FiX, FiArrowRight } from 'react-icons/fi';
import { coursesAPI, uploadAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        level: 'beginner',
        thumbnail: '',
        instructorName: '',
        instructorBio: '',
        whatYouWillLearn: [''],
        requirements: [''],
    });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await coursesAPI.getCourseById(id);
            const course = res.data.data;

            setForm({
                title: course.title || '',
                description: course.description || '',
                price: String(course.price || 0),
                category: course.category || '',
                level: course.level || 'beginner',
                thumbnail: course.thumbnail || '',
                instructorName: course.instructor?.name || '',
                instructorBio: course.instructor?.bio || '',
                whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [''],
                requirements: course.requirements?.length ? course.requirements : [''],
            });
        } catch {
            toast.error('حدث خطأ في تحميل بيانات الكورس');
            router.push('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        try {
            setUploading(true);
            const res = await uploadAPI.uploadImage(file);
            setForm((prev) => ({ ...prev, thumbnail: res.data.data.url }));
            toast.success('تم رفع الصورة بنجاح');
        } catch {
            toast.error('حدث خطأ في رفع الصورة');
            setThumbnailPreview('');
        } finally {
            setUploading(false);
        }
    };

    const addListItem = (field: 'whatYouWillLearn' | 'requirements') => {
        setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeListItem = (field: 'whatYouWillLearn' | 'requirements', index: number) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const updateListItem = (field: 'whatYouWillLearn' | 'requirements', index: number, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.description || !form.category) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
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
                instructor: {
                    name: form.instructorName || 'غير محدد',
                    bio: form.instructorBio || '',
                },
                whatYouWillLearn: form.whatYouWillLearn.filter((item) => item.trim()),
                requirements: form.requirements.filter((item) => item.trim()),
            };

            await coursesAPI.updateCourse(id, courseData as unknown as FormData);
            toast.success('تم تحديث الكورس بنجاح');
            router.push('/admin/courses');
        } catch {
            toast.error('حدث خطأ في تحديث الكورس');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="admin-page-header">
                    <h1>تعديل الكورس</h1>
                </div>
                <div className="admin-form">
                    <div className="admin-form-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="admin-form-group">
                                <div className="admin-skeleton" style={{ width: '80px', height: '16px', marginBottom: '0.5rem' }} />
                                <div className="admin-skeleton" style={{ width: '100%', height: '40px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-page-header">
                <div className="admin-page-header-row">
                    <div>
                        <h1>تعديل الكورس</h1>
                        <p>تعديل بيانات &quot;{form.title}&quot;</p>
                    </div>
                    <button className="admin-btn ghost" onClick={() => router.push('/admin/courses')}>
                        <FiArrowRight size={18} />
                        <span>رجوع</span>
                    </button>
                </div>
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label className="admin-form-label">عنوان الكورس *</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} className="admin-form-input" required />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">التصنيف *</label>
                        <input type="text" name="category" value={form.category} onChange={handleChange} className="admin-form-input" required />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">السعر (ج.م)</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange} className="admin-form-input" min="0" />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">المستوى</label>
                        <select name="level" value={form.level} onChange={handleChange} className="admin-form-select">
                            <option value="beginner">مبتدئ</option>
                            <option value="intermediate">متوسط</option>
                            <option value="advanced">متقدم</option>
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">اسم المدرب</label>
                        <input type="text" name="instructorName" value={form.instructorName} onChange={handleChange} className="admin-form-input" />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">نبذة عن المدرب</label>
                        <input type="text" name="instructorBio" value={form.instructorBio} onChange={handleChange} className="admin-form-input" />
                    </div>

                    <div className="admin-form-group full-width">
                        <label className="admin-form-label">وصف الكورس *</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="admin-form-textarea" required />
                    </div>

                    <div className="admin-form-group full-width">
                        <label className="admin-form-label">صورة الكورس</label>
                        <div
                            className={`admin-thumbnail-upload ${thumbnailPreview || form.thumbnail ? 'has-image' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {thumbnailPreview || form.thumbnail ? (
                                <img src={thumbnailPreview || form.thumbnail} alt="Thumbnail" />
                            ) : (
                                <div className="admin-thumbnail-placeholder">
                                    <FiUpload size={32} />
                                    <p>{uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}</p>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploading} />
                        </div>
                    </div>

                    <div className="admin-form-group full-width">
                        <label className="admin-form-label">ماذا ستتعلم</label>
                        <div className="admin-dynamic-list">
                            {form.whatYouWillLearn.map((item, idx) => (
                                <div key={idx} className="admin-dynamic-item">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem('whatYouWillLearn', idx, e.target.value)}
                                        className="admin-form-input"
                                        placeholder={`النقطة ${idx + 1}`}
                                    />
                                    {form.whatYouWillLearn.length > 1 && (
                                        <button type="button" onClick={() => removeListItem('whatYouWillLearn', idx)}>
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="admin-add-item-btn" onClick={() => addListItem('whatYouWillLearn')}>
                                <FiPlus size={14} /> إضافة نقطة
                            </button>
                        </div>
                    </div>

                    <div className="admin-form-group full-width">
                        <label className="admin-form-label">المتطلبات</label>
                        <div className="admin-dynamic-list">
                            {form.requirements.map((item, idx) => (
                                <div key={idx} className="admin-dynamic-item">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateListItem('requirements', idx, e.target.value)}
                                        className="admin-form-input"
                                        placeholder={`المتطلب ${idx + 1}`}
                                    />
                                    {form.requirements.length > 1 && (
                                        <button type="button" onClick={() => removeListItem('requirements', idx)}>
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="admin-add-item-btn" onClick={() => addListItem('requirements')}>
                                <FiPlus size={14} /> إضافة متطلب
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button type="submit" className="admin-btn primary" disabled={submitting || uploading}>
                        {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                    <button type="button" className="admin-btn ghost" onClick={() => router.push('/admin/courses')}>
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
}
