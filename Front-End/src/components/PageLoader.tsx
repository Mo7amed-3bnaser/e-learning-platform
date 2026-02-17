"use client";

/**
 * PageLoader - لودر مسار للصفحات الداخلية
 * نفس تصميم BrandLoader بالضبط - يُستخدم أثناء تحميل الصفحات
 */

// Pre-computed particle data (subset of BrandLoader particles)
const PAGE_PARTICLES = [
  { x: 12, y: 8, delay: 0.2, dur: 4.5, size: 3 },
  { x: 85, y: 22, delay: 1.1, dur: 5.2, size: 5 },
  { x: 34, y: 67, delay: 2.4, dur: 3.8, size: 2 },
  { x: 72, y: 45, delay: 0.8, dur: 6.1, size: 4 },
  { x: 5, y: 89, delay: 1.5, dur: 4.9, size: 3 },
  { x: 91, y: 54, delay: 2.9, dur: 5.5, size: 5 },
  { x: 48, y: 12, delay: 0.4, dur: 3.5, size: 2 },
  { x: 67, y: 78, delay: 1.8, dur: 6.4, size: 4 },
  { x: 23, y: 34, delay: 2.1, dur: 4.2, size: 3 },
  { x: 56, y: 91, delay: 0.6, dur: 5.8, size: 5 },
  { x: 8, y: 45, delay: 1.3, dur: 3.2, size: 2 },
  { x: 78, y: 67, delay: 2.7, dur: 4.7, size: 4 },
];

interface PageLoaderProps {
  message?: string;
  withHeader?: boolean;
}

export default function PageLoader({
  message = "جاري التحميل...",
  withHeader = false,
}: PageLoaderProps) {
  return (
    <div
      style={{
        minHeight: withHeader ? "calc(100vh - 80px)" : "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(170deg, #0b1929 0%, #0f2744 40%, #132f50 70%, #0b1929 100%)",
        overflow: "hidden",
        direction: "ltr",
        position: "relative",
      }}
      className="brand-loader--enter"
    >
      {/* Animated background particles */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        {PAGE_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="brand-loader__particle"
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Radial glow behind logo */}
      <div className="brand-loader__glow" />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          zIndex: 1,
        }}
      >
        {/* Animated Logo SVG */}
        <div className="brand-loader__logo">
          <svg
            width="160"
            height="120"
            viewBox="0 0 130 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* M - Left vertical stroke */}
            <path
              className="brand-loader__stroke brand-loader__stroke--1"
              d="M12 20V85"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* M - Diagonal up */}
            <path
              className="brand-loader__stroke brand-loader__stroke--2"
              d="M12 20L45 60"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* M - Peak going up */}
            <path
              className="brand-loader__stroke brand-loader__stroke--3"
              d="M45 60L75 15"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* M - Right side going down */}
            <path
              className="brand-loader__stroke brand-loader__stroke--4"
              d="M75 15L75 50"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Arrow horizontal line */}
            <path
              className="brand-loader__stroke brand-loader__stroke--5"
              d="M75 15L105 15"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Arrow head */}
            <path
              className="brand-loader__stroke brand-loader__stroke--6"
              d="M95 5L108 15L95 25"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Road/Path - Orange dashed */}
            <path
              className="brand-loader__road"
              d="M14 80V22L46 56L78 16H104"
              stroke="#f97316"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Glowing dot traveling along the road */}
            <circle className="brand-loader__traveler" r="4" fill="#f97316">
              <animateMotion
                dur="2s"
                begin="0.8s"
                repeatCount="indefinite"
                path="M14 80V22L46 56L78 16H104"
              />
            </circle>

            {/* Secondary glow for the traveler */}
            <circle
              className="brand-loader__traveler-glow"
              r="8"
              fill="#f97316"
              opacity="0.3"
            >
              <animateMotion
                dur="2s"
                begin="0.8s"
                repeatCount="indefinite"
                path="M14 80V22L46 56L78 16H104"
              />
            </circle>
          </svg>
        </div>

        {/* Brand Name */}
        <div className="brand-loader__text">
          <span className="brand-loader__name brand-loader__name--en">
            Masar
          </span>
          <span className="brand-loader__divider">|</span>
          <span className="brand-loader__name brand-loader__name--ar">
            مسار
          </span>
        </div>

        {/* Tagline */}
        <p className="brand-loader__tagline">منصة مسار التعليمية</p>

        {/* Road-style progress bar */}
        <div className="brand-loader__progress-track">
          <div className="brand-loader__progress-road" />
          <div className="brand-loader__progress-fill" />
          <div className="brand-loader__progress-dot" />
        </div>

        {/* Loading message */}
        <p className="brand-loader__message">
          {message}
        </p>
      </div>
    </div>
  );
}
