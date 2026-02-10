'use client';

import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  size = 'md',
  showNumber = false,
  interactive = false,
  onChange
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          disabled={!interactive}
          onClick={() => handleClick(index)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <FiStar
            className={`${sizeClasses[size]} ${
              index < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : index < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
      {showNumber && (
        <span className="text-sm font-medium text-slate-600 mr-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
