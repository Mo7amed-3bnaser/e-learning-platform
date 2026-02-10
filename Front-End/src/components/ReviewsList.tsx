'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiUser } from 'react-icons/fi';
import { reviewsAPI } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import StarRating from './StarRating';

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

interface ReviewsListProps {
  courseId: string;
  refreshTrigger?: number;
}

export default function ReviewsList({ courseId, refreshTrigger = 0 }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [courseId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewsAPI.getCourseReviews(courseId);
      setReviews(response.data.data.reviews);
      setAverageRating(response.data.data.averageRating);
      setTotalReviews(response.data.data.totalReviews);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {totalReviews > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-amber-300/50 rounded-2xl p-8 mb-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size="md" />
                <p className="text-xs text-slate-400 mt-1">من 5.0</p>
              </div>
              <div className="border-r border-amber-400/30 h-16"></div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{totalReviews}</p>
                <p className="text-sm text-slate-400">تقييم</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiStar className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد تقييمات بعد</h3>
          <p className="text-slate-400">كن أول من يشارك رأيه في هذا الكورس</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group"
            >
              {/* User Info */}
              <div className="flex items-start gap-4 mb-4">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-lg">{review.userName}</h4>
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
                      {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <p className="text-slate-200 leading-relaxed">{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
