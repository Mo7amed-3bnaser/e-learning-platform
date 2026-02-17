"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMail, FiArrowRight, FiHome, FiCheckCircle } from "react-icons/fi";
import Logo from "@/components/Logo";
import LoadingButton from "@/components/LoadingButton";
import { authAPI } from "@/lib/api";
import { showSuccess, handleApiError } from "@/lib/toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        try {
            const response = await authAPI.forgotPassword(email);
            showSuccess(response.data.message || "تم إرسال رابط إعادة التعيين!");
            setIsEmailSent(true);
        } catch (error: unknown) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
                {/* Back Button - Top Right */}
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

                    {!isEmailSent ? (
                        <>
                            {/* Header */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <FiMail className="w-10 h-10 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                    نسيت كلمة المرور؟ 🔐
                                </h1>
                                <p className="mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
                                    لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين
                                    كلمة المرور
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        البريد الإلكتروني
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pr-10 pl-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700"
                                            placeholder="example@email.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <LoadingButton
                                    type="submit"
                                    isLoading={isLoading}
                                    loadingText="جاري الإرسال..."
                                    variant="primary"
                                    className="w-full"
                                >
                                    إرسال رابط إعادة التعيين
                                </LoadingButton>

                                {/* Back to Login */}
                                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                    تذكرت كلمة المرور؟{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors inline-flex items-center gap-1"
                                    >
                                        <FiArrowRight className="w-4 h-4" />
                                        العودة لتسجيل الدخول
                                    </Link>
                                </p>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                                    تم الإرسال بنجاح! 📧
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    تم إرسال رابط إعادة تعيين كلمة المرور إلى
                                </p>
                                <p
                                    className="text-primary font-semibold mt-2 text-lg"
                                    dir="ltr"
                                >
                                    {email}
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-4">
                                    تحقق من بريدك الإلكتروني (وربما مجلد الرسائل غير المرغوب
                                    فيها). الرابط صالح لمدة 15 دقيقة.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsEmailSent(false);
                                        setEmail("");
                                    }}
                                    className="w-full px-6 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300"
                                >
                                    إرسال رابط جديد
                                </button>
                                <Link
                                    href="/login"
                                    className="block w-full px-6 py-3 rounded-xl font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 text-center"
                                >
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    )}
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
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        استرجاع كلمة المرور
                    </h2>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed">
                        حسابك آمن معنا! سنساعدك في استعادة الوصول إلى حسابك في خطوات
                        بسيطة
                    </p>

                    {/* Steps */}
                    <div className="mt-12 space-y-6 text-right w-full max-w-sm">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <p className="text-white/90 text-sm">أدخل بريدك الإلكتروني المسجل</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <p className="text-white/90 text-sm">تحقق من بريدك واضغط على الرابط</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">3</span>
                            </div>
                            <p className="text-white/90 text-sm">أنشئ كلمة مرور جديدة وسجل دخولك</p>
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
