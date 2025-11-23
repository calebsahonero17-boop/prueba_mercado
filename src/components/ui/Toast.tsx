import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastType } from '../../types/product';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle removal with exit animation
  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };


  // Toast configuration based on type
  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageColor: 'text-green-800',
          progressColor: 'bg-green-500',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          progressColor: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800',
          progressColor: 'bg-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800',
          progressColor: 'bg-blue-500',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`
        relative w-full ${config.bgColor} ${config.borderColor} border rounded-md shadow-md
        transform transition-all duration-300 ease-in-out mb-3
        ${isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
        }
        hover:shadow-lg hover:scale-105
      `}
      role="alert"
    >
      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-t-md w-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} rounded-t-md animate-progress`}
            style={{
              animation: `progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {toast.title && (
              <p className={`text-sm font-medium ${config.titleColor} mb-1`}>
                {toast.title}
              </p>
            )}
            <p className={`text-sm ${config.messageColor} leading-relaxed`}>
              {toast.message}
            </p>
          </div>

          {/* Close button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                inline-flex rounded-md p-1.5 ${config.iconColor}
                hover:bg-gray-100 hover:bg-opacity-20
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-400
                transition-colors duration-200
              `}
              onClick={handleRemove}
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Toast;