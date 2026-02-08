interface CourseProgressBarProps {
  progress: number; // 0-100
  totalVideos: number;
  completedVideos: number;
}

export default function CourseProgressBar({
  progress,
  totalVideos,
  completedVideos
}: CourseProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            {progress}%
          </div>
          <div className="text-sm text-slate-300">
            إكمال الكورس
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {completedVideos} / {totalVideos} درس مكتمل
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 opacity-50"></div>

        {/* Progress fill */}
        <div
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-green-400 via-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
        </div>
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-2 flex items-center gap-2 text-green-400 animate-fade-in text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">
            🎉 مبروك! أكملت الكورس بنجاح
          </span>
        </div>
      )}
    </div>
  );
}
