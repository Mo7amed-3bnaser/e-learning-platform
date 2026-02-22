"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiCheck,
  FiHome,
} from "react-icons/fi";
import Logo from "@/components/Logo";
import { authAPI } from "@/lib/api";
import { showSuccess, showError, handleApiError } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    deviceAgreement: false,
  });

  const validateStep1 = () => {
    // التحقق من الاسم الأول
    if (!formData.firstName.trim()) {
      showError('برجاء إدخال الاسم الأول');
      return false;
    }

    // التحقق من الاسم الأخير
    if (!formData.lastName.trim()) {
      showError('برجاء إدخال الاسم الأخير');
      return false;
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      showError('برجاء إدخال البريد الإلكتروني');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      showError('البريد الإلكتروني غير صحيح');
      return false;
    }

    // التحقق من رقم الموبايل
    if (!formData.phone.trim()) {
      showError('برجاء إدخال رقم الموبايل');
      return false;
    }

    // التأكد من أن الرقم يحتوي على 11 رقم فقط
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (formData.phone.length !== 11) {
      showError('رقم الموبايل يجب أن يكون 11 رقم');
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      showError('رقم الموبايل غير صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      // التحقق من البيانات قبل الانتقال للخطوة الثانية
      if (!validateStep1()) {
        return;
      }
      setCurrentStep(2);
      return;
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      showError('برجاء إدخال كلمة المرور');
      return;
    }

    if (formData.password.length < 6) {
      showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      showError('كلمة المرور غير متطابقة');
      return;
    }

    // التحقق من الموافقة على الشروط
    if (!formData.agreeTerms) {
      showError('برجاء الموافقة على الشروط والأحكام');
      return;
    }

    // التحقق من الموافقة على شروط الأجهزة
    if (!formData.deviceAgreement) {
      showError('يجب الموافقة على شروط استخدام الأجهزة والحساب');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        deviceAgreement: true,
      });

      // عرض رسالة نجاح
      showSuccess(response.data.message || 'تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني');

      // التوجيه لصفحة انتظار التأكيد
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "ضعيفة جداً";
    if (strength <= 2) return "ضعيفة";
    if (strength <= 3) return "متوسطة";
    if (strength <= 4) return "قوية";
    return "قوية جداً";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 overflow-y-auto relative">
        {/* Back Button - Top Right */}
        <Link
          href="/"
          className="absolute top-6 right-6 inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors group"
        >
          <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">العودة للرئيسية</span>
        </Link>

        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex justify-center">
              <Logo size="lg" />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-slate-800 dark:text-slate-100">
              إنشاء حساب جديد
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {currentStep === 1
                ? "أدخل معلوماتك الشخصية"
                : "أكمل بيانات حسابك"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= 1
                  ? "bg-primary text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
              >
                {currentStep > 1 ? <FiCheck /> : "1"}
              </div>
              <span
                className={`text-sm ${currentStep >= 1 ? "text-primary" : "text-slate-400 dark:text-slate-500"
                  }`}
              >
                المعلومات الشخصية
              </span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-600">
              <div
                className={`h-full bg-primary transition-all duration-300 ${currentStep >= 2 ? "w-full" : "w-0"
                  }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= 2
                  ? "bg-primary text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
              >
                2
              </div>
              <span
                className={`text-sm ${currentStep >= 2 ? "text-primary" : "text-slate-400 dark:text-slate-500"
                  }`}
              >
                بيانات الحساب
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 1 ? (
              <>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      الاسم الأول
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="block w-full pr-10 pl-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700"
                        placeholder="الاسم الأول"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      الاسم الأخير
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700"
                      placeholder="الاسم الأخير"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    رقم الهاتف
                    <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                      (11 رقم)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        // السماح بالأرقام فقط
                        const value = e.target.value.replace(/\D/g, '');
                        // تحديد الطول بـ 11 رقم
                        if (value.length <= 11) {
                          setFormData({ ...formData, phone: value });
                        }
                      }}
                      className={`block w-full pr-10 pl-4 py-3 border rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 ${formData.phone && formData.phone.length === 11
                        ? 'border-green-500 focus:ring-green-500 focus:border-transparent'
                        : formData.phone && formData.phone.length > 0
                          ? 'border-orange-500 focus:ring-orange-500 focus:border-transparent'
                          : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-transparent'
                        }`}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      maxLength={11}
                    />
                  </div>
                  {formData.phone && formData.phone.length < 11 && (
                    <p className="text-xs text-orange-600 mt-1">
                      برجاء إدخال 11 رقم (متبقي {11 - formData.phone.length} رقم)
                    </p>
                  )}
                  {formData.phone && formData.phone.length === 11 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <FiCheck className="w-3 h-3" />
                      رقم الموبايل صحيح
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="block w-full pr-10 pl-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700"
                      placeholder="••••••••"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                      )}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength(formData.password)
                              ? getStrengthColor(
                                passwordStrength(formData.password)
                              )
                              : "bg-slate-200 dark:bg-slate-600"
                              }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        قوة كلمة المرور:{" "}
                        <span
                          className={`font-medium ${passwordStrength(formData.password) >= 4
                            ? "text-green-600"
                            : passwordStrength(formData.password) >= 3
                              ? "text-yellow-600"
                              : "text-red-600"
                            }`}
                        >
                          {getStrengthText(passwordStrength(formData.password))}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`block w-full pr-10 pl-12 py-3 border rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 ${formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                        ? "border-red-300 dark:border-red-500 focus:ring-red-500"
                        : "border-slate-200 dark:border-slate-600 focus:ring-primary"
                        }`}
                      placeholder="••••••••"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">
                        كلمة المرور غير متطابقة
                      </p>
                    )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeTerms: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    أوافق على{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      الشروط والأحكام
                    </Link>{" "}
                    و{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      سياسة الخصوصية
                    </Link>
                  </label>
                </div>

                {/* Device Agreement Section */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    ⚠️ شروط استخدام الحساب - مهم جداً
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    لحماية حقوقك وحقوق المحاضرين، يرجى العلم بالآتي:
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1.5 pr-1">
                    <li className="flex items-start gap-2">
                      <span>📱</span>
                      <span>يمكنك تسجيل الدخول من <strong>جهاز واحد فقط</strong> في نفس الوقت</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>📅</span>
                      <span>يمكنك استخدام <strong>جهازين كحد أقصى</strong> خلال الشهر الواحد</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⏰</span>
                      <span>عند تبديل الأجهزة، يجب الانتظار <strong>4 ساعات</strong> بين كل جهاز</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🚫</span>
                      <span>مشاركة الحساب مع أشخاص آخرين <strong>ممنوعة</strong> ومخالفة للشروط</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⛔</span>
                      <span>في حالة المخالفة، سيتم إيقاف الحساب ولن يتم استرداد المبالغ المدفوعة</span>
                    </li>
                  </ul>
                  <div className="flex items-start gap-3 pt-2 border-t border-amber-200 dark:border-amber-800">
                    <input
                      id="deviceAgreement"
                      type="checkbox"
                      required
                      checked={formData.deviceAgreement}
                      onChange={(e) =>
                        setFormData({ ...formData, deviceAgreement: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-400 dark:border-amber-600 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="deviceAgreement"
                      className="text-sm font-medium text-amber-800 dark:text-amber-300 cursor-pointer"
                    >
                      أوافق على شروط استخدام الأجهزة والحساب
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  السابق
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || (currentStep === 2 && (!formData.agreeTerms || !formData.deviceAgreement))}
                className={`${currentStep === 1 ? "w-full" : "flex-1"
                  } flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-l from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : currentStep === 1 ? (
                  "التالي"
                ) : (
                  "إنشاء الحساب"
                )}
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>

            {/* Instructor Application Link */}
            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                هل أنت مدرب؟{" "}
                <Link
                  href="/instructor-application"
                  className="font-semibold text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
                >
                  تواصل مع الإدارة
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary-dark to-slate-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            انضم إلى مسار
          </h2>
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            اكتشف عالماً من الفرص التعليمية وابدأ رحلتك نحو تحقيق أهدافك
            المهنية
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-right w-full max-w-sm">
            {[
              "دورات تعليمية عالية الجودة",
              "شهادات معتمدة",
              "دعم فني على مدار الساعة",
              "مجتمع تعليمي نشط",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-10 w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-accent/60 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}
