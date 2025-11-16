import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'event' | 'timeline';
  count?: number;
}

/**
 * LoadingSkeleton Component
 * 
 * Displays skeleton loading placeholders for better perceived performance
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-shimmer" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-shimmer" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2 animate-shimmer" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-shimmer" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-shimmer" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
                  {i < count - 1 && (
                    <div className="w-0.5 h-20 bg-gray-200 dark:bg-gray-700 animate-shimmer" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-shimmer" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3 animate-shimmer" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderSkeleton()}</>;
};
