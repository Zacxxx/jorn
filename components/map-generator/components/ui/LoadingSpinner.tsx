
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-[6px]',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-amber-700 ${className}`} role="status" aria-live="polite">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-amber-500 border-t-transparent`}
      />
      {message && <p className="mt-3 text-sm sm:text-base font-medium">{message}</p>}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
};
