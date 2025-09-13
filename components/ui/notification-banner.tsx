"use client";

import React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NotificationBannerProps {
  id?: string;
  type?: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isVisible?: boolean;
  onDismiss?: () => void;
  showDismissButton?: boolean;
  className?: string;
}

export function NotificationBanner({
  id = "parcego-notification-banner",
  type = "info",
  title,
  message,
  isVisible = true,
  onDismiss,
  showDismissButton = true,
  className = "",
}: NotificationBannerProps) {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-emerald-50/80 border-emerald-200/60",
          icon: "text-emerald-600",
          title: "text-emerald-900",
          message: "text-emerald-700",
          iconName: "CheckCircle" as const,
        };
      case "warning":
        return {
          container: "bg-amber-50/80 border-amber-200/60",
          icon: "text-amber-600",
          title: "text-amber-900",
          message: "text-amber-700",
          iconName: "AlertTriangle" as const,
        };
      case "error":
        return {
          container: "bg-red-50/80 border-red-200/60",
          icon: "text-red-600",
          title: "text-red-900",
          message: "text-red-700",
          iconName: "AlertCircle" as const,
        };
      default:
        return {
          container: "bg-blue-50/80 border-blue-200/60",
          icon: "text-blue-600",
          title: "text-blue-900",
          message: "text-blue-700",
          iconName: "Info" as const,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      id={id}
      className={`
        fixed top-0 left-0 right-0 z-[9999] w-full
        glass-blur-enhanced
        border-b border-opacity-60
        transition-all duration-300 ease-out
        ${styles.container}
        ${className}
      `}
      style={{
        // Enhanced glass effect with better visibility
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        background: 'rgba(255, 255, 255, 0.15)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.12),
          0 2px 8px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
      } as React.CSSProperties}
    >
      {/* Glass effect overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 pt-0.5">
              <Icon 
                name={styles.iconName} 
                size={20} 
                className={`${styles.icon} drop-shadow-sm`}
                aria-hidden="true"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${styles.title} leading-5`}>
                {title}
              </h3>
              <p className={`text-sm ${styles.message} mt-1 leading-5`}>
                {message}
              </p>
            </div>
          </div>
          
          {/* Dismiss Button */}
          {showDismissButton && onDismiss && (
            <div className="flex-shrink-0 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className={`
                  h-8 w-8 p-0 rounded-full
                  hover:bg-white/20 focus:bg-white/20
                  transition-all duration-200 ease-out
                  ${styles.icon}
                `}
                aria-label="Dismiss notification"
                id={`${id}-dismiss-btn`}
              >
                <X size={16} className="drop-shadow-sm" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset notification banners for common use cases
export function InfoNotificationBanner(props: Omit<NotificationBannerProps, 'type'>) {
  return <NotificationBanner {...props} type="info" />;
}

export function SuccessNotificationBanner(props: Omit<NotificationBannerProps, 'type'>) {
  return <NotificationBanner {...props} type="success" />;
}

export function WarningNotificationBanner(props: Omit<NotificationBannerProps, 'type'>) {
  return <NotificationBanner {...props} type="warning" />;
}

export function ErrorNotificationBanner(props: Omit<NotificationBannerProps, 'type'>) {
  return <NotificationBanner {...props} type="error" />;
}
