'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiCheck } from 'react-icons/fi';
import { reviewsAPI } from '@/lib/api';
import { handleApiError, showSuccess } from '@/lib/toast';
import StarRating from './StarRating';

interface ReviewFormProps {
  courseId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ courseId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    checkReviewStatus();
  }, [courseId]);

  const checkReviewStatus = async () => {
    try {
      // Check if user can review (100% complete)
      const canReviewRes = await reviewsAPI.canReview(courseId);
      setCanReview(canReviewRes.data.data.canReview);

      if (canReviewRes.data.data.canReview) {
        // Check if user already reviewed
        const myReviewRes = await reviewsAPI.getMyReview(courseId);
        if (myReviewRes.data.data) {
          setExistingReview(myReviewRes.data.data);
          setRating(myReviewRes.data.data.rating);
          setComment(myReviewRes.data.data.comment || '');
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      return;
    }

    try {
      setIsLoading(true);
      await reviewsAPI.addOrUpdateReview({
        courseId,
        rating,
        comment: comment.trim()
      });

      showSuccess(existingReview ? 'تم تحديث التقييم بنجاح ✓' : 'تم إضافة التقييم بنجاح ✓');
      onReviewSubmitted();
      checkReviewStatus();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canReview) {
    return (
      <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 border border-slate-300 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FiStar className="w-6 h-6 text-slate-400" />
          <p className="text-slate-600 font-medium">
            يجب إتمام الكورس بنسبة 100% لإضافة تقييم
          </p>
        </div>
      </div>
    );
  }

  // Show form (always editable - no separate view/edit states)
  return (
    <div className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border-2 border-blue-200/50 rounded-2xl p-8 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
          <FiStar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {existingReview ? 'تقييمك للكورس' : 'شارك تقييمك للكورس'}
          </h3>
          <p className="text-sm text-slate-600">
            {existingReview ? 'يمكنك تعديل تقييمك في أي وقت' : 'ساعد طلاب آخرين في اتخاذ قرارهم'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div className="bg-white/60 rounded-xl p-5">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            التقييم <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onChange={setRating}
            />
            <span className="text-2xl font-bold text-amber-600">{rating}.0</span>
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white/60 rounded-xl p-5">
          <label className="block text-sm font-bold text-slate-700 mb-3">
            تعليقك (اختياري)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شارك تجربتك مع هذا الكورس... ماذا أعجبك؟ ماذا تعلمت؟"
            maxLength={500}
            rows={5}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none bg-white text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">
              {comment.length}/500 حرف
            </p>
            {comment.length >= 450 && (
              <p className="text-xs text-amber-600 font-medium">
                قريب من الحد الأقصى
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-blue-500 via-indigo-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جارٍ الحفظ...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                <span>{existingReview ? 'حفظ التعديلات' : 'إضافة التقييم'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
