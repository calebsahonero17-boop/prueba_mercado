import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating = 0,
  totalStars = 5,
  size = 20,
  className = 'text-yellow-400',
  showText = true
}) => {

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${className}`} style={{ gap: '2px' }}>
        {[...Array(totalStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={index}
              size={size}
              fill={starValue <= rating ? 'currentColor' : 'none'}
              className={starValue <= rating ? '' : 'text-gray-300'}
            />
          );
        })}
      </div>
      {showText && <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)} de {totalStars}</span>}
    </div>
  );
};

export default StarRating;
