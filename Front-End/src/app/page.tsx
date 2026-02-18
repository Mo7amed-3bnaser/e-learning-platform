"use client";

import Link from "next/link";
import Header from "@/components/Header";
import TypingEffect from "@/components/TypingEffect";
import {
  FiArrowLeft,
  FiBook,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiPlay,
  FiStar,
  FiMonitor,
  FiCode,
  FiCamera,
  FiBarChart2,
  FiGlobe,
  FiZap,
} from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const STATS = [
  { icon: FiBook,       value: "+500",  label: "دورة تعليمية"  },
  { icon: FiUsers,      value: "+10K",  label: "طالب نشط"      },
  { icon: FiAward,      value: "+50",   label: "مدرب خبير"     },
  { icon: FiStar,       value: "4.9",   label: "تقييم المنصة"  },
];

const FEATURES = [
  {
    icon: FiPlay,
    title: "محتوى فيديو عالي الجودة",
    desc: "دروس مسجلة بجودة عالية يمكنك مشاهدتها في أي وقت ومن أي مكان",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: FiAward,
    title: "شهادات معتمدة",
    desc: "احصل على شهادة إتمام موثقة بعد إنهاء كل دورة بنجاح",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: FiUsers,
    title: "مدربون محترفون",
    desc: "تعلم على يد خبراء معتمدين ذوي خبرة عملية حقيقية في مجالاتهم",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: FiTrendingUp,
    title: "تطور مستمر",
    desc: "محتوى يتجدد بشكل دوري ليواكب أحدث التوجهات في سوق العمل",
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    icon: FiZap,
    title: "تعلم بسرعتك",
    desc: "مرونة كاملة — توقف، أعد، وتقدم بالوتيرة التي تناسبك",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: FiBarChart2,
    title: "تتبع تقدمك",
    desc: "لوحة تحكم شخصية لمتابعة نسبة إتمامك في كل كورس بسهولة",
    color: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
  },
];

