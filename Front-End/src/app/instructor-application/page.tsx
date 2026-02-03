"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBook,
  FiAward,
  FiHome,
  FiLinkedin,
  FiGlobe,
} from "react-icons/fi";
import Logo from "@/components/Logo";

export default function InstructorApplicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    yearsOfExperience: "",
    bio: "",
    qualifications: "",
    linkedin: "",
    website: "",
    whyInstructor: "",
    courseTopics: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Here you would send the data to your backend/admin
    console.log("Instructor Application Data:", formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("تم إرسال طلبك بنجاح! سيتم التواصل معك خلال 48 ساعة.");
      // Reset form or redirect
    }, 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto relative">
        {/* Back Button - Top Right */}
        <Link
          href="/register"
          className="absolute top-6 right-6 inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group"
        >
          <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">العودة للتسجيل</span>
        </Link>

        <div className="w-full max-w-2xl space-y-6 py-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex justify-center">
              <Logo size="lg" />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-slate-800">
              طلب الانضمام كمدرب
            </h1>
            <p className="mt-2 text-slate-500">
              املأ النموذج وسنتواصل معك خلال 48 ساعة
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              معلومات هامة
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 pr-8">
              <li>• سيتم مراجعة طلبك من قبل فريقنا</li>
              <li>• سنتواصل معك عبر البريد الإلكتروني أو الهاتف</li>
              <li>• يرجى ملء جميع الحقول بدقة</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b-2 border-primary pb-2">
                المعلومات الشخصية
              </h2>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    الاسم الأول <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                      placeholder="أحمد"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    الاسم الأخير <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="محمد"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b-2 border-primary pb-2">
                المعلومات المهنية
              </h2>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  مجال التخصص <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiBook className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="مثال: تطوير الويب، التصميم، إدارة الأعمال"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  سنوات الخبرة <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white cursor-pointer"
                >
                  <option value="">اختر سنوات الخبرة</option>
                  <option value="0-1">أقل من سنة</option>
                  <option value="1-3">1-3 سنوات</option>
                  <option value="3-5">3-5 سنوات</option>
                  <option value="5-10">5-10 سنوات</option>
                  <option value="10+">أكثر من 10 سنوات</option>
                </select>
              </div>

              {/* Qualifications */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  المؤهلات والشهادات <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.qualifications}
                  onChange={(e) =>
                    setFormData({ ...formData, qualifications: e.target.value })
                  }
                  rows={3}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                  placeholder="اذكر شهاداتك الأكاديمية والمهنية (مثل: بكالوريوس، ماجستير، شهادات مهنية)"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  نبذة عنك <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                  placeholder="اكتب نبذة مختصرة عن خبراتك ومهاراتك ومسيرتك المهنية"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    LinkedIn (اختياري)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiLinkedin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                      placeholder="https://linkedin.com/in/..."
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    الموقع الشخصي (اختياري)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiGlobe className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="block w-full pr-10 pl-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white"
                      placeholder="https://your-website.com"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b-2 border-primary pb-2">
                معلومات التدريس
              </h2>

              {/* Why Instructor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  لماذا تريد أن تكون مدرباً على منصتنا؟{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.whyInstructor}
                  onChange={(e) =>
                    setFormData({ ...formData, whyInstructor: e.target.value })
                  }
                  rows={3}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                  placeholder="اذكر دوافعك وأهدافك من الانضمام كمدرب"
                />
              </div>

              {/* Course Topics */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ما هي الدورات التي تود تقديمها؟{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.courseTopics}
                  onChange={(e) =>
                    setFormData({ ...formData, courseTopics: e.target.value })
                  }
                  rows={4}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-slate-50 hover:bg-white resize-none"
                  placeholder="اذكر عناوين الدورات أو المواضيع التي تريد تدريسها (مثال: React للمبتدئين، تصميم UI/UX متقدم)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-l from-accent to-accent/80 hover:from-accent/80 hover:to-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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
              ) : (
                <>
                  <FiAward className="w-5 h-5 ml-2" />
                  إرسال طلب الانضمام
                </>
              )}
            </button>

            {/* Back Link */}
            <p className="text-center text-sm text-slate-600">
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                العودة للتسجيل كطالب
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-accent via-orange-600 to-red-600 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-6xl">👨‍🏫</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            انضم لفريق المدربين
          </h2>
          <p className="text-xl text-white/90 max-w-md leading-relaxed mb-8">
            شارك خبراتك ومعرفتك مع آلاف الطلاب وكن جزءاً من رحلة التعلم
          </p>

          {/* Features */}
          <div className="mt-8 space-y-4 text-right w-full max-w-sm">
            {[
              "منصة احترافية للتدريس",
              "دعم فني مستمر",
              "مرونة في إدارة الدورات",
              "مجتمع من المدربين المحترفين",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiAward className="w-5 h-5 text-accent" />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-10 w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
      </div>
    </div>
  );
}
