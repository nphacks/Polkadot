import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';
import type { ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider Component
 * 
 * Provides toast notification functionality to the entire app
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider
      value={{
        showToast: toast.showToast,
        dismissToast: toast.dismissToast,
        dismissAll: toast.dismissAll,
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
      }}
    >
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.dismissToast} />
    </ToastContext.Provider>
  );
};

/**
 * useToastContext Hook
 * 
 * Access toast notification methods from any component
 */
export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
