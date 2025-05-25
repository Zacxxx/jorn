import React, { useState } from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  loadingText?: string;
  requiresConfirmation?: boolean;
  confirmationText?: string;
  onConfirm?: () => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  fullWidth?: boolean;
  additionalClasses?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  tooltip,
  disabled,
  loadingText,
  requiresConfirmation,
  confirmationText,
  onConfirm,
  onClick,
  fullWidth,
  additionalClasses = '',
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (requiresConfirmation && !isConfirming) {
      setIsConfirming(true);
      return;
    } 
    
    if (isConfirming && onConfirm) {
        onConfirm();
        setIsConfirming(false);
    } else if (onClick) {
      onClick(event);
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const buttonText = isConfirming ? (confirmationText || 'Confirm?') : children;

  const baseStyle =
    "inline-flex items-center justify-center rounded-md border font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150 ease-in-out transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg animate-pulse-on-hover";

  const variantStyles = {
    primary: 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white border-sky-700 hover:border-sky-500 focus:ring-sky-500',
    secondary: 'bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-slate-100 border-slate-700 hover:border-slate-500 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-red-700 hover:border-red-600 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white border-green-700 hover:border-green-600 focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-slate-900 border-yellow-600 hover:border-yellow-500 focus:ring-yellow-400',
    info: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white border-teal-700 hover:border-teal-600 focus:ring-teal-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs md:text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm md:text-base min-h-[40px]',
    lg: 'px-6 py-2.5 text-base md:text-lg min-h-[48px]',
  };

  return (
    <button
      type="button"
      {...props}
      onClick={handleButtonClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyle} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 active:brightness-95"}
        ${additionalClasses || ''}
        ${props.className || ''}
      `}
      title={tooltip}
    >
      {isLoading && !isConfirming ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon && !isConfirming && <span className="mr-1.5 last:mr-0">{icon}</span>
      )}
      <span>{buttonText}</span>
    </button>
  );
};

export default ActionButton;
