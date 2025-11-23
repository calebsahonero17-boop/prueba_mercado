import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'transparentOutline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}, ref) => {
  // Filter out custom props that shouldn't be passed to DOM
  const { icon, iconPosition: _, ...domProps } = props as any;
  let buttonClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ';

  // Variant styles
  switch (variant) {
    case 'primary':
      buttonClasses += 'bg-gradient-to-r from-blue-600 to-green-500 text-white hover:from-blue-700 hover:to-green-600 focus:ring-blue-500 ';
      break;
    case 'secondary':
    case 'outline':
      buttonClasses += 'bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 focus:ring-blue-500 ';
      break;
    case 'ghost':
      buttonClasses += 'text-blue-700 hover:bg-blue-50 focus:ring-blue-500 ';
      break;
    case 'success':
      buttonClasses += 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ';
      break;
    case 'danger':
      buttonClasses += 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ';
      break;
    case 'transparentOutline':
      buttonClasses += 'bg-transparent border-4 border-green-800 text-green-800 hover:bg-green-100 ';
      break;
  }

  // Size styles
  switch (size) {
    case 'sm':
      buttonClasses += 'px-3 py-1.5 text-sm ';
      break;
    case 'md':
      buttonClasses += 'px-4 py-2 text-sm ';
      break;
    case 'lg':
      buttonClasses += 'px-6 py-3 text-base ';
      break;
    case 'xl':
      buttonClasses += 'px-8 py-4 text-lg ';
      break;
  }

  // Full width
  if (fullWidth) {
    buttonClasses += 'w-full ';
  }

  if (disabled) {
    buttonClasses += 'opacity-50 cursor-not-allowed ';
  }

  buttonClasses += className;

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled}
      {...domProps}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;