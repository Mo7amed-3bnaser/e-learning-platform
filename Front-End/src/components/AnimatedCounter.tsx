"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!isInView) return;

    // Extract prefix (like "+"), numeric part, and suffix (like "K")
    const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const prefix = match[1];
    const numericStr = match[2];
    const suffix = match[3];
    const target = parseFloat(numericStr);
    const isDecimal = numericStr.includes(".");
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;

      if (isDecimal) {
        setDisplay(`${prefix}${current.toFixed(1)}${suffix}`);
      } else {
        setDisplay(`${prefix}${Math.floor(current)}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
