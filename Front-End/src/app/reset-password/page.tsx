"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiHome,
    FiCheckCircle,
    FiAlertTriangle,
} from "react-icons/fi";
import Logo from "@/components/Logo";
import LoadingButton from "@/components/LoadingButton";
import PageLoader from "@/components/PageLoader";
import { authAPI } from "@/lib/api";
import { showSuccess, handleApiError } from "@/lib/toast";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Password strength indicators
    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;
        return strength;
    };

    const strengthLevel = getPasswordStrength(password);
    const strengthColors = [
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-blue-500",
        "bg-green-500",
    ];
    const strengthLabels = [
        "ضعيفة جداً",
        "ضعيفة",
        "متوسطة",
        "جيدة",
        "قوية",
    ];

    // Countdown redirect after success
    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (isSuccess && countdown === 0) {
            router.push("/login");
        }
    }, [isSuccess, countdown, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (password !== confirmPassword) {
            handleApiError({
                response: { data: { message: "كلمتا المرور غير متطابقتين" } },
            });
            return;
        }

        if (password.length < 6) {
            handleApiError({
                response: {
                    data: { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
                },
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.resetPassword(token!, password);
            showSuccess(
                response.data.message || "تم تعيين كلمة المرور الجديدة بنجاح!"
            );
            setIsSuccess(true);
        } catch (error: unknown) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // No token state
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
                        <FiAlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            رابط غير صالح ⚠️
                        </h2>
                        <p className="text-slate-500 leading-relaxed">
                            الرابط الذي تستخدمه غير صالح أو تالف. اطلب رابط جديد لإعادة
                            تعيين كلمة المرور.
                        </p>
                    </div>
                    <div className="space-y-3 pt-4">
                        <Link
                            href="/forgot-password"
                            className="block w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-l from-primary to-primary-dark text-white hover:shadow-lg transition-all duration-300 text-center"
                        >
                            طلب رابط جديد
                        </Link>
                        <Link
                            href="/login"
                            className="block w-full px-6 py-3 rounded-xl font-medium text-primary hover:bg-primary/5 transition-all duration-300 text-center"
                        >
                            العودة لتسجيل الدخول
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
                {/* Back Button - Top Right */}
                <Link
                    href="/"
                    className="absolute top-6 right-6 inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group"
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

                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <FiLock className="w-10 h-10 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800">
                                    تعيين كلمة مرور جديدة 🔑
                                </h1>
                                <p className="mt-3 text-slate-500 leading-relaxed">
                                    أدخل كلمة المرور الجديدة. تأكد أنها قوية وسهلة التذكر
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                {/* New Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pr-10 pl-12 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                                            placeholder="••••••••"
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                            ) : (
                                                <FiEye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div className="space-y-2 pt-1">
                                            <div className="flex gap-1">
                                                {[0, 1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strengthLevel
                                                                ? strengthColors[strengthLevel - 1]
                                                                : "bg-slate-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p
                                                className={`text-xs font-medium ${strengthLevel <= 1
                                                        ? "text-red-500"
                                                        : strengthLevel <= 2
                                                            ? "text-orange-500"
                                                            : strengthLevel <= 3
                                                                ? "text-yellow-600"
                                                                : strengthLevel <= 4
                                                                    ? "text-blue-500"
                                                                    : "text-green-500"
                                                    }`}
                                            >
                                                قوة كلمة المرور:{" "}
                                                {strengthLabels[strengthLevel - 1] || "ضعيفة جداً"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`block w-full pr-10 pl-12 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white ${confirmPassword && password !== confirmPassword
                                                    ? "border-red-300 bg-red-50"
                                                    : confirmPassword && password === confirmPassword
                                                        ? "border-green-300 bg-green-50"
                                                        : "border-slate-200"
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
                                                <FiEyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                            ) : (
                                                <FiEye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">
                                            كلمتا المرور غير متطابقتين
                                        </p>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <p className="text-xs text-green-500 mt-1">
                                            ✓ كلمتا المرور متطابقتين
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <LoadingButton
                                    type="submit"
                                    isLoading={isLoading}
                                    loadingText="جاري تعيين كلمة المرور..."
                                    variant="primary"
                                    className="w-full"
                                    disabled={
                                        !password ||
                                        !confirmPassword ||
                                        password !== confirmPassword
                                    }
                                >
                                    تعيين كلمة المرور الجديدة
                                </LoadingButton>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                                <FiCheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                                    تم بنجاح! 🎉
                                </h2>
                                <p className="text-slate-500 leading-relaxed">
                                    تم تعيين كلمة المرور الجديدة بنجاح. يمكنك الآن تسجيل الدخول
                                    بكلمة المرور الجديدة.
                                </p>
                            </div>

                            {/* Countdown */}
                            <div className="bg-primary/5 rounded-xl p-4">
                                <p className="text-primary text-sm">
                                    سيتم توجيهك إلى صفحة تسجيل الدخول خلال{" "}
                                    <span className="font-bold text-lg">{countdown}</span> ثوانٍ
                                </p>
                            </div>

                            {/* Manual redirect */}
                            <Link
                                href="/login"
                                className="block w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-l from-primary to-primary-dark text-white hover:shadow-lg transition-all duration-300 text-center"
                            >
                                تسجيل الدخول الآن
                            </Link>
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
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        حماية حسابك
                    </h2>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed">
                        اختر كلمة مرور قوية لحماية حسابك وبياناتك التعليمية
                    </p>

                    {/* Tips */}
                    <div className="mt-12 space-y-4 text-right w-full max-w-sm">
                        <p className="text-white/60 text-sm font-medium mb-2">
                            نصائح لكلمة مرور قوية:
                        </p>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-white/90 text-sm">
                                استخدم 8 أحرف على الأقل
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-white/90 text-sm">
                                أضف أحرف كبيرة وصغيرة
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-white/90 text-sm">
                                استخدم أرقام ورموز خاصة
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <span className="text-green-400">✓</span>
                            <p className="text-white/90 text-sm">
                                تجنب المعلومات الشخصية
                            </p>
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

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={<PageLoader message="جاري التحميل..." />}
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
