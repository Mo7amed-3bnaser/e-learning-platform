"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiChevronLeft } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

export default function Footer() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // لا تظهر الـ Footer في صفحات الإدارة وصفحة المشاهدة وصفحات تسجيل الدخول والتسجيل وطلب الانضمام
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/watch") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/instructor-application"
  ) {
    return null;
  }

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 pt-16 pb-8">

        {/* Main grid */}
        <StaggerContainer stagger={0.12} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <StaggerItem preset="fadeUp">
            <div className="space-y-5 lg:col-span-1">
              <Logo size="md" showText className="text-white" />
              <p className="text-slate-400 text-sm leading-relaxed">
                منصة مسار — نحو تعليم عربي احترافي يصنع الفارق في حياتك المهنية.
              </p>
            </div>
          </StaggerItem>

          {/* Quick links */}
          <StaggerItem preset="fadeUp">
            <div>
              <h4 className="font-bold text-slate-200 mb-5 text-sm uppercase tracking-wider">
                روابط سريعة
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/courses", label: "تصفح الكورسات" },
                  { href: "/about", label: "عن المنصة" },
                  { href: "/contact", label: "تواصل معنا" },
                  ...(!isAuthenticated ? [
                    { href: "/register", label: "إنشاء حساب" },
                    { href: "/login", label: "تسجيل الدخول" },
                  ] : []),
                ].map((l) => (
                  <li key={l.href}>
                    <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Link
                        href={l.href}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        <FiChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        {l.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Legal */}
          <StaggerItem preset="fadeUp">
            <div>
              <h4 className="font-bold text-slate-200 mb-5 text-sm uppercase tracking-wider">
                قانوني
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/privacy", label: "سياسة الخصوصية" },
                  { href: "/terms", label: "الشروط والأحكام" },
                ].map((l) => (
                  <li key={l.href}>
                    <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Link
                        href={l.href}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        <FiChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        {l.href === "/privacy" ? "سياسة الخصوصية" : "الشروط والأحكام"}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Contact */}
          <StaggerItem preset="fadeUp">
            <div>
              <h4 className="font-bold text-slate-200 mb-5 text-sm uppercase tracking-wider">
                تواصل معنا
              </h4>
              <ul className="space-y-3">
                {[
                  { Icon: FiMail, text: "support@masar.edu", href: "mailto:support@masar.edu" },
                  { Icon: FiPhone, text: "+20 100 000 0000", href: "tel:+201000000000" },
                  { Icon: FiMapPin, text: "سوهاج، مصر", href: null },
                ].map(({ Icon, text, href }) => (
                  <li key={text} className="flex items-center gap-3 text-slate-400 text-sm group">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-slate-200" />
                    </span>
                    {href ? (
                      <a href={href} className="group-hover:text-slate-300 transition-colors hover:text-white">
                        {text}
                      </a>
                    ) : (
                      <span className="group-hover:text-slate-300 transition-colors">{text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom bar */}
        <ScrollReveal preset="fadeUp" delay={0.2}>
          <div className="border-t border-slate-800 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
            <p>© 2026 منصة مسار — جميع الحقوق محفوظة</p>
            <p>صُنع بواسطة يسي ومحمد</p>
          </div>
        </ScrollReveal>

      </div>
    </footer>
  );
}
