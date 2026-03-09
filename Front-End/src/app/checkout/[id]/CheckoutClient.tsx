'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiShoppingCart, FiCheck, FiCreditCard, FiDollarSign, FiTag, FiX } from 'react-icons/fi';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { coursesAPI, ordersAPI, couponsAPI } from '@/lib/api';
import { handleApiError, showToast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  instructor: {
    name: string;
    avatar?: string;
  };
}

interface CouponResult {
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number;
  originalPrice: number;
  finalPrice: number;
}

export default function CheckoutClient() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      router.push(`/login?redirect=/checkout/${courseId}`);
      return;
    }
    
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, isAuthenticated]);

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await coursesAPI.getCourseById(courseId);
      setCourse(response.data.data);
    } catch (error) {
      handleApiError(error);
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('برجاء إدخال كود الكوبون');
      return;
    }

    try {
      setIsApplyingCoupon(true);
      setCouponError('');
      const response = await couponsAPI.applyCoupon({ code: couponCode.trim(), courseId });
      setCouponResult(response.data.data);
      showToast('تم تطبيق الكوبون بنجاح! 🎉', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'كود الكوبون غير صحيح';
      setCouponError(msg);
      setCouponResult(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!agreed) {
      showToast('يجب الموافقة على الشروط والأحكام', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      
      // استخدام Sandbox Payment مع الكوبون
      const response = await ordersAPI.sandboxPayment(courseId, couponResult?.couponCode);
      
      showToast('تم التسجيل في الكورس بنجاح! 🎉', 'success');
      
      // تحويل للكورس بعد 2 ثانية
      setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 2000);
      
    } catch (error: any) {
      if (error.response?.data?.message?.includes('مسجل')) {
        showToast('أنت مسجل في هذا الكورس بالفعل', 'info');
        router.push(`/watch/${courseId}`);
      } else {
        handleApiError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const displayPrice = couponResult ? couponResult.finalPrice : (course?.price || 0);
  const displayDiscount = couponResult ? couponResult.discount : 0;

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'الكورسات', href: '/courses' },
              { label: course?.title || '...' },
              { label: 'إتمام الشراء' },
            ]}
            className="mb-6"
          />

          {/* العنوان */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">إتمام عملية الشراء</h1>
            <p className="text-slate-600 dark:text-slate-400">أنت على بعد خطوة واحدة من بدء رحلتك التعليمية</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* معلومات الدفع */}
            <div className="lg:col-span-2 space-y-6">
              {/* معلومات المستخدم */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  معلومات الحساب
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">الاسم:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{user?.name || 'غير متوفر'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">البريد الإلكتروني:</span>
                    <span className="font-medium text-slate-800 dark:text-white">{user?.email || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>

              {/* طريقة الدفع (Sandbox) */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-primary" />
                  طريقة الدفع
                </h2>
                
                <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl p-6 border-2 border-primary/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FiDollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Sandbox Payment</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">بوابة دفع تجريبية - لأغراض الاختبار</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">
                      <strong>ملاحظة:</strong> هذه بوابة دفع تجريبية للتطوير والاختبار.
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>✓ لن يتم خصم أي مبلغ فعلي</li>
                      <li>✓ سيتم تسجيلك في الكورس مباشرة</li>
                      <li>✓ يمكنك الوصول لكل المحتوى فوراً</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* كوبون الخصم */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-primary" />
                  كوبون خصم
                </h2>
                
                {couponResult ? (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FiCheck className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700 dark:text-green-400">تم تطبيق الكوبون</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="إزالة الكوبون"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <p>الكوبون: <strong>{couponResult.couponCode}</strong></p>
                      <p>
                        الخصم: {couponResult.discountType === 'percentage' 
                          ? `${couponResult.discountValue}%` 
                          : `$${couponResult.discountValue}`}
                        {' '}(-${couponResult.discount})
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="أدخل كود الكوبون"
                        className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-left tracking-wider font-mono"
                        dir="ltr"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                          isApplyingCoupon || !couponCode.trim()
                            ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                      >
                        {isApplyingCoupon ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'تطبيق'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-sm text-red-500">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* الشروط والأحكام */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-orange-500 accent-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">
                    أوافق على <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline font-semibold">الشروط والأحكام</a> و
                    <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline font-semibold"> سياسة الخصوصية</a>.
                    أفهم أن هذا الشراء نهائي وغير قابل للاسترداد.
                  </span>
                </label>
              </div>

              {/* زر الدفع */}
              <button
                onClick={handleCheckout}
                disabled={!agreed || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  agreed && !isProcessing
                    ? 'bg-gradient-to-l from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-6 h-6" />
                    <span>تأكيد الشراء - ${displayPrice}</span>
                  </>
                )}
              </button>
            </div>

            {/* ملخص الطلب */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">ملخص الطلب</h2>
                
                {/* الكورس */}
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 dark:text-white text-sm line-clamp-2 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{course.instructor?.name || 'المدرب'}</p>
                    </div>
                  </div>
                </div>

                {/* التفاصيل المالية */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>سعر الكورس:</span>
                    <span className="font-medium">${course.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>الخصم:</span>
                    <span className={`font-medium ${displayDiscount > 0 ? 'text-green-600' : ''}`}>
                      {displayDiscount > 0 ? `-$${displayDiscount}` : '$0'}
                    </span>
                  </div>
                  {couponResult && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <FiTag className="w-3 h-3" />
                      <span>كوبون: {couponResult.couponCode}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between text-lg font-bold text-slate-800 dark:text-white">
                    <span>الإجمالي:</span>
                    <span className="text-primary">${displayPrice}</span>
                  </div>
                </div>

                {/* ضمان */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-400 font-medium mb-1">✓ ضمان استرداد الأموال</p>
                  <p className="text-xs text-green-700 dark:text-green-500">خلال 30 يوماً من الشراء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
