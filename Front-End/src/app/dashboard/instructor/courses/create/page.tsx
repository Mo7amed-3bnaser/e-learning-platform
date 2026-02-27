"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import { FiSave } from "react-icons/fi";
import { instructorApi } from "@/lib/instructorApi";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreateCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        thumbnail: "",
        category: "",
        level: "beginner",
        whatYouWillLearn: [""],
        requirements: [""],
    });

    const handleAddItem = (field: 'whatYouWillLearn' | 'requirements') => {
        setFormData({
            ...formData,
            [field]: [...formData[field], ""],
        });
    };

    const handleRemoveItem = (field: 'whatYouWillLearn' | 'requirements', index: number) => {
        const newItems = formData[field].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            [field]: newItems.length > 0 ? newItems : [""],
        });
    };

    const handleItemChange = (field: 'whatYouWillLearn' | 'requirements', index: number, value: string) => {
        const newItems = [...formData[field]];
        newItems[index] = value;
        setFormData({
            ...formData,
            [field]: newItems,
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataToSend = new FormData();
        formDataToSend.append('image', file);

        try {
            const authData = localStorage.getItem('auth-storage');
            const token = authData ? JSON.parse(authData).state.token : null;

            const response = await axios.post(`${API_URL}/upload/image`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setFormData({ ...formData, thumbnail: response.data.data.url });
            toast.success('تم رفع الصورة بنجاح');
        } catch (error) {
            toast.error('حدث خطأ في رفع الصورة');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const courseData = {
                ...formData,
                price: parseFloat(formData.price),
                whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim() !== ""),
                requirements: formData.requirements.filter(item => item.trim() !== ""),
            };

            await instructorApi.createCourse(courseData);
            toast.success("تم إنشاء الكورس بنجاح!");
            router.push("/dashboard/instructor/courses");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "حدث خطأ في إنشاء الكورس");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Breadcrumb items={[{ label: 'لوحة المدرب', href: '/dashboard/instructor' }, { label: 'كورساتي', href: '/dashboard/instructor/courses' }, { label: 'إنشاء كورس جديد' }]} className="mb-4" />
                        <h1 className="text-3xl font-bold text-slate-900">إنشاء كورس جديد</h1>
                        <p className="text-slate-600 mt-2">املأ البيانات التالية لإنشاء كورسك</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">المعلومات الأساسية</h2>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    عنوان الكورس <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    placeholder="مثال: تعلم React من الصفر للاحتراف"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    وصف الكورس <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-slate-900"
                                    placeholder="اكتب وصفاً شاملاً للكورس..."
                                />
                            </div>

                            {/* Category & Level */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        التصنيف <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    >
                                        <option value="">اختر التصنيف</option>
                                        <option value="programming">برمجة</option>
                                        <option value="design">تصميم</option>
                                        <option value="marketing">تسويق</option>
                                        <option value="business">أعمال</option>
                                        <option value="language">لغات</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        المستوى <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    >
                                        <option value="beginner">مبتدئ</option>
                                        <option value="intermediate">متوسط</option>
                                        <option value="advanced">متقدم</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    السعر (جنيه) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                    placeholder="499"
                                />
                            </div>

                            {/* Thumbnail */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    صورة الكورس <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                />
                                {formData.thumbnail && (
                                    <Image src={formData.thumbnail} alt="Preview" width={800} height={192} unoptimized className="mt-4 w-full h-48 object-cover rounded-lg" />
                                )}
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">ماذا ستتعلم؟</h2>
                            {formData.whatYouWillLearn.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleItemChange('whatYouWillLearn', index, e.target.value)}
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                        placeholder="مثال: بناء تطبيقات تفاعلية باستخدام React"
                                    />
                                    {formData.whatYouWillLearn.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('whatYouWillLearn', index)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            حذف
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleAddItem('whatYouWillLearn')}
                                className="text-primary font-medium hover:text-primary-dark"
                            >
                                + إضافة المزيد
                            </button>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">المتطلبات</h2>
                            {formData.requirements.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleItemChange('requirements', index, e.target.value)}
                                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                                        placeholder="مثال: معرفة أساسيات JavaScript"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('requirements', index)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            حذف
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleAddItem('requirements')}
                                className="text-primary font-medium hover:text-primary-dark"
                            >
                                + إضافة المزيد
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "جاري الإنشاء..." : (
                                    <>
                                        <FiSave />
                                        إنشاء الكورس
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
