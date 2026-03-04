"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    FiMail,
    FiHome,
    FiCheckCircle,
    FiAlertTriangle,
    FiRefreshCw,
} from "react-icons/fi";
import Logo from "@/components/Logo";
import LoadingButton from "@/components/LoadingButton";
import PageLoader from "@/components/PageLoader";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { showSuccess, showError, handleApiError } from "@/lib/toast";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const hasVerified = useRef(false);
    const login = useAuthStore((state) => state.login);

    // Verify token automatically if present (ref prevents double-call in StrictMode)
    useEffect(() => {
        if (!token || hasVerified.current) return;
        hasVerified.current = true;

        const verifyToken = async () => {
            setIsVerifying(true);
            setIsError(false);

            try {
                const response = await authAPI.verifyEmail(token);
                showSuccess(response.data.message || "تم تأكيد البريد الإلكتروني بنجاح!");
                setIsVerified(true);

                // تسجيل دخول تلقائي
                const { data } = response.data;
                if (data?.token) {
                    const userData = {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        role: data.role,
                        avatar: data.avatar || null,
                    };
                    login(data.token, userData);

                    // توجيه للصفحة الرئيسية
                    await new Promise(resolve => setTimeout(resolve, 500));
                    window.location.href = '/';
                }
            } catch (error: any) {
                setIsError(true);
                setErrorMessage(
                    error?.response?.data?.message || "حدث خطأ أثناء التأكيد"
                );
                handleApiError(error);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token, login]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResend = async () => {
        if (!email) {
            showError("برجاء إدخال البريد الإلكتروني");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.resendVerification(email);
            showSuccess(response.data.message || "تم إعادة إرسال رابط التأكيد!");
            setResendCooldown(60); // 60 seconds cooldown
        } catch (error: any) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // ===== State: Verifying token (loading) =====
    if (token && isVerifying) {
        return <PageLoader message="جاري تأكيد البريد الإلكتروني..." />;
    }

    // ===== State: Token verified successfully =====
    if (token && isVerified) {
        return (
            <div className="min-h-screen flex">
                {/* Left Side - Success Message */}
                <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
                    <div className="w-full max-w-md space-y-8">
                        {/* Logo */}
                        <div className="text-center">
                            <Link href="/" className="inline-flex justify-center">
                                <Logo size="lg" />
                            </Link>
                        </div>

                        {/* Success State */}
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                                    تم التأكيد بنجاح! 🎉
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    تم تأكيد بريدك الإلكتروني بنجاح. جاري تحويلك للصفحة الرئيسية...
                                </p>
                            </div>

                            {/* Loading indicator */}
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
                                <p className="text-primary text-sm">
                                    جاري التحويل...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Decorative */}
                <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 via-green-700 to-green-900 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <FiCheckCircle className="w-14 h-14 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            تم بنجاح!
                        </h2>
                        <p className="text-xl text-white/80 max-w-md leading-relaxed">
                            حسابك جاهز الآن. ابدأ رحلة التعلم مع مسار
                        </p>
                    </div>
                    <div className="absolute top-10 left-10 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/4 right-10 w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    // ===== State: Token error =====
    if (token && isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-full flex items-center justify-center mx-auto">
                        <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                            رابط غير صالح ⚠️
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            {errorMessage || "الرابط الذي تستخدمه غير صالح أو منتهي الصلاحية. يمكنك طلب رابط تأكيد جديد."}
                        </p>
                    </div>
                    <div className="space-y-3 pt-4">
                        <Link
                            href="/login"
                            className="block w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-l from-primary to-primary-dark text-white hover:shadow-lg transition-all duration-300 text-center"
                        >
                            العودة لتسجيل الدخول
                        </Link>
                        <Link
                            href="/register"
                            className="block w-full px-6 py-3 rounded-xl font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 text-center"
                        >
                            إنشاء حساب جديد
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ===== State: Waiting for verification (email provided, no token) =====
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Verification Pending */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute top-6 right-6 inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors group"
                >
                    <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">العودة للرئيسية</span>
                </Link>

                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex justify-center">
                            <Logo size="lg" />
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FiMail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                            تأكيد البريد الإلكتروني 📧
                        </h1>
                        <p className="mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
                            تم إرسال رابط تأكيد إلى بريدك الإلكتروني
                        </p>
                    </div>

                    {/* Email Display */}
                    {email && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">تم الإرسال إلى:</p>
                            <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg" dir="ltr">{email}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary font-bold text-sm">1</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                افتح بريدك الإلكتروني وابحث عن رسالة من <strong className="text-slate-800 dark:text-slate-200">مسار</strong>
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary font-bold text-sm">2</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                اضغط على زر <strong className="text-slate-800 dark:text-slate-200">&quot;تأكيد البريد الإلكتروني&quot;</strong> في الرسالة
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary font-bold text-sm">3</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                بعد التأكيد يمكنك <strong className="text-slate-800 dark:text-slate-200">تسجيل الدخول</strong> واستخدام المنصة
                            </p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                            <strong>💡 نصيحة:</strong> إذا لم تجد الرسالة في البريد الوارد، تحقق من مجلد <strong>البريد المزعج (Spam)</strong>
                        </p>
                    </div>

                    {/* Resend Button */}
                    <div className="space-y-3">
                        <LoadingButton
                            type="button"
                            onClick={handleResend}
                            isLoading={isLoading}
                            loadingText="جاري إعادة الإرسال..."
                            variant="primary"
                            className="w-full"
                            disabled={resendCooldown > 0 || !email}
                        >
                            <FiRefreshCw className="w-4 h-4 ml-2" />
                            {resendCooldown > 0
                                ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                                : "إعادة إرسال رابط التأكيد"}
                        </LoadingButton>

                        <Link
                            href="/login"
                            className="block w-full px-6 py-3 rounded-xl font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 text-center border border-primary/20 dark:border-primary/30"
                        >
                            العودة لتسجيل الدخول
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary-dark to-slate-900 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <svg
                                className="w-14 h-14 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        خطوة أخيرة!
                    </h2>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed">
                        أكد بريدك الإلكتروني لتفعيل حسابك والبدء في رحلة التعلم مع مسار
                    </p>

                    {/* Animated mail icon */}
                    <div className="mt-12 space-y-4 text-right w-full max-w-sm">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiCheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-medium">تم إنشاء حسابك بنجاح</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors animate-pulse">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiMail className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-medium">في انتظار تأكيد البريد الإلكتروني</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-4 opacity-50">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm">3</span>
                            </div>
                            <span className="text-white/70 font-medium">تسجيل الدخول والبدء</span>
                        </div>
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

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={<PageLoader message="جاري التحميل..." />}
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
