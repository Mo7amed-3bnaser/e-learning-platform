"use client";

import Link from "next/link";
import Header from "@/components/Header";
import TypingEffect from "@/components/TypingEffect";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import MasarRoadHero from "@/components/MasarRoadHero";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
  { icon: FiBook, value: "+500", label: "دورة تعليمية" },
  { icon: FiUsers, value: "+10K", label: "طالب نشط" },
  { icon: FiAward, value: "+50", label: "مدرب خبير" },
  { icon: FiStar, value: "4.9", label: "تقييم المنصة" },
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
  {
    icon: FiCode,
    label: "البرمجة وتطوير الويب",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    icon: FiCamera,
    label: "التصوير والإنتاج",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
  },
  {
    icon: FiBarChart2,
    label: "الأعمال والمال",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    icon: FiGlobe,
    label: "اللغات والترجمة",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    icon: FiMonitor,
    label: "التصميم والجرافيك",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
  {
    icon: FiTrendingUp,
    label: "التسويق الرقمي",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
  },
];

const STEPS = [
  {
    num: "01",
    title: "سجّل مجاناً",
    desc: "أنشئ حسابك في ثوانٍ وابدأ رحلتك التعليمية فوراً",
  },
  {
    num: "02",
    title: "اختر كورسك",
    desc: "تصفح مئات الكورسات واختر ما يناسب أهدافك",
  },
  {
    num: "03",
    title: "تعلم واحترف",
    desc: "شاهد الدروس، أنجز المهام، واحصل على شهادتك",
  },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms for hero blobs
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Header />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-white dark:bg-slate-900 min-h-[92vh] flex items-center"
      >
        {/* blobs with parallax */}
        <motion.div
          style={{ y: blobY1 }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 dark:bg-primary/20 blur-[100px] pointer-events-none"
        />
        <motion.div
          style={{ y: blobY2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/8 dark:bg-accent/15 blur-[90px] pointer-events-none"
        />

        {/* floating shapes with smooth infinite animation */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [12, 18, 12],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, 12, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-40 right-20 w-10 h-10 rounded-full bg-accent/20 dark:bg-accent/30 pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [-6, -14, -6],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-32 right-32 w-14 h-14 rounded-xl bg-primary/8 dark:bg-primary/15 pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            x: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="absolute bottom-20 left-1/3 w-8 h-8 rounded-full bg-accent/15 dark:bg-accent/25 pointer-events-none"
        />

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* ── Text side: staggered entrance ── */}
            <StaggerContainer stagger={0.15} className="space-y-7 text-right">
              {/* badge */}
              <StaggerItem preset="fadeRight">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full text-primary dark:text-primary-light text-sm font-semibold">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse shrink-0" />
                  منصة التعلم الإلكتروني الأولى عربياً
                </div>
              </StaggerItem>

              {/* headline */}
              <StaggerItem preset="fadeRight">
                <h1 className="text-5xl lg:text-[4.2rem] font-black text-slate-900 dark:text-slate-100 leading-[1.15] tracking-tight">
                  ابدأ رحلتك
                  <span className="block mt-2 text-primary dark:text-primary-light">
                    نحو{" "}
                    <span className="relative inline-block">
                      <TypingEffect
                        text="النجاح والتميز"
                        speed={130}
                        className="inline-block"
                      />
                      <span className="absolute -bottom-2 right-0 left-0 h-1 bg-linear-to-l from-accent to-accent-light rounded-full opacity-70" />
                    </span>
                  </span>
                </h1>
              </StaggerItem>

              {/* description */}
              <StaggerItem preset="fadeRight">
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  تعلّم من خبراء معتمدين، احصل على شهادات موثّقة، وطوّر مهاراتك
                  في البرمجة والتصميم والأعمال — بالعربية، في أي وقت.
                </p>
              </StaggerItem>

              {/* feature list */}
              <StaggerItem preset="fadeRight">
                <div className="space-y-3">
                  {[
                    {
                      icon: FiPlay,
                      color:
                        "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
                      text: "فيديوهات عالية الجودة تشاهدها في أي وقت ومكان",
                    },
                    {
                      icon: FiAward,
                      color:
                        "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
                      text: "شهادة إتمام معتمدة تُضاف لسيرتك الذاتية",
                    },
                    {
                      icon: FiTrendingUp,
                      color:
                        "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
                      text: "تتبّع تقدمك الدراسي بلوحة تحكم شخصية",
                    },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}
                      >
                        <f.icon className="w-4 h-4" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        {f.text}
                      </p>
                    </div>
                  ))}
                </div>
              </StaggerItem>

              {/* CTAs */}
              <StaggerItem preset="fadeUp">
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
              </StaggerItem>
            </StaggerContainer>

            {/* ── Right side: M-road brand visual ── */}
            <div className="relative hidden lg:flex items-center justify-center">
              <MasarRoadHero />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section className="py-16 bg-background border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <StaggerContainer
            stagger={0.12}
            className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {STATS.map((s, i) => (
              <StaggerItem key={i} preset="scaleUp">
                <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center"
                  >
                    <s.icon className="w-6 h-6 text-primary dark:text-primary-light" />
                  </motion.div>
                  <AnimatedCounter
                    value={s.value}
                    className="text-3xl font-bold text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {s.label}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <ScrollReveal preset="fadeUp" className="text-center mb-14">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                التخصصات
              </p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                تعلم في مجالك المفضل
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                من البرمجة إلى التصميم إلى الأعمال — لدينا ما يناسبك
              </p>
            </ScrollReveal>

            <StaggerContainer
              stagger={0.08}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {CATEGORIES.map((cat, i) => (
                <StaggerItem key={i} preset="fadeUp">
                  <Link
                    href="/courses"
                    className={`group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 ${cat.bg} hover:border-primary/40 dark:hover:border-primary/50 transition-all hover-lift`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm shrink-0"
                    >
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </motion.div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                      {cat.label}
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal
              preset="fadeUp"
              delay={0.4}
              className="text-center mt-10"
            >
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent font-semibold transition-colors"
              >
                استعراض كل الكورسات
                <FiArrowLeft className="w-4 h-4" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/60">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal preset="fadeUp" className="text-center mb-14">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                لماذا مسار؟
              </p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                كل ما تحتاجه في مكان واحد
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                صممنا منصتنا لتوفر لك أفضل تجربة تعليمية ممكنة
              </p>
            </ScrollReveal>

            <StaggerContainer
              stagger={0.1}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {FEATURES.map((f, i) => (
                <StaggerItem
                  key={i}
                  preset={i % 2 === 0 ? "fadeUp" : "scaleUp"}
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`group p-6 rounded-2xl border border-slate-100 dark:border-slate-700 ${f.bg} hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/40 transition-shadow`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-14 h-14 rounded-xl bg-linear-to-br ${f.color} flex items-center justify-center mb-5 shadow-md`}
                    >
                      <f.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal preset="fadeUp" className="text-center mb-16">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                كيف تبدأ؟
              </p>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                ثلاث خطوات فقط
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                البدء سهل — ما تحتاجه هو القرار
              </p>
            </ScrollReveal>

            <div className="relative">
              {/* connecting line (desktop) - animated */}
              <ScrollReveal
                custom={{
                  hidden: { scaleX: 0, opacity: 0 },
                  visible: { scaleX: 1, opacity: 1 },
                }}
                duration={1}
                delay={0.3}
                className="hidden lg:block absolute top-10 right-[16.5%] left-[16.5%] h-0.5 bg-linear-to-l from-primary/20 via-accent/40 to-primary/20 origin-right"
              />

              <StaggerContainer
                stagger={0.2}
                delay={0.2}
                className="grid lg:grid-cols-3 gap-10"
              >
                {STEPS.map((step, i) => (
                  <StaggerItem key={i} preset="fadeUp">
                    <div className="relative flex flex-col items-center text-center group">
                      {/* number bubble */}
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className="relative z-10 w-20 h-20 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center mb-6 shadow-lg cursor-default"
                      >
                        <span className="text-2xl font-black text-white">
                          {step.num}
                        </span>
                        <div className="absolute inset-0 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                        {step.desc}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-24 gradient-animated relative overflow-hidden">
        {/* decorative circles */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"
        />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle,#ffffff_1.5px,transparent_1.5px)] bg-size-[28px_28px]" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <ScrollReveal preset="fadeUp" className="max-w-3xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/90 text-sm font-medium"
            >
              <FiZap className="text-accent w-4 h-4" />
              ابدأ التعلم اليوم — مجاناً!
            </motion.div>

            {isAuthenticated ? (
              <>
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  واصل مسيرتك <br />
                  <span className="text-accent">التعليمية الآن</span>
                </h2>
                <p className="text-white/70 text-xl">
                  اكتشف كورسات جديدة وطور مهاراتك أكثر
                </p>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block"
                >
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary hover:bg-slate-100 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-white/20 hover-lift"
                  >
                    استكشف الكورسات
                    <FiArrowLeft />
                  </Link>
                </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-3 px-10 py-5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-accent/30 hover-lift"
                    >
                      إنشاء حساب مجاني
                      <FiArrowLeft />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-lg transition-all backdrop-blur-sm hover-lift"
                    >
                      تصفح الكورسات أولاً
                    </Link>
                  </motion.div>
                </div>
              </>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container mx-auto px-6 py-16">
          <StaggerContainer
            stagger={0.15}
            className="grid md:grid-cols-3 gap-10 mb-12"
          >
            {/* Brand */}
            <StaggerItem preset="fadeUp">
              <div className="space-y-4">
                <Logo size="md" showText className="text-white" />
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  منصة مسار — نحو تعليم عربي احترافي يصنع الفارق في حياتك
                  المهنية.
                </p>
              </div>
            </StaggerItem>

            {/* Links */}
            <StaggerItem preset="fadeUp">
              <div>
                <h4 className="font-bold text-slate-200 mb-5">روابط سريعة</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    { href: "/courses", label: "تصفح الكورسات" },
                    { href: "/about", label: "عن المنصة" },
                    { href: "/privacy", label: "سياسة الخصوصية" },
                    { href: "/terms", label: "الشروط والأحكام" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            {/* Contact */}
            <StaggerItem preset="fadeUp">
              <div>
                <h4 className="font-bold text-slate-200 mb-5">تواصل معنا</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>support@masar.edu</li>
                  <li>+20 100 000 0000</li>
                  <li>سوهاج، مصر</li>
                </ul>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <ScrollReveal preset="fadeUp" delay={0.3}>
            <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
              <p>© 2026 مسار — جميع الحقوق محفوظة</p>
              <p>تم تطوير هذه المنصه بواسطة يسي ومحمد</p>
            </div>
          </ScrollReveal>
        </div>
      </footer>
    </div>
  );
}
