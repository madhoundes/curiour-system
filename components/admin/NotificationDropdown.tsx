"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  AdminNotification,
  NotificationType,
  NotificationPriority,
  getPriorityColor,
  getCategoryIcon,
  getCategoryLabel,
  mockAdminNotifications
} from "@/lib/mock/admin-notifications";

interface NotificationDropdownProps {
  className?: string;
}

interface NotificationItemProps {
  notification: AdminNotification;
}

  const NotificationItem = ({ notification }: NotificationItemProps) => {

  // Get colors based on category
  const getCategoryColorClasses = (category: string) => {
    switch (category) {
      case 'payment_status':
      case 'payout_request':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          dot: 'bg-emerald-600',
          badge: 'border-emerald-200 text-emerald-700'
        };
      case 'claim_submission':
      case 'integration_error':
      case 'security_alert':
      case 'document_expiration':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          dot: 'bg-red-600',
          badge: 'border-red-200 text-red-700'
        };
      case 'shopify_integration':
      case 'merchant_registration':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          dot: 'bg-blue-600',
          badge: 'border-blue-200 text-blue-700'
        };
      default:
        // Use priority colors for other categories
        return notification.priority === 'high' 
          ? { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-600', badge: 'border-red-200 text-red-700' }
          : notification.priority === 'normal' 
            ? { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-600', badge: 'border-blue-200 text-blue-700' } 
            : { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', badge: 'border-gray-200 text-gray-700' };
    }
  };

  const categoryColors = getCategoryColorClasses(notification.category);
  const categoryIcon = getCategoryIcon(notification.category);
  const categoryLabel = getCategoryLabel(notification.category);
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  return (
    <div
      className={cn(
        "p-4 transition-colors duration-200 motion-reduce:transition-none relative",
        notification.status === 'unread' && "bg-blue-50/30 border-l-4 border-l-blue-500"
      )}
      id={`parcego-admin-notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          categoryColors.bg
        )}>
          <Icon 
            name={categoryIcon} 
            size={16} 
            className={categoryColors.text}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={cn(
              "text-sm font-medium text-gray-900 truncate pr-4",
              notification.status === 'unread' && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", 
              notification.priority === 'high' ? 'bg-red-600' : 
              notification.priority === 'normal' ? 'bg-blue-600' : 'bg-gray-400'
            )} />
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5", categoryColors.badge)}>
                {categoryLabel}
              </Badge>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const NotificationDropdown = ({ className }: NotificationDropdownProps) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(mockAdminNotifications);
  const [activeTab, setActiveTab] = useState<Exclude<NotificationType, 'global'>>('merchants');
  const [isOpen, setIsOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');

  // Notifications are now managed in local state

  // Get current tab notifications with filtering
  const getCurrentTabNotifications = useMemo(() => {
    let tabNotifications: AdminNotification[];
    switch (activeTab) {
      case 'merchants':
        tabNotifications = notifications.filter(n => n.type === 'merchants' || n.type === 'global');
        break;
      case 'couriers':
        tabNotifications = notifications.filter(n => n.type === 'couriers' || n.type === 'global');
        break;
      default:
        tabNotifications = notifications.filter(n => n.type === 'merchants' || n.type === 'global');
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      tabNotifications = tabNotifications.filter(n => n.priority === filterPriority);
    }

    // Sort by timestamp (newest first) and then by priority (high first)
    return tabNotifications.sort((a, b) => {
      // First sort by read status (unread first)
      if (a.status !== b.status) {
        return a.status === 'unread' ? -1 : 1;
      }
      // Then by priority
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Finally by timestamp
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [activeTab, notifications, filterPriority]);

  // Get unread counts from local state
  const totalUnreadCount = notifications.filter(n => n.status === 'unread').length;
  const merchantUnreadCount = notifications.filter(n => 
    n.status === 'unread' && (n.type === 'merchants' || n.type === 'global')
  ).length;
  const courierUnreadCount = notifications.filter(n => 
    n.status === 'unread' && (n.type === 'couriers' || n.type === 'global')
  ).length;

  // Mark notification as read
  const handleMarkAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
  }, []);

  // Handle notification actions
  const handleNotificationAction = useCallback((notificationId: string, actionId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    // Handle different action types
    switch (action.action) {
      case 'approve':
        console.log(`Approving ${notificationId}`);
        // Handle approval logic
        break;
      case 'reject':
        console.log(`Rejecting ${notificationId}`);
        // Handle rejection logic
        break;
      case 'contact':
        console.log(`Contacting for ${notificationId}`);
        // Handle contact logic
        break;
      case 'resolve':
        console.log(`Resolving ${notificationId}`);
        // Handle resolve logic
        break;
      case 'view':
        console.log(`Viewing details for ${notificationId}`);
        // Handle view logic
        break;
      case 'navigate':
        if (action.url) {
          console.log(`Navigating to ${action.url}`);
          // Handle navigation
        }
        break;
      default:
        console.log(`Unknown action: ${action.action}`);
    }

    // Mark as read when action is taken
    handleMarkAsRead(notificationId);
  }, [notifications, handleMarkAsRead]);

  // Mark all as read for current tab
  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = getCurrentTabNotifications
      .filter(n => n.status === 'unread')
      .map(n => n.id);
    
    if (unreadIds.length === 0) return;
    
    setNotifications(prev => 
      prev.map(notification => 
        unreadIds.includes(notification.id)
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
    
    // Show success feedback
    console.log(`Marked ${unreadIds.length} notifications as read`);
  }, [getCurrentTabNotifications]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilterPriority('all');
  }, []);

  const currentTabNotifications = getCurrentTabNotifications;
  const currentTabUnreadCount = currentTabNotifications.filter(n => n.status === 'unread').length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("relative", className)}
          id="parcego-admin-notifications-btn"
          aria-label={`Notifications (${totalUnreadCount} unread)`}
        >
          <Icon name="Bell" size={20} />
          {totalUnreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 min-h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-red-600 hover:bg-red-600 border-white border-2 rounded-full"
              id="parcego-admin-notifications-count"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[450px] max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] p-0 shadow-lg border-0 max-h-[70vh] sm:max-h-[75vh] overflow-hidden"
        id="parcego-admin-notifications-dropdown"
        sideOffset={8}
        alignOffset={-8}
      >
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {filterPriority !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-gray-600 hover:text-gray-700 h-9"
                  id="parcego-admin-notifications-clear-filters"
                >
                  Clear filters
                </Button>
              )}
              {currentTabUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 h-9"
                  id="parcego-admin-notifications-mark-all-read"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex items-center justify-end mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm gap-1 justify-center"
                  id="parcego-admin-notifications-priority-filter"
                >
                  <Icon name="Filter" size={14} />
                  {filterPriority === 'all' ? 'All Priorities' : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                  <Icon name="ChevronDown" size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('high')}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2" />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('normal')}>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2" />
                  Normal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('low')}>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2" />
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Exclude<NotificationType, 'global'>)}>
            <TabsList className="grid w-full grid-cols-2 bg-white h-auto overflow-hidden shadow-none">
              <TabsTrigger 
                value="merchants" 
                className="relative text-sm h-9 font-normal data-[state=active]:font-[700] data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                id="parcego-admin-notifications-tab-merchants"
              >
                Merchants
                {merchantUnreadCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs bg-blue-600 rounded-full">
                    {merchantUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="couriers" 
                className="relative text-sm h-9 font-normal data-[state=active]:font-[700] data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                id="parcego-admin-notifications-tab-couriers"
              >
                Couriers
                {courierUnreadCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs bg-blue-600 rounded-full">
                    {courierUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)] overflow-y-auto relative">
          <div className="divide-y divide-gray-100 relative z-0 pt-2 pb-4">
            {currentTabNotifications.length > 0 ? (
              currentTabNotifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="p-8 text-center">
                <Icon 
                  name={filterPriority !== 'all' ? 'Filter' : 'Bell'} 
                  size={48} 
                  className="mx-auto text-gray-300 mb-4" 
                />
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {filterPriority !== 'all' ? 'No matching notifications' : 'No notifications'}
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  {filterPriority !== 'all' 
                    ? `No ${activeTab} notifications match your current filters.`
                    : `You're all caught up! No ${activeTab} notifications at the moment.`
                  }
                </p>
                {filterPriority !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer with View All Button */}
        <div className="p-3.5 bg-white border-t border-gray-100 sticky bottom-0 left-0 right-0 z-40 shadow-lg">
          <Button
            variant="default"
            size="default"
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 relative z-40 font-bold"
            onClick={() => {
              setIsOpen(false);
              // Navigate to full notifications page
              console.log(`Navigate to ${activeTab} notifications page`);
            }}
            id="parcego-admin-notifications-view-all"
          >
            View all {activeTab} notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
