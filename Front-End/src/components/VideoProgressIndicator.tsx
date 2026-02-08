interface VideoProgressIndicatorProps {
  completed: boolean;
  watchDuration?: number;
  totalDuration: number;
}

export default function VideoProgressIndicator({
  completed,
  watchDuration = 0,
  totalDuration
}: VideoProgressIndicatorProps) {
  // Calculate watch percentage
  const watchPercentage = totalDuration > 0
    ? Math.min(Math.round((watchDuration / totalDuration) * 100), 100)
    : 0;

  if (completed) {
    return (
      <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // Partially watched
  if (watchPercentage > 0) {
    return (
      <div className="relative w-6 h-6 flex-shrink-0">
        {/* Progress ring background */}
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-600"
          />
          {/* Progress circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - watchPercentage / 100)}`}
            className="text-blue-400 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-bold text-blue-400">{watchPercentage}</span>
        </div>
      </div>
    );
  }

  // Not started
  return (
    <div className="flex items-center justify-center w-6 h-6 border-2 border-slate-600 rounded-full flex-shrink-0">
      <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
    </div>
  );
}
