"use client";

import { motion, useInView, type Variant } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ─── Preset animation variants ─── */
const presets = {
  fadeUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  rotateIn: {
    hidden: { opacity: 0, rotate: -8, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1 },
  },
  blurIn: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
} as const;

type PresetName = keyof typeof presets;

interface ScrollRevealProps {
  children?: ReactNode;
  preset?: PresetName;
  custom?: { hidden: Variant; visible: Variant };
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: "div" | "section" | "footer" | "span" | "p" | "h2" | "h3";
}

export default function ScrollReveal({
  children,
  preset = "fadeUp",
  custom,
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const variants = custom ?? presets[preset];
  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

/* ─── Stagger container for child items ─── */
interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  once = true,
  amount = 0.15,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger child item (use inside StaggerContainer) ─── */
interface StaggerItemProps {
  children: ReactNode;
  preset?: PresetName;
  custom?: { hidden: Variant; visible: Variant };
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  preset = "fadeUp",
  custom,
  duration = 0.5,
  className,
}: StaggerItemProps) {
  const variants = custom ?? presets[preset];

  return (
    <motion.div
      variants={variants}
      transition={{
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
