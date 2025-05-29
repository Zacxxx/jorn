
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  // Use CSS variables for spinner size and border
  const sizeStyles = {
    sm: { width: 'var(--ui-spinner-sm-size)', height: 'var(--ui-spinner-sm-size)', borderWidth: 'var(--ui-spinner-sm-border)' },
    md: { width: 'var(--ui-spinner-md-size)', height: 'var(--ui-spinner-md-size)', borderWidth: 'var(--ui-spinner-md-border)' },
    lg: { width: 'var(--ui-spinner-lg-size)', height: 'var(--ui-spinner-lg-size)', borderWidth: 'var(--ui-spinner-lg-border)' },
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className="animate-spin rounded-full border-slate-300 border-t-sky-500"
        style={sizeStyles[size]}
      ></div>
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
