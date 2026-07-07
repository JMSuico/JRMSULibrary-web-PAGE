import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-blue-50 to-gray-200 bg-[length:200%_100%] rounded ${className}`} />
);

export const SkeletonCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-blue-50 to-gray-200 bg-[length:200%_100%] rounded-full ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-blue-50 to-gray-200 bg-[length:200%_100%] rounded-2xl ${className}`} />
);

export const SkeletonImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-blue-50 to-gray-200 bg-[length:200%_100%] ${className}`} />
);

// A simple full-page skeleton fallback for React.Suspense
export const PageSkeleton: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8 animate-pulse">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-navy rounded-full animate-spin mb-4" />
    <p className="text-gray-500 font-medium tracking-wide">Loading content...</p>
  </div>
);
