"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Types for notifications
export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "announcement" | "warning" | "error";
  isRead?: boolean;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead?: (id: string) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "info":
      return "Info";
    case "success":
      return "CircleCheck";
    case "announcement":
      return "Megaphone";
    case "warning":
      return "AlertCircle";
    case "error":
      return "XCircle";
    default:
      return "Bell";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "info":
      return "bg-blue-100 text-blue-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "announcement":
      return "bg-purple-100 text-purple-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
}) => {
  const router = useRouter();
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  
  // Get the 3 most recent notifications
  const recentNotifications = localNotifications.slice(0, 3);
  
  const handleShowDetails = () => {
    router.push('/notifications');
  };

  const handleMarkAsRead = async (id: string) => {
    setMarkingAsRead(id);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      // Local state update if no external handler
      setLocalNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
    
    setMarkingAsRead(null);
  };

  const formatTime = (time: string) => {
    // Simple time formatting - in a real app, you'd use a library like date-fns
    return time;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 hover:shadow-sm focus:shadow-sm"
          id="parcego-notification-bell-trigger"
        >
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
              id="parcego-notification-bell-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-80 p-0 border-0 shadow-xl bg-white rounded-lg animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        align="end"
        sideOffset={8}
        id="parcego-notification-dropdown-content"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
                id="parcego-notification-dropdown-unread-badge"
              >
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer border-b border-gray-50 last:border-b-0 hover:shadow-sm ${
                  !notification.isRead ? 'bg-blue-50/50 hover:bg-blue-100/50' : ''
                }`}
                id={`parcego-notification-dropdown-item-${notification.id}`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-start w-full space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type)} transition-all duration-200 hover:scale-110`}>
                    <Icon 
                      name={getTypeIcon(notification.type)} 
                      size={16} 
                      className="text-current"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm leading-5 line-clamp-2 ${
                        !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {formatTime(notification.time)}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={markingAsRead === notification.id}
                          className={`text-xs transition-all duration-200 ${
                            markingAsRead === notification.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-800 hover:underline'
                          }`}
                          id={`parcego-notification-dropdown-mark-read-${notification.id}`}
                        >
                          {markingAsRead === notification.id ? 'Marking...' : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications
            </div>
          )}
        </div>

        {/* Show Details Button */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <Button
            onClick={handleShowDetails}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] focus:scale-[1.02] active:scale-[0.98]"
            id="parcego-notification-dropdown-show-details-btn"
          >
            Show Details
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
