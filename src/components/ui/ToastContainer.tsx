import React from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../contexts/ToastContext';
import Toast from './Toast';

type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
}

function ToastContainer({ position = 'top-right', maxToasts = 5 }: ToastContainerProps) {
  const { toasts, removeToast } = useToast();

  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(-maxToasts);

  // Position classes with responsive design
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-[99999] pointer-events-none';

    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4 max-w-md`;
      case 'top-left':
        return `${baseClasses} top-4 left-4 max-w-sm`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2 max-w-sm`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4 max-w-sm`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4 max-w-sm`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm`;
      default:
        return `${baseClasses} top-4 right-4 max-w-sm`;
    }
  };

  // Don't render if no toasts
  if (visibleToasts.length === 0) {
    return null;
  }

  // Create portal to render toasts at body level
  return createPortal(
    <div className={getPositionClasses()}>
      <div className="flex flex-col space-y-2 pointer-events-auto w-full px-4 sm:px-0">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

export default ToastContainer;