const CATEGORIES = [
  { icon: FiCode,    label: "البرمجة وتطوير الويب",  color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/50"   },
  { icon: FiCamera,  label: "التصوير والإنتاج",       color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-950/50"   },
  { icon: FiBarChart2,label: "الأعمال والمال",         color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  { icon: FiGlobe,   label: "اللغات والترجمة",        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
  { icon: FiMonitor, label: "التصميم والجرافيك",      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50" },
  { icon: FiTrendingUp,label: "التسويق الرقمي",       color: "text-cyan-600 dark:text-cyan-400",   bg: "bg-cyan-50 dark:bg-cyan-950/50"   },
];

const STEPS = [
  { num: "01", title: "سجّل مجاناً",       desc: "أنشئ حسابك في ثوانٍ وابدأ رحلتك التعليمية فوراً" },
  { num: "02", title: "اختر كورسك",        desc: "تصفح مئات الكورسات واختر ما يناسب أهدافك" },
  { num: "03", title: "تعلم واحترف",       desc: "شاهد الدروس، أنجز المهام، واحصل على شهادتك" },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Header />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 min-h-[92vh] flex items-center">

        {/* blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 dark:bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/8 dark:bg-accent/15 blur-[90px] pointer-events-none" />

        {/* floating shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 rotate-12 animate-bounce-slow pointer-events-none" />
        <div className="absolute top-40 right-20 w-10 h-10 rounded-full bg-accent/20 dark:bg-accent/30 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-32 right-32 w-14 h-14 rounded-xl bg-primary/8 dark:bg-primary/15 -rotate-6 [animation-delay:1s] animate-bounce-slow pointer-events-none" />
        <div className="absolute bottom-20 left-1/3 w-8 h-8 rounded-full bg-accent/15 dark:bg-accent/25 [animation-delay:0.5s] animate-pulse-slow pointer-events-none" />

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Text ── */}
            <div className="space-y-7 text-right animate-fadeIn">

              {/* badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full text-primary dark:text-primary-light text-sm font-semibold">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse shrink-0" />
                منصة التعلم الإلكتروني الأولى عربياً
              </div>

              {/* headline */}
              <h1 className="text-5xl lg:text-[4.2rem] font-black text-slate-900 dark:text-slate-100 leading-[1.15] tracking-tight">
                ابدأ رحلتك
                <span className="block mt-2 text-primary dark:text-primary-light">
                  نحو{" "}
                  <span className="relative inline-block">
                    <TypingEffect text="النجاح والتميز" speed={130} className="inline-block" />
                    <span className="absolute -bottom-2 right-0 left-0 h-1 bg-linear-to-l from-accent to-accent-light rounded-full opacity-70" />
                  </span>
                </span>
              </h1>

              {/* description */}
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                تعلّم من خبراء معتمدين، احصل على شهادات موثّقة،
                وطوّر مهاراتك في البرمجة والتصميم والأعمال — بالعربية، في أي وقت.
              </p>

              {/* feature list — واقعية */}
              <div className="space-y-3">
                {[
                  { icon: FiPlay,       color: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",    text: "فيديوهات عالية الجودة تشاهدها في أي وقت ومكان"         },
                  { icon: FiAward,      color: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400", text: "شهادة إتمام معتمدة تُضاف لسيرتك الذاتية"              },
                  { icon: FiTrendingUp, color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400", text: "تتبّع تقدمك الدراسي بلوحة تحكم شخصية"         },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                      <f.icon className="w-4 h-4" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{f.text}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-1">
                <Link
                  href="/courses"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl hover-lift"
                >
                  تصفح الكورسات
                  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-3 px-8 py-4 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary dark:hover:border-primary-light dark:hover:text-primary-light rounded-xl font-semibold text-lg transition-all hover-lift"
                  >
                    إنشاء حساب مجاناً
                  </Link>
                )}
              </div>

            </div>

            {/* ── Right side: decorative brand visual ── */}
            <div className="relative hidden lg:flex items-center justify-center animate-slideInUp">
              {/* big background circle */}
              <div className="w-[380px] h-[380px] rounded-full bg-linear-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 flex items-center justify-center border border-primary/10 dark:border-primary/20 shadow-inner">
                {/* middle circle */}
                <div className="w-[260px] h-[260px] rounded-full bg-linear-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 flex items-center justify-center border border-primary/15 dark:border-primary/25">
                  {/* centre */}
                  <div className="w-[150px] h-[150px] rounded-full bg-primary dark:bg-primary-light/90 flex flex-col items-center justify-center gap-1 shadow-xl shadow-primary/30">
                    <FiBook className="w-10 h-10 text-white" />
                    <span className="text-white font-black text-xl leading-none">مسار</span>
                    <span className="text-white/60 text-[10px]">Masar</span>
                  </div>
                </div>
              </div>

              {/* orbiting badge: courses */}
              <div className="absolute top-6 right-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <FiBook className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-right">
                  <p className="text-slate-900 dark:text-slate-100 font-black text-lg leading-none">+500</p>
                  <p className="text-slate-400 text-xs">دورة تعليمية</p>
                </div>
              </div>

              {/* orbiting badge: certificate */}
              <div className="absolute bottom-10 right-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/40 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 [animation-delay:0.8s] animate-bounce-slow">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <FiAward className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-right">
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-sm leading-none">شهادات معتمدة</p>
                  <p className="text-slate-400 text-xs mt-0.5">بعد كل دورة</p>
                </div>
              </div>

              {/* orbiting badge: students */}
              <div className="absolute top-16 left-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 [animation-delay:0.4s] animate-bounce-slow">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <FiUsers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-slate-900 dark:text-slate-100 font-black text-lg leading-none">+10K</p>
                  <p className="text-slate-400 text-xs">متعلم نشط</p>
                </div>
              </div>

              {/* orbiting badge: rating */}
              <div className="absolute bottom-16 left-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 [animation-delay:1.2s] animate-bounce-slow">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,i) => (
                    <FiStar key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">4.9</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className="py-16 bg-background border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <s.icon className="w-6 h-6 text-primary dark:text-primary-light" />
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{s.value}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">التخصصات</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                تعلم في مجالك المفضل
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                من البرمجة إلى التصميم إلى الأعمال — لدينا ما يناسبك
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat, i) => (
                <Link
                  href="/courses"
                  key={i}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 ${cat.bg} hover:border-primary/40 dark:hover:border-primary/50 transition-all hover-lift`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">{cat.label}</span>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent font-semibold transition-colors"
              >
                استعراض كل الكورسات
                <FiArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/60">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">لماذا مسار؟</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                كل ما تحتاجه في مكان واحد
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                صممنا منصتنا لتوفر لك أفضل تجربة تعليمية ممكنة
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className={`group p-6 rounded-2xl border border-slate-100 dark:border-slate-700 ${f.bg} hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/40 transition-all hover-lift`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">كيف تبدأ؟</p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                ثلاث خطوات فقط
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                البدء سهل — ما تحتاجه هو القرار
              </p>
            </div>

            <div className="relative">
              {/* connecting line (desktop) */}
              <div className="hidden lg:block absolute top-10 right-[16.5%] left-[16.5%] h-0.5 bg-linear-to-l from-primary/20 via-accent/40 to-primary/20" />

              <div className="grid lg:grid-cols-3 gap-10">
                {STEPS.map((step, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center group">
                    {/* number bubble */}
                    <div className="relative z-10 w-20 h-20 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-2xl font-black text-white">{step.num}</span>
                      <div className="absolute inset-0 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{step.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-24 gradient-animated relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle,#ffffff_1.5px,transparent_1.5px)] bg-size-[28px_28px]" />

        <div className="container mx-auto px-6 relative z-10 text-center animate-fadeIn">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/90 text-sm font-medium">
              <FiZap className="text-accent w-4 h-4" />
              ابدأ التعلم اليوم — مجاناً!
            </div>

            {isAuthenticated ? (
              <>
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  واصل مسيرتك <br />
                  <span className="text-accent">التعليمية الآن</span>
                </h2>
                <p className="text-white/70 text-xl">
                  اكتشف كورسات جديدة وطور مهاراتك أكثر
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary hover:bg-slate-100 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-white/20 hover-lift"
                >
                  استكشف الكورسات
                  <FiArrowLeft />
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  جاهز تبدأ <br />
                  <span className="text-accent">رحلتك التعليمية؟</span>
                </h2>
                <p className="text-white/70 text-xl">
                  انضم إلى مجتمع مسار واحصل على وصول فوري لمئات الكورسات
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-accent/30 hover-lift"
                  >
                    إنشاء حساب مجاني
                    <FiArrowLeft />
                  </Link>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-lg transition-all backdrop-blur-sm hover-lift"
                  >
                    تصفح الكورسات أولاً
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <Logo size="md" showText className="text-white" />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                منصة مسار — نحو تعليم عربي احترافي يصنع الفارق في حياتك المهنية.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-slate-200 mb-5">روابط سريعة</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { href: "/courses",  label: "تصفح الكورسات" },
                  { href: "/about",    label: "عن المنصة"     },
                  { href: "/privacy",  label: "سياسة الخصوصية" },
                  { href: "/terms",    label: "الشروط والأحكام" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-200 mb-5">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>support@masar.edu</li>
                <li>+20 100 000 0000</li>
                <li>القاهرة، مصر</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <p>© 2026 مسار — جميع الحقوق محفوظة</p>
            <p>صُنع بـ ❤️ للمتعلمين العرب</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
