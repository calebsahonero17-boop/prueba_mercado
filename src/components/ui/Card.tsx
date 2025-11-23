import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl transition-all duration-300';

  const variants = {
    default: 'bg-white shadow-sm border border-gray-200',
    elevated: 'bg-white shadow-lg border-0',
    outlined: 'bg-white border-2 border-gray-300 shadow-none',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const hoverEffects = hover || clickable ? 'hover-lift hover:shadow-xl' : '';
  const cursorStyle = clickable ? 'cursor-pointer' : '';

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverEffects}
    ${cursorStyle}
    ${className}
  `.trim();

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card subcomponents
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({
  className = '',
  title,
  subtitle,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`mb-4 ${className}`} {...props}>
    {title && <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>}
    {subtitle && <p className="text-gray-600">{subtitle}</p>}
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`text-gray-700 ${className}`} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export default Card;