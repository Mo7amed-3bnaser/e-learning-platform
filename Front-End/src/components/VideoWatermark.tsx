'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface WatermarkUser {
  name: string;
  email: string;
  id: string;
}

interface VideoWatermarkProps {
  user: WatermarkUser;
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

const POSITIONS: Position[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];

const POSITION_CLASSES: Record<Position, string> = {
  'top-left':     'top-[8%]  left-[3%]',
  'top-right':    'top-[8%]  right-[3%]',
  'bottom-left':  'bottom-[14%] left-[3%]',
  'bottom-right': 'bottom-[14%] right-[3%]',
  'center':       'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

// Shuffle and move the watermark every N seconds
const INTERVAL_MS = 8000;

export default function VideoWatermark({ user }: VideoWatermarkProps) {
  const [posIndex, setPosIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Rotate through positions — each cycle pick a random one different from current
  const rotate = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setPosIndex((prev) => {
        const available = POSITIONS.map((_, i) => i).filter((i) => i !== prev);
        return available[Math.floor(Math.random() * available.length)];
      });
      setVisible(true);
    }, 400); // short fade-out before moving
  }, []);

  useEffect(() => {
    const timer = setInterval(rotate, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [rotate]);

  const position = POSITIONS[posIndex];
  const posClass = POSITION_CLASSES[position];

  return (
    <div
      aria-hidden="true"
      className={`
        absolute z-20 pointer-events-none select-none
        transition-opacity duration-400
        ${posClass}
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className="
          bg-black/40 backdrop-blur-[2px]
          border border-white/10
          rounded-md px-3 py-2
          flex flex-col gap-0.5
        "
      >
        <span
          className="
            text-white/70 font-semibold
            text-[11px] sm:text-xs md:text-sm
            leading-tight tracking-wide
          "
        >
          {user.name}
        </span>
        <span
          className="
            text-white/55 font-mono
            text-[9px] sm:text-[10px] md:text-xs
            leading-tight tracking-wider
          "
        >
          {user.email}
        </span>
        <span
          className="
            text-white/30 font-mono
            text-[8px] sm:text-[9px]
            leading-tight tracking-widest
          "
        >
          ID: {user.id.slice(-8).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
