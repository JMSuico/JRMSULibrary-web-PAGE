import React from 'react';
import { useLocation } from 'react-router';

/**
 * Wraps page content and applies a fade-in / slide-up animation on top-level route changes
 * with zero artificial delay or opacity-0 blackout.
 */
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const topSegment = location.pathname.split('/')[1] || 'home';

  return (
    <div
      key={topSegment}
      className="page-transition-wrapper w-full flex-1 flex flex-col animate-page-in"
      style={{ animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
};

