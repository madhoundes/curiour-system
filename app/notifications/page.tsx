"use client";

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { PageHeader } from "@/components/ui/page-header"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
export type NotificationPriority = 'high' | 'normal' | 'low';
export type NotificationType = 'shipment' | 'system' | 'billing' | 'announcement';
export type NotificationStatus = 'unread' | 'read' | 'dismissed';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string; // ISO string
  category: string;
  relatedId?: string; // tracking number, invoice ID, etc.
  actions?: Array<{
    label: string;
    action: 'view' | 'dismiss' | 'mark-read' | 'navigate';
    url?: string;
  }>;
  metadata?: Record<string, unknown>;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'shipment',
    priority: 'high',
    status: 'unread',
    title: 'Shipment Delivered Successfully',
    message: 'Your package ASH-20250101-ABC123 has been delivered to John Smith in New York, NY.',
    timestamp: '2025-01-15T10:30:00Z',
    category: 'delivery',
    relatedId: 'ASH-20250101-ABC123',
    actions: [
      { label: 'View Details', action: 'navigate', url: '/shipments/ASH-20250101-ABC123' },
      { label: 'Mark as Read', action: 'mark-read' }
    ]
  },
  {
    id: 'notif-002',
    type: 'shipment',
    priority: 'normal',
    status: 'unread',
    title: 'Shipment Out for Delivery',
    message: 'Package ASH-20250101-DEF456 is now out for delivery. Expected delivery: Today by 8:00 PM.',
    timestamp: '2025-01-15T08:15:00Z',
    category: 'delivery',
    relatedId: 'ASH-20250101-DEF456',
    actions: [
      { label: 'Track Package', action: 'navigate', url: '/shipments?tracking=ASH-20250101-DEF456' },
      { label: 'Mark as Read', action: 'mark-read' }
    ]
  },
  {
    id: 'notif-003',
    type: 'system',
    priority: 'normal',
    status: 'read',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance on January 16th, 2025 from 2:00 AM to 4:00 AM EST. Some features may be temporarily unavailable.',
    timestamp: '2025-01-14T16:00:00Z',
    category: 'maintenance',
    actions: [
      { label: 'View Details', action: 'view' },
      { label: 'Dismiss', action: 'dismiss' }
    ]
  },
  {
    id: 'notif-004',
    type: 'billing',
    priority: 'high',
    status: 'unread',
    title: 'Payment Failed',
    message: 'Payment for invoice INV-2025-001 failed. Please update your payment method to avoid service interruption.',
    timestamp: '2025-01-14T12:30:00Z',
    category: 'payment',
    relatedId: 'INV-2025-001',
    actions: [
      { label: 'Update Payment', action: 'navigate', url: '/billing' },
      { label: 'Mark as Read', action: 'mark-read' }
    ]
  },
  {
    id: 'notif-005',
    type: 'announcement',
    priority: 'normal',
    status: 'read',
    title: 'New Feature: Bulk Shipping Labels',
    message: 'Create and print multiple shipping labels at once with our new bulk shipping feature. Save time and streamline your operations.',
    timestamp: '2025-01-13T10:00:00Z',
    category: 'feature',
    actions: [
      { label: 'Try Feature', action: 'navigate', url: '/create-shipment' },
      { label: 'Learn More', action: 'view' }
    ]
  },
  {
    id: 'notif-006',
    type: 'shipment',
    priority: 'low',
    status: 'read',
    title: 'Shipment Scanned at Facility',
    message: 'Package ASH-20250101-GHI789 has been scanned and is now in transit to your destination.',
    timestamp: '2025-01-13T14:20:00Z',
    category: 'tracking',
    relatedId: 'ASH-20250101-GHI789',
    actions: [
      { label: 'Track Package', action: 'navigate', url: '/shipments?tracking=ASH-20250101-GHI789' },
      { label: 'Dismiss', action: 'dismiss' }
    ]
  }
];

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedCategory, setSelectedCategory] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesCategory = selectedCategory === 'all' || notification.type === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
    
    return matchesCategory && matchesPriority && matchesStatus;
  });

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups: Record<string, Notification[]>, notification) => {
    const notificationDate = new Date(notification.timestamp);
    const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (notificationDay.getTime() === today.getTime()) {
      groups['Today'] = [...groups['Today'], notification];
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      groups['Yesterday'] = [...groups['Yesterday'], notification];
    } else if (notificationDate >= weekAgo) {
      groups['This Week'] = [...groups['This Week'], notification];
    } else {
      groups['Earlier'] = [...groups['Earlier'], notification];
    }
    return groups;
  }, { 'Today': [], 'Yesterday': [], 'This Week': [], 'Earlier': [] });

  // Handle notification actions
  const handleNotificationAction = (notificationId: string, action: string, url?: string) => {
    if (action === 'mark-read') {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n
      ));
    } else if (action === 'dismiss') {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } else if (action === 'navigate' && url) {
      // router.push(url); // Removed as per edit hint
    }
  };

  // Bulk actions
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as NotificationStatus })));
    setSelectedItems([]);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setSelectedItems([]);
  };

  const handleItemSelection = (notificationId: string) => {
    setSelectedItems(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'shipment': return 'Package';
      case 'system': return 'Settings';
      case 'billing': return 'CreditCard';
      case 'announcement': return 'Megaphone';
      default: return 'Bell';
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div 
      id="parcego-notifications-center-container"
    >
      {/* Page Header */}
      <PageHeader
        title="Notifications Center"
        description="Stay updated with your courier platform activities"
      >
        <div className="flex items-center space-x-3">
          <Badge 
            variant="secondary" 
            className="text-sm"
            id="parcego-notifications-count-badge"
          >
            {unreadCount} unread
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            id="parcego-notifications-mark-all-btn"
          >
            Mark All as Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            id="parcego-notifications-clear-all-btn"
          >
            Clear All
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">


                  {/* Filter Tabs */}
                  <Tabs 
                    value={selectedCategory} 
                    onValueChange={(value) => setSelectedCategory(value as NotificationType | 'all')}
                    className="w-full parcego-tabs-enhanced"
                    id="parcego-notifications-category-tabs"
                  >
                    <TabsList 
                      className="flex w-full h-9 sm:h-10 p-1 bg-gray-100 rounded-lg overflow-hidden justify-between"
                      style={{ padding: '1.68rem .75rem' }}
                    >
                      <TabsTrigger 
                        value="all" 
                        className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger 
                        value="shipment" 
                        className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
                      >
                        Shipments
                      </TabsTrigger>
                      <TabsTrigger 
                        value="system" 
                        className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
                      >
                        System
                      </TabsTrigger>
                      <TabsTrigger 
                        value="billing" 
                        className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
                      >
                        Billing
                      </TabsTrigger>
                      <TabsTrigger 
                        value="announcement" 
                        className="flex-1 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md"
                      >
                        Announcements
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Additional Filters */}
                  <div className="flex flex-wrap gap-4">
                    <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as NotificationPriority | 'all')}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'all' | 'unread' | 'read')}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <div id="parcego-notifications-list">
              {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => {
                if (groupNotifications.length === 0) return null;
                
                return (
                  <Card key={groupName} className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-gray-700">
                        {groupName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              notification.status === 'unread' 
                                ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                                : 'bg-white border-gray-200'
                            }`}
                            id={`parcego-notifications-item-${notification.id}`}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Checkbox for bulk selection */}
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(notification.id)}
                                onChange={() => handleItemSelection(notification.id)}
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              
                              {/* Type Icon */}
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Icon 
                                    name={getTypeIcon(notification.type)} 
                                    size={16} 
                                    className="text-gray-600" 
                                  />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className={`font-medium ${
                                        notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {notification.title}
                                      </h3>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                                      >
                                        {notification.priority}
                                      </Badge>
                                      {notification.status === 'unread' && (
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                    <p className={`text-sm ${
                                      notification.status === 'unread' ? 'text-gray-700' : 'text-gray-600'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                {/* Actions */}
                                {notification.actions && (
                                  <div className="flex items-center space-x-2 mt-3">
                                    {notification.actions.map((action, index) => (
                                      <Button
                                        key={index}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleNotificationAction(notification.id, action.action, action.url)}
                                        className="text-xs h-7 px-2"
                                        id={`parcego-notifications-item-${action.action}-${notification.id}`}
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Empty State */}
              {filteredNotifications.length === 0 && (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <div id="parcego-notifications-empty-state">
                      <Icon name="Bell" size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                          ? 'No notifications found'
                          : 'No notifications yet'
                        }
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                          ? 'Try adjusting your filters to find what you\'re looking for.'
                          : 'You\'ll see notifications here when you have shipment updates, system alerts, or important announcements.'
                        }
                      </p>
                      {(selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedPriority('all');
                            setSelectedStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unread</span>
                  <Badge variant="secondary">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today</span>
                  <Badge variant="outline">
                    {notifications.filter(n => {
                      const today = new Date();
                      const notificationDate = new Date(n.timestamp);
                      return notificationDate.toDateString() === today.toDateString();
                    }).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <Badge variant="outline">
                    {notifications.filter(n => {
                      const now = new Date();
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      const notificationDate = new Date(n.timestamp);
                      return notificationDate >= weekAgo;
                    }).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="text-sm">
                      <p className="font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
