import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  className = '',
  variant = 'default',
  size = 'md',
  pill = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const roundedClasses = pill ? 'rounded-full' : 'rounded-md';

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${roundedClasses}
    ${className}
  `.trim();

  return (
    <span ref={ref} className={classes} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;