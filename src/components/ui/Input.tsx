import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  inputSize = 'md',
  fullWidth = true,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-5 py-4 text-lg rounded-xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getInputClasses = () => {
    let classes = `${baseClasses} ${variants[variant]} ${sizes[inputSize]}`;

    if (fullWidth) classes += ' w-full';
    if (error) classes += ' border-red-500 focus:border-red-500 focus:ring-red-500';
    if (Icon) {
      const iconPadding = iconPosition === 'left' ? 'pl-10' : 'pr-10';
      classes += ` ${iconPadding}`;
    }

    return `${classes} ${className}`.trim();
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className={`absolute ${iconPosition === 'left' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}>
            <Icon className={iconSizes[inputSize]} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={getInputClasses()}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;