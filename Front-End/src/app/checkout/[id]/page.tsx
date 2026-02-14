'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowRight, FiShoppingCart, FiCheck, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import Header from '@/components/Header';
import { coursesAPI, ordersAPI } from '@/lib/api';
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

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

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

  const handleCheckout = async () => {
    if (!agreed) {
      showToast('يجب الموافقة على الشروط والأحكام', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      
      // استخدام Sandbox Payment
      const response = await ordersAPI.sandboxPayment(courseId);
      
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

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-200 rounded w-1/4"></div>
              <div className="h-64 bg-slate-200 rounded-2xl"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* زر الرجوع */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-primary mb-6 transition-colors"
          >
            <FiArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>

          {/* العنوان */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">إتمام عملية الشراء</h1>
            <p className="text-slate-600">أنت على بعد خطوة واحدة من بدء رحلتك التعليمية</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* معلومات الدفع */}
            <div className="lg:col-span-2 space-y-6">
              {/* معلومات المستخدم */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  معلومات الحساب
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">الاسم:</span>
                    <span className="font-medium text-slate-800">{user?.name || 'غير متوفر'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">البريد الإلكتروني:</span>
                    <span className="font-medium text-slate-800">{user?.email || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>

              {/* طريقة الدفع (Sandbox) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-primary" />
                  طريقة الدفع
                </h2>
                
                <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl p-6 border-2 border-primary/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FiDollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Sandbox Payment</p>
                      <p className="text-sm text-slate-600">بوابة دفع تجريبية - لأغراض الاختبار</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>ملاحظة:</strong> هذه بوابة دفع تجريبية للتطوير والاختبار.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>✓ لن يتم خصم أي مبلغ فعلي</li>
                      <li>✓ سيتم تسجيلك في الكورس مباشرة</li>
                      <li>✓ يمكنك الوصول لكل المحتوى فوراً</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* الشروط والأحكام */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-slate-700 text-sm">
                    أوافق على <a href="#" className="text-primary hover:underline">الشروط والأحكام</a> و
                    <a href="#" className="text-primary hover:underline"> سياسة الخصوصية</a>.
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
                    ? 'bg-gradient-to-l from-primary to-primary-dark text-white hover:shadow-xl'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
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
                    <span>تأكيد الشراء - ${course.price}</span>
                  </>
                )}
              </button>
            </div>

            {/* ملخص الطلب */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="text-xl font-bold text-slate-800 mb-4">ملخص الطلب</h2>
                
                {/* الكورس */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 text-sm line-clamp-2 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500">{course.instructor?.name || 'المدرب'}</p>
                    </div>
                  </div>
                </div>

                {/* التفاصيل المالية */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-700">
                    <span>سعر الكورس:</span>
                    <span className="font-medium">${course.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>الخصم:</span>
                    <span className="font-medium text-green-600">$0</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-800">
                    <span>الإجمالي:</span>
                    <span className="text-primary">${course.price}</span>
                  </div>
                </div>

                {/* ضمان */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-1">✓ ضمان استرداد الأموال</p>
                  <p className="text-xs text-green-700">خلال 30 يوماً من الشراء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
