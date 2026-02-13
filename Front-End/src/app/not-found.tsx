"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiHome, FiBookOpen, FiArrowRight } from "react-icons/fi";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 right-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-[10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-light/5 rounded-full blur-3xl"></div>
            </div>

            {/* Floating Dots */}
            <div className="absolute top-20 left-[15%] w-3 h-3 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}></div>
            <div className="absolute top-[30%] right-[12%] w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}></div>
            <div className="absolute bottom-[25%] left-[20%] w-4 h-4 bg-accent/20 rounded-full animate-bounce" style={{ animationDelay: "1s", animationDuration: "3.5s" }}></div>
            <div className="absolute top-[15%] right-[30%] w-2 h-2 bg-primary-light/40 rounded-full animate-pulse" style={{ animationDuration: "2s" }}></div>
            <div className="absolute bottom-[35%] right-[25%] w-3 h-3 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: "0.7s", animationDuration: "2.5s" }}></div>

            {/* Main Content */}
            <div
                className={`relative z-10 text-center px-6 max-w-2xl mx-auto transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                {/* 404 Number with Animated Gradient */}
                <div className="relative mb-6">
                    <h1
                        className="text-[10rem] sm:text-[12rem] font-black leading-none select-none animate-gradient"
                        style={{
                            background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 25%, #f97316 50%, #2d5a8a 75%, #1e3a5f 100%)",
                            backgroundSize: "300% 300%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        404
                    </h1>

                    {/* Decorative ring behind the number */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-primary/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-56 sm:h-56 border border-accent/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
                </div>

                {/* Lost Illustration - Book with question mark */}
                <div
                    className={`mb-8 flex justify-center transition-all duration-1000 delay-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                >
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        {/* Question mark badge */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md animate-bounce" style={{ animationDuration: "2s" }}>
                            ؟
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div
                    className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                        الصفحة غير موجودة
                    </h2>
                    <p className="text-lg text-slate-500 mb-2 max-w-md mx-auto leading-relaxed">
                        يبدو أنك ضللت الطريق! الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.
                    </p>
                    <p className="text-sm text-slate-400 mb-10">
                        لا تقلق، نقدر نرجعك للمسار الصحيح 🚀
                    </p>
                </div>

                {/* Action Buttons */}
                <div
                    className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                >
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary-dark text-white rounded-2xl font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
                    >
                        <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>العودة للرئيسية</span>
                        <FiArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </Link>

                    <Link
                        href="/courses"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary border-2 border-primary/20 rounded-2xl font-semibold text-lg hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <FiBookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>تصفح الكورسات</span>
                    </Link>
                </div>

                {/* Bottom hint */}
                <div
                    className={`mt-16 transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-400 bg-slate-100/80 px-5 py-2.5 rounded-full backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span>
                            منصة <span className="font-semibold text-primary">مسار</span> التعليمية | كل المسارات تبدأ من هنا
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
