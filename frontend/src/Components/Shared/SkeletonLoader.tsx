import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer h-4 rounded ${className}`} />
);

export const SkeletonCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-full ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-2xl ${className}`} />
);

export const SkeletonImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer ${className}`} />
);

// A simple full-page skeleton fallback for React.Suspense
export const PageSkeleton: React.FC = () => (
  <div className="pt-24 min-h-screen max-w-max-width mx-auto px-4 md:px-gutter space-y-8 animate-pulse">
    <div className="flex justify-center">
      <SkeletonCard className="w-full max-w-2xl h-48 md:h-64" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-64 hidden md:block" />
    </div>
  </div>
);
