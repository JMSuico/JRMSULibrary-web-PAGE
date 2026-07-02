import React from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  return (
    <div className="star-rating-wrapper">
      <style>{`
        .star-rating-wrapper .rating {
          display: inline-block;
          direction: rtl; /* For hover effect logic to work correctly */
        }
        .star-rating-wrapper .rating input {
          display: none;
        }
        .star-rating-wrapper .rating label {
          float: right;
          cursor: pointer;
          color: #ccc;
          transition: color 0.3s;
        }
        .star-rating-wrapper .rating label:before {
          content: '\\2605';
          font-size: 30px;
        }
        .star-rating-wrapper .rating input:checked ~ label,
        .star-rating-wrapper .rating label:hover,
        .star-rating-wrapper .rating label:hover ~ label {
          color: #C9A84C;
          transition: color 0.3s;
        }
      `}</style>
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
