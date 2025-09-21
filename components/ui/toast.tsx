"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  message: string;
  tone?: "success" | "warning" | "error" | "info" | "neutral";
  duration?: number;
  isVisible?: boolean;
  onDismiss?: () => void;
  className?: string;
  showCloseButton?: boolean;
  showProgressBar?: boolean;
}

export function Toast({
  id = "parcego-toast",
  message,
  tone = "neutral",
  duration = 4000,
  isVisible = true,
  onDismiss,
  className = "",
  showCloseButton = false,
  showProgressBar = false,
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(isVisible);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setIsShowing(false);
      return;
    }

    setIsShowing(true);
    setProgress(100);

    if (duration > 0) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      const timer = setTimeout(() => {
        setIsShowing(false);
        onDismiss?.();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, duration, onDismiss]);

  if (!isShowing) return null;

  const getToneStyles = () => {
    switch (tone) {
      case "success":
        return {
          container: "border-emerald-200 bg-white shadow-emerald-100/50",
          icon: "text-emerald-600",
          text: "text-gray-900",
          iconName: "CheckCircle" as const,
        };
      case "warning":
        return {
          container: "border-amber-200 bg-white",
          icon: "text-amber-600",
          text: "text-gray-900",
          iconName: "AlertTriangle" as const,
        };
      case "error":
        return {
          container: "border-red-200 bg-white",
          icon: "text-red-600",
          text: "text-gray-900",
          iconName: "AlertCircle" as const,
        };
      case "info":
        return {
          container: "border-blue-200 bg-white",
          icon: "text-blue-600",
          text: "text-gray-900",
          iconName: "Info" as const,
        };
      default:
        return {
          container: "border-gray-200 bg-white",
          icon: "text-gray-500",
          text: "text-gray-900",
          iconName: "Info" as const,
        };
    }
  };

  const styles = getToneStyles();

  return (
    <div
      id={id}
      className={cn(
        "fixed top-6 right-6 z-[999999] animate-in slide-in-from-top fade-in duration-300 ease-out",
        className
      )}
      aria-live="polite"
      role="alert"
    >
      <div
        className={cn(
          "px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-3 min-w-[300px] max-w-[500px] relative overflow-hidden",
          "transform transition-all duration-300 ease-out",
          "hover:shadow-xl hover:scale-[1.02]",
          "bg-white border-solid",
          styles.container
        )}
      >
        {/* Progress bar */}
        {showProgressBar && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className={cn(
                "h-full transition-all duration-100 ease-linear",
                tone === "success" && "bg-emerald-500",
                tone === "warning" && "bg-amber-500",
                tone === "error" && "bg-red-500",
                tone === "info" && "bg-blue-500",
                tone === "neutral" && "bg-gray-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <div className="flex-shrink-0">
          <Icon 
            name={styles.iconName} 
            className={cn("animate-in zoom-in duration-200", styles.icon)} 
            size={18} 
          />
        </div>
        <span className={cn("text-sm font-medium flex-1 leading-relaxed", styles.text)}>
          {message}
        </span>
        {showCloseButton && (
          <button
            onClick={() => {
              setIsShowing(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            aria-label="Dismiss notification"
          >
            <Icon 
              name="X" 
              size={14} 
              className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" 
            />
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience components for different toast types
export function SuccessToast(props: Omit<ToastProps, 'tone'>) {
  return <Toast {...props} tone="success" />;
}

export function WarningToast(props: Omit<ToastProps, 'tone'>) {
  return <Toast {...props} tone="warning" />;
}

export function ErrorToast(props: Omit<ToastProps, 'tone'>) {
  return <Toast {...props} tone="error" />;
}

export function InfoToast(props: Omit<ToastProps, 'tone'>) {
  return <Toast {...props} tone="info" />;
}

// Toast hook for easier state management
export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id, isVisible: true };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAllToasts = () => {
    setToasts([]);
  };

  const showSuccessToast = (message: string, options?: Omit<ToastProps, 'message' | 'tone'>) => {
    return showToast({ ...options, message, tone: 'success' });
  };

  const showErrorToast = (message: string, options?: Omit<ToastProps, 'message' | 'tone'>) => {
    return showToast({ ...options, message, tone: 'error' });
  };

  const showWarningToast = (message: string, options?: Omit<ToastProps, 'message' | 'tone'>) => {
    return showToast({ ...options, message, tone: 'warning' });
  };

  const showInfoToast = (message: string, options?: Omit<ToastProps, 'message' | 'tone'>) => {
    return showToast({ ...options, message, tone: 'info' });
  };

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAllToasts,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  };
}

// Toast container component for rendering multiple toasts
export function ToastContainer({ toasts, onDismiss }: { 
  toasts: Array<ToastProps & { id: string }>; 
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[999999] space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 999999 - index,
          }}
        >
          <Toast
            {...toast}
            onDismiss={() => onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
