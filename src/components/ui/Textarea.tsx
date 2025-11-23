import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  label,
  error,
  variant = 'default',
  fullWidth = true,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
  };

  const sizes = 'px-4 py-3 text-base rounded-lg'; // Default size

  const getTextareaClasses = () => {
    let classes = `${baseClasses} ${variants[variant]} ${sizes}`;

    if (fullWidth) classes += ' w-full';
    if (error) classes += ' border-red-500 focus:border-red-500 focus:ring-red-500';

    return `${classes} ${className}`.trim();
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          className={getTextareaClasses()}
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

Textarea.displayName = 'Textarea';

export default Textarea;
