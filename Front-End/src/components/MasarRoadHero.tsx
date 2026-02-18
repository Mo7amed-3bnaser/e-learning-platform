"use client";

import { motion } from "framer-motion";
import { FiBook, FiUsers, FiAward, FiStar } from "react-icons/fi";

/* ─── SVG path data for the M-road ─── */
const M_ROAD = "M 55 395 L 55 75 L 200 300 L 345 55";
const M_DOWN = "M 345 55 L 345 220";
const M_ARROW = "M 345 55 L 395 55";
const M_ARROWHEAD = "M 375 35 L 398 55 L 375 75";
const M_DASHED = "M 57 393 L 57 77 L 200 298 L 345 57 L 393 57";

/* ─── Milestone data ─── */
const MILESTONES = [
  {
    icon: FiBook,
    value: "+500",
    label: "دورة تعليمية",
    dotX: 55,
    dotY: 395,
    cardStyle: { left: "22%", top: "80%" },
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    cardBg: "bg-white dark:bg-slate-800",
    borderColor: "border-blue-100 dark:border-slate-700",
    delay: 1.0,
  },
  {
    icon: FiUsers,
    value: "+10K",
    label: "طالب نشط",
    dotX: 55,
    dotY: 75,
    cardStyle: { left: "22%", top: "6%" },
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    cardBg: "bg-emerald-50 dark:bg-emerald-950/60",
    borderColor: "border-emerald-200 dark:border-emerald-700/40",
    delay: 1.3,
  },
  {
    icon: FiAward,
    value: "+50",
    label: "مدرب خبير",
    dotX: 200,
    dotY: 300,
    cardStyle: { left: "56%", top: "59%" },
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-500 dark:text-amber-400",
    cardBg: "bg-amber-50 dark:bg-amber-950/60",
    borderColor: "border-amber-200 dark:border-amber-700/40",
    delay: 1.6,
  },
  {
    icon: FiStar,
    value: "4.9",
    label: "تقييم المنصة",
    dotX: 345,
    dotY: 55,
    cardStyle: { left: "63%", top: "19%" },
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    cardBg: "bg-white dark:bg-slate-800",
    borderColor: "border-violet-100 dark:border-slate-700",
    delay: 1.9,
  },
];

export default function MasarRoadHero() {
  return (
    <div className="relative w-full" style={{ aspectRatio: "400 / 440" }}>
      {/* ── SVG Road ── */}
      <svg
        viewBox="0 0 420 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        {/* M shape — thick translucent road body */}
        <motion.path
          d={M_ROAD}
          stroke="var(--primary)"
          strokeOpacity={0.12}
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Right-side down stroke */}
        <motion.path
          d={M_DOWN}
          stroke="var(--primary)"
          strokeOpacity={0.12}
          strokeWidth="30"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Arrow bar */}
        <motion.path
          d={M_ARROW}
          stroke="var(--primary)"
          strokeOpacity={0.14}
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut", delay: 1.8 }}
        />

        {/* Arrow head */}
        <motion.path
          d={M_ARROWHEAD}
          stroke="var(--primary)"
          strokeOpacity={0.14}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, ease: "easeInOut", delay: 2.0 }}
        />

        {/* Orange dashed center‑line (road markings) */}
        <motion.path
          d={M_DASHED}
          stroke="var(--accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="13 9"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.5 }}
        />

        {/* ── Milestone dots & pulse rings ── */}
        {MILESTONES.map((m, i) => (
          <g key={i}>
            {/* Soft glow */}
            <motion.circle
              cx={m.dotX}
              cy={m.dotY}
              r="16"
              fill="var(--accent)"
              fillOpacity={0.15}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: m.delay + 0.4,
              }}
            />
            {/* Solid dot */}
            <motion.circle
              cx={m.dotX}
              cy={m.dotY}
              r="8"
              fill="var(--accent)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: m.delay,
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            />
            {/* Pulse ring */}
            <motion.circle
              cx={m.dotX}
              cy={m.dotY}
              r="8"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: m.delay + 0.6,
                ease: "easeOut",
              }}
            />
          </g>
        ))}
      </svg>

      {/* ── Floating milestone cards ── */}
      {MILESTONES.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: m.delay + 0.15,
            type: "spring",
            stiffness: 250,
            damping: 18,
          }}
          className="absolute z-10"
          style={m.cardStyle}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`${m.cardBg} border ${m.borderColor} rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5`}
          >
            <div
              className={`w-8 h-8 ${m.iconBg} rounded-lg flex items-center justify-center shrink-0`}
            >
              <m.icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="text-slate-900 dark:text-slate-100 font-black text-sm leading-none">
                {m.value}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">
                {m.label}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* ── Certificate badge (near right extension) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 2.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="absolute z-10"
        style={{ left: "68%", top: "46%" }}
      >
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-gradient-to-br from-accent to-accent-dark text-white rounded-xl px-3 py-2 shadow-lg border border-accent/30"
        >
          <p className="text-[11px] font-bold leading-none">شهادة معتمدة</p>
          <p className="text-[9px] opacity-70 mt-0.5">بعد كل دورة</p>
        </motion.div>
      </motion.div>

    </div>
  );
}
