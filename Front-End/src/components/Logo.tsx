interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const sizes = {
    sm: { icon: 40, text: "text-lg" },
    md: { icon: 56, text: "text-xl" },
    lg: { icon: 72, text: "text-2xl" },
    xl: { icon: 90, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 130 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Letter M - Left vertical bar going down */}
        <path
          d="M12 20V85"
          stroke="#1e3a5f"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Letter M - Diagonal up from bottom left */}
        <path
          d="M12 20L45 60"
          stroke="#1e3a5f"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Letter M - Peak going up to arrow */}
        <path
          d="M45 60L75 15"
          stroke="#1e3a5f"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Letter M - Right side going down */}
        <path
          d="M75 15L75 50"
          stroke="#1e3a5f"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Arrow horizontal line */}
        <path
          d="M75 15L105 15"
          stroke="#1e3a5f"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Arrow head */}
        <path
          d="M95 5L108 15L95 25"
          stroke="#1e3a5f"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Road/Path - Orange dashed following M shape exactly */}
        <path
          d="M14 80V22L46 56L78 16H104"
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="12 10"
          fill="none"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className={`flex items-center gap-2 ${text} font-bold`}>
          <span className="text-primary">Masar</span>
          <span className="text-slate-300 font-normal">|</span>
          <span className="text-primary">مسار</span>
        </div>
      )}
    </div>
  );
}

// Compact icon-only version for favicons or small spaces
export function LogoIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Letter M */}
      <path
        d="M12 20V85"
        stroke="#1e3a5f"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 20L45 60L75 15V50"
        stroke="#1e3a5f"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Arrow */}
      <path
        d="M75 15L105 15"
        stroke="#1e3a5f"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M95 5L108 15L95 25"
        stroke="#1e3a5f"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Road following M shape */}
      <path
        d="M14 82L18 75L30 58L45 62L58 40L75 18L90 22"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 5"
        fill="none"
      />
    </svg>
  );
}
