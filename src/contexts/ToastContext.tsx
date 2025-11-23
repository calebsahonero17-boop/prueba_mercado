import React, { createContext, useContext, useReducer, ReactNode, useCallback, useRef, useMemo } from 'react';
import { Toast, ToastState, ToastActions, ToastType } from '../types/product';

// Toast Actions
type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL_TOASTS' };

// Initial state
const initialState: ToastState = {
  toasts: [],
};

// Toast reducer
function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    case 'CLEAR_ALL_TOASTS':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
}

// Context
const ToastContext = createContext<(ToastState & ToastActions) | null>(null);

// Provider component
interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeToast = useCallback((id: string) => {
    const existingTimeout = timeouts.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeouts.current.delete(id);
    }
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt'>) => {
    const toast: Toast = {
      id: generateId(),
      createdAt: new Date(),
      duration: 2500,
      ...toastData,
    };
    dispatch({ type: 'ADD_TOAST', payload: toast });

    const finalDuration = toast.duration && toast.duration > 0 ? toast.duration : 2500;
    const timeout = setTimeout(() => removeToast(toast.id), finalDuration);
    timeouts.current.set(toast.id, timeout);
  }, [generateId, removeToast]);

  const actions = useMemo(() => ({
    addToast,
    removeToast,
    clearAllToasts: () => dispatch({ type: 'CLEAR_ALL_TOASTS' }),
    success: (message: string, title?: string, duration?: number) => addToast({ type: 'success', message, title, duration: duration || 2000 }),
    error: (message: string, title?: string, duration?: number) => addToast({ type: 'error', message, title, duration: duration || 3000 }),
    warning: (message: string, title?: string, duration?: number) => addToast({ type: 'warning', message, title, duration: duration || 2500 }),
    info: (message: string, title?: string, duration?: number) => addToast({ type: 'info', message, title, duration: duration || 2000 }),
  }), [addToast, removeToast]);

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}