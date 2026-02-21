'use client';

import { useEffect, useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiTag,
  FiSearch,
  FiX,
  FiCalendar,
  FiPercent,
  FiDollarSign,
} from 'react-icons/fi';
import { couponsAPI, coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  applicableCourses: { _id: string; title: string }[];
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  description: string;
  createdBy: { _id: string; name: string } | null;
  createdAt: string;
}

interface CourseOption {
  _id: string;
  title: string;
}

const initialForm = {
  code: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: '',
  usageLimit: '',
  applicableCourses: [] as string[],
  startDate: '',
  expiryDate: '',
  description: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCoupons();
    fetchCourses();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponsAPI.getAllCoupons({ limit: 100 });
      setCoupons(res.data.data || []);
    } catch {
      toast.error('حدث خطأ في تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAllCourses();
      setCourses(
        (res.data.data || []).map((c: { _id: string; title: string }) => ({ _id: c._id, title: c.title }))
      );
    } catch {
      // silent
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      ...initialForm,
      startDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      applicableCourses: coupon.applicableCourses.map((c) => c._id),
      startDate: coupon.startDate?.split('T')[0] || '',
      expiryDate: coupon.expiryDate?.split('T')[0] || '',
      description: coupon.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('كود الكوبون مطلوب');
      return;
    }
    if (!form.expiryDate) {
      toast.error('تاريخ الانتهاء مطلوب');
      return;
    }
    if (form.discountValue <= 0) {
      toast.error('قيمة الخصم يجب أن تكون أكبر من 0');
      return;
    }
    if (form.discountType === 'percentage' && form.discountValue > 100) {
      toast.error('نسبة الخصم لا يمكن أن تتجاوز 100%');
      return;
    }

    try {
      setSaving(true);
      const data: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        expiryDate: new Date(form.expiryDate).toISOString(),
        description: form.description,
      };

      if (form.maxDiscountAmount) {
        data.maxDiscountAmount = Number(form.maxDiscountAmount);
      }
      if (form.usageLimit) {
        data.usageLimit = Number(form.usageLimit);
      }
      if (form.startDate) {
        data.startDate = new Date(form.startDate).toISOString();
      }
      if (form.applicableCourses.length > 0) {
        data.applicableCourses = form.applicableCourses;
      }

      if (editingCoupon) {
        await couponsAPI.updateCoupon(editingCoupon._id, data);
        toast.success('تم تحديث الكوبون بنجاح');
      } else {
        await couponsAPI.createCoupon(data as Parameters<typeof couponsAPI.createCoupon>[0]);
        toast.success('تم إنشاء الكوبون بنجاح');
      }

      setShowModal(false);
      fetchCoupons();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await couponsAPI.toggleCoupon(id);
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success('تم تحديث حالة الكوبون');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await couponsAPI.deleteCoupon(deleteId);
      setCoupons((prev) => prev.filter((c) => c._id !== deleteId));
      toast.success('تم حذف الكوبون');
      setDeleteId(null);
    } catch {
      toast.error('حدث خطأ في حذف الكوبون');
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && c.isActive) ||
      (filter === 'inactive' && !c.isActive);
    const matchesSearch =
      !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isExpired = (date: string) => new Date(date) < new Date();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الكوبونات</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            إنشاء وإدارة كوبونات الخصم
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium"
        >
          <FiPlus className="w-5 h-5" />
          كوبون جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث بالكود أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'active' ? 'مفعل' : 'معطل'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الكود</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الخصم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الاستخدام</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الصلاحية</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-12"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-32"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24"></div></td>
                  </tr>
                ))
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FiTag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">لا يوجد كوبونات</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-sm">
                          {coupon.code}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {coupon.discountType === 'percentage' ? (
                          <>
                            <FiPercent className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">{coupon.discountValue}%</span>
                          </>
                        ) : (
                          <>
                            <FiDollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600">${coupon.discountValue}</span>
                          </>
                        )}
                      </div>
                      {coupon.maxDiscountAmount && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">حد أقصى: ${coupon.maxDiscountAmount}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span>{formatDate(coupon.expiryDate)}</span>
                      </div>
                      {isExpired(coupon.expiryDate) && (
                        <span className="text-xs text-red-500 font-medium">منتهي</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggle(coupon._id)}
                        className="flex items-center gap-1"
                        title={coupon.isActive ? 'تعطيل' : 'تفعيل'}
                      >
                        {coupon.isActive ? (
                          <>
                            <FiToggleRight className="w-6 h-6 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">مفعل</span>
                          </>
                        ) : (
                          <>
                            <FiToggleLeft className="w-6 h-6 text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">معطل</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(coupon._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingCoupon ? 'تعديل كوبون' : 'إنشاء كوبون جديد'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* كود الكوبون */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  كود الكوبون *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: SAVE20"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none font-mono tracking-wider text-left"
                  dir="ltr"
                />
              </div>

              {/* نوع وقيمة الخصم */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    نوع الخصم *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    min={0}
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* الحد الأدنى والأقصى */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأدنى للطلب ($)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    حد أقصى للخصم ($)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="بدون حد"
                    min={0}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* حد الاستخدام */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  حد الاستخدام (إجمالي)
                </label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="بدون حد"
                  min={1}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* التواريخ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الانتهاء *
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* الكورسات المحددة */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  الكورسات المحددة (اختياري)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  اتركها فارغة لتطبيق الكوبون على جميع الكورسات
                </p>
                <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl p-2 space-y-1">
                  {courses.map((course) => (
                    <label
                      key={course._id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.applicableCourses.includes(course._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              applicableCourses: [...form.applicableCourses, course._id],
                            });
                          } else {
                            setForm({
                              ...form,
                              applicableCourses: form.applicableCourses.filter(
                                (id) => id !== course._id
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{course.title}</span>
                    </label>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">لا يوجد كورسات</p>
                  )}
                </div>
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  الوصف (اختياري)
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للكوبون"
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 rounded-b-2xl">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : editingCoupon ? 'تحديث' : 'إنشاء'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">تأكيد الحذف</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">هل أنت متأكد من حذف هذا الكوبون؟ هذا الإجراء لا يمكن التراجع عنه.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
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
