import React from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  return (
    <div className="star-rating-wrapper">

      <div className="rating">
        {[5, 4, 3, 2, 1].map((star) => (
          <React.Fragment key={`star-${star}`}>
            <input 
              checked={value === star}
              onChange={() => onChange(star)}
              name="rating" 
              id={`star${star}`} 
              type="radio" 
            />
            <label htmlFor={`star${star}`} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
