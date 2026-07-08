import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Wraps page content and applies a fade-in / slide-up animation on every route change.
 * Uses the React Router "useLocation" key to force a re-render/re-animation when the path changes.
 */
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionClass, setTransitionClass] = useState('animate-page-in');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionClass('opacity-0');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionClass('animate-page-in');
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div className={`w-full h-full `} style={{ animationFillMode: 'both' }}>
      {children}
    </div>
  );
};

