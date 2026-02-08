import { useState } from 'react';

interface VideoCompletionButtonProps {
  videoId: string;
  courseId: string;
  isCompleted: boolean;
  onComplete: () => Promise<void>;
}

export default function VideoCompletionButton({
  videoId,
  courseId,
  isCompleted,
  onComplete
}: VideoCompletionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    try {
      await onComplete();
    } catch (error) {
      console.error('Error marking video complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600/20 text-green-400 rounded-lg border border-green-500/30 cursor-default"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">مشاهد ✓</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>جاري الحفظ...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">تحديد كمكتمل ✓</span>
        </>
      )}
    </button>
  );
}
