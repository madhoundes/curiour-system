"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Period = "today" | "weekly" | "monthly" | "last7" | "last30" | "last90" | "custom";

const mockPerformanceData = {
  courier: {
    name: "Ahmed Hassan",
    id: "PCG-C001",
    status: "Active",
    avatarUrl: "",
    joinDate: "2024-01-15",
    totalDeliveries: 847,
    successRate: 98.2,
  },
  today: {
    deliveries: 8,
    completed: 7,
    remaining: 1,
    earnings: 145.5,
    distance: 45.8,
    averageTime: 18,
    onTimeRate: 96.5,
  },
  weekly: {
    deliveries: 42,
    completed: 41,
    remaining: 1,
    earnings: 680.25,
    distance: 215.4,
    averageTime: 19,
    onTimeRate: 96.5,
  },
  monthly: {
    deliveries: 178,
    completed: 172,
    remaining: 6,
    earnings: 2845.75,
    distance: 892.3,
    averageTime: 20,
    onTimeRate: 95.2,
  },
  earningsBreakdown: {
    week: { base: 540.25, payouts: "On Schedule" },
    month: { base: 2280.75, payouts: "Processed" },
  },
};



export default function CourierPerformance() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("today");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    priority: 'high' | 'normal' | 'low';
    status: 'unread' | 'read';
    title: string;
    message: string;
    timestamp: string;
    icon: string;
    category: string;
  }>>([
    {
      id: 'notif-perf-001',
      type: 'system_message',
      priority: 'normal',
      status: 'unread',
      title: 'New weekly performance available',
      message: 'Your weekly performance summary is ready to view.',
      timestamp: new Date().toISOString(),
      icon: 'BarChart3',
      category: 'system'
    },
    {
      id: 'notif-perf-002',
      type: 'package_status',
      priority: 'low',
      status: 'read',
      title: 'Delivery confirmation',
      message: 'PCG789123455 successfully delivered with proof of delivery',
      timestamp: new Date(Date.now() - 3600_000).toISOString(),
      icon: 'CheckCircle',
      category: 'status'
    }
  ]);

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;

  const handleNotificationClick = () => setIsNotificationModalOpen(true);
  const handleNotificationClose = () => setIsNotificationModalOpen(false);
  const handleNotificationItemClick = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n));
  };
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => n.status === 'unread' ? { ...n, status: 'read' } : n));
  };
  const handleClearAll = () => setNotifications([]);

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };
  const getNotificationIcon = (iconName: string) => iconName;
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
      default:
        return 'text-gray-600';
    }
  };

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("courier_authenticated");
        localStorage.removeItem("courier_email");
        localStorage.removeItem("courier_login_time");
        document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    } catch (_) {}
    router.push("/courier-login");
  };

  const currentData = useMemo(() => {
    switch (selectedPeriod) {
      case "weekly":
        return mockPerformanceData.weekly;
      case "monthly":
        return mockPerformanceData.monthly;
      case "last7":
      case "last30":
      case "last90":
      case "custom":
        // For custom periods, we could implement custom data logic here
        // For now, fall back to today's data
        return mockPerformanceData.today;
      default:
        return mockPerformanceData.today;
    }
  }, [selectedPeriod]);

  const completionPct = useMemo(() => {
    if (!currentData || !("completed" in currentData)) return 0;
    const c = (currentData as { completed?: number; deliveries?: number }).completed ?? 0;
    const d = (currentData as { completed?: number; deliveries?: number }).deliveries ?? 0;
    if (!d) return 0;
    return Math.round((c / d) * 100);
  }, [currentData]);

  return (
    <div
      className="min-h-screen bg-gray-50"
      id="parcego-courier-performance-root"
      style={{ 
        paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))', // Space for fixed bottom nav
        minHeight: '100dvh' // Use dynamic viewport height on mobile
      }}
    >
      {/* Unified Courier Header: Logo left, Notifications + Avatar right */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-3"
        id="parcego-courier-performance-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/Logo/Horizontal-logo.svg"
              alt="Parcego Logo"
              width={120}
              height={24}
              className="h-6 w-auto"
              id="parcego-courier-logo"
              priority
            />
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="parcego-header__notification-btn h-9 w-9 md:h-10 md:w-10 relative"
              id="parcego-courier-notifications-btn"
              onClick={handleNotificationClick}
              aria-label={`Notifications ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} unread)` : ''}`}
            >
              <Icon name="Bell" size={18} className="md:w-5 md:h-5" />
              {unreadNotificationsCount > 0 && (
                <div 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] parcego-notification-badge"
                  id="parcego-courier-notification-badge"
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </div>
              )}
            </Button>
            
            {/* Profile Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="parcego-header__profile-btn h-9 w-9 md:h-10 md:w-10 rounded-full"
                  id="parcego-courier-profile-menu-btn"
                  aria-label="Profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockPerformanceData.courier.avatarUrl} alt={mockPerformanceData.courier.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                      AH
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{mockPerformanceData.courier.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {mockPerformanceData.courier.id}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push('/courier/profile')}
                  className="cursor-pointer"
                  id="parcego-courier-profile-menu-item"
                >
                  <Icon name="User" size={16} className="mr-2" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  id="parcego-courier-logout-menu-item"
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Off-Canvas Notification Modal */}
      {isNotificationModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-[200] transition-opacity duration-300 ease-out"
            id="parcego-courier-notification-backdrop"
            onClick={handleNotificationClose}
            aria-hidden="true"
          />
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[201] transform transition-transform duration-300 ease-out animate-in slide-in-from-left flex flex-col"
            id="parcego-courier-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parcego-notification-modal-title"
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h2 
                className="text-lg font-semibold text-gray-900"
                id="parcego-notification-modal-title"
              >
                Notifications
                {unreadNotificationsCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                id="parcego-courier-notification-close-btn"
                onClick={handleNotificationClose}
                aria-label="Close notifications"
              >
                <Icon name="X" size={18} />
              </Button>
            </div>
            
            {/* Scrollable Content Area with Hidden Scrollbar */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* Internet Explorer 10+ */
                WebkitOverflowScrolling: 'touch', /* iOS smooth scrolling */
              }}
              id="parcego-courier-notification-scroll-area"
            >
              <style jsx>{`
                #parcego-courier-notification-scroll-area::-webkit-scrollbar {
                  display: none; /* Safari and Chrome */
                }
              `}</style>
              
              {notifications.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center p-8 text-center"
                  id="parcego-notification-empty-state"
                >
                  <div className="p-3 bg-gray-100 rounded-full mb-4">
                    <Icon name="Bell" size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-sm text-gray-500">You&apos;re all caught up! New notifications will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                        notification.status === 'unread' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      id={`parcego-notification-item-${notification.id}`}
                      onClick={() => handleNotificationItemClick(notification.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationItemClick(notification.id);
                        }
                      }}
                      aria-label={`Notification: ${notification.title}. ${notification.status === 'unread' ? 'Unread' : 'Read'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          notification.priority === 'high' 
                            ? 'bg-red-100' 
                            : notification.priority === 'normal' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          <Icon 
                            name={getNotificationIcon(notification.icon)} 
                            size={16} 
                            className={getPriorityColor(notification.priority)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className={`text-sm font-medium ${
                              notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            notification.status === 'unread' ? 'text-gray-700' : 'text-gray-500'
                          } line-clamp-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.category === 'assignment' 
                                ? 'bg-orange-100 text-orange-700'
                                : notification.category === 'status'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Fixed Action Buttons at Bottom */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 relative z-[100]">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    id="parcego-courier-mark-all-read-btn"
                    onClick={handleMarkAllRead}
                    disabled={unreadNotificationsCount === 0}
                  >
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Mark All Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    id="parcego-courier-clear-all-btn"
                    onClick={handleClearAll}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="p-4 space-y-8" id="parcego-courier-performance-content">
        {/* Career Progress Banner - Simplified */}
        <Card id="parcego-courier-performance-career" className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 overflow-hidden relative">
          <CardContent className="p-6">
            {/* Simplified header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-600 text-white rounded-full shadow-sm">
                <Icon name="Trophy" size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Career Progress</h3>
                <p className="text-sm text-gray-600">Your journey to excellence</p>
              </div>
            </div>
            
            {/* Essential metrics display only */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Total Deliveries</p>
                <p className="text-3xl font-bold text-blue-700">{mockPerformanceData.courier.totalDeliveries}</p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{mockPerformanceData.courier.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Date Range Selector - Streamlined */}
        <Card id="parcego-courier-performance-period-card" className="parcego-courier-performance__period-card">
          <CardContent className="p-3">
            <div className="space-y-3">
              {/* Simplified Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Select Period</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowDateRange(!showDateRange)}
                >
                  <Icon name={showDateRange ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
                  {showDateRange ? "Hide" : "Show"} Custom
                </Button>
              </div>
              
              {/* Primary Preset Buttons - Always Visible */}
              <div 
                className="flex flex-wrap gap-2" 
                role="tablist" 
                aria-label="Date range presets"
              >
                <Button
                  id="parcego-courier-performance-preset-today"
                  variant={selectedPeriod === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("today");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "today"}
                  className="parcego-courier-performance__preset-btn"
                >
                  Today
                </Button>
                <Button
                  id="parcego-courier-performance-preset-last7"
                  variant={selectedPeriod === "last7" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("last7");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "last7"}
                  className="parcego-courier-performance__preset-btn"
                >
                  Last 7 days
                </Button>
                <Button
                  id="parcego-courier-performance-preset-last30"
                  variant={selectedPeriod === "last30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("last30");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "last30"}
                  className="parcego-courier-performance__preset-btn"
                >
                  Last 30 days
                </Button>
                <Button
                  id="parcego-courier-performance-preset-custom"
                  variant={selectedPeriod === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("custom");
                    setShowDateRange(true);
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "custom"}
                  className="parcego-courier-performance__preset-btn"
                >
                  <Icon name="Calendar" size={14} className="mr-1" />
                  Custom Range
                </Button>
              </div>

              {/* Custom Date Range - Collapsible */}
              {showDateRange && selectedPeriod === "custom" && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label htmlFor="parcego-courier-performance-from" className="block text-sm font-medium text-gray-700 mb-1">
                          From Date
                        </label>
                        <Input
                          id="parcego-courier-performance-from"
                          type="date"
                          value={fromDate}
                          onChange={(e) => {
                            setFromDate(e.target.value);
                            setSelectedPeriod("custom");
                          }}
                          aria-label="From date"
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="parcego-courier-performance-to" className="block text-sm font-medium text-gray-700 mb-1">
                          To Date
                        </label>
                        <Input
                          id="parcego-courier-performance-to"
                          type="date"
                          value={toDate}
                          onChange={(e) => {
                            setToDate(e.target.value);
                            setSelectedPeriod("custom");
                          }}
                          aria-label="To date"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    {/* Validation Error */}
                    {fromDate && toDate && fromDate > toDate && (
                      <p className="text-sm text-red-600" id="parcego-courier-performance-date-error">
                        Start date must be before end date
                      </p>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex justify-between items-center">
                      <Button
                        id="parcego-courier-performance-clear-custom"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFromDate("");
                          setToDate("");
                          setSelectedPeriod("today");
                          setShowDateRange(false);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Icon name="X" size={14} className="mr-1" />
                        Clear & Reset
                      </Button>
                      <div className="text-xs text-gray-500">
                        {fromDate && toDate ? `${fromDate} to ${toDate}` : 'Select both dates'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-blue-200 to-transparent flex-1"></div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="rounded-md bg-blue-100 p-1.5">
              <Icon name="BarChart3" size={16} className="text-blue-600" />
            </div>
            Performance Metrics
          </h2>
          <div className="h-px bg-gradient-to-l from-blue-200 to-transparent flex-1"></div>
        </div>

        {/* Delivery Performance Group */}
        <div className="rounded-xl border border-gray-100 bg-white/50 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <div className="rounded-md bg-blue-100 p-1">
              <Icon name="Package" size={14} className="text-blue-600" />
            </div>
            Delivery Performance
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card id="parcego-courier-performance-metric-deliveries" className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-md bg-blue-100 p-1.5">
                      <Icon name="Package" size={16} className="text-blue-600" />
                    </div>
                    <span>Total Deliveries</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{selectedPeriod === "monthly" ? "Monthly" : selectedPeriod === "weekly" ? "Weekly" : "Today"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-foreground">{currentData.deliveries}</p>
                  <span className="ml-2 text-sm text-muted-foreground">deliveries</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Icon name="Target" size={12} className="mr-1 opacity-70" />
                  <span>{currentData.remaining} remaining</span>
                </p>
              </CardContent>
            </Card>

            <Card id="parcego-courier-performance-metric-completion" className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-md bg-green-100 p-1.5">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                    </div>
                    <span>Completed</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{completionPct}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-foreground">{currentData.completed}</p>
                  <span className="ml-2 text-sm text-muted-foreground">completed</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full" aria-label="completion progress">
                  <div
                    className="h-2 bg-green-600 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                    id="parcego-courier-performance-completion-bar"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Performance Group */}
        <div className="rounded-xl border border-gray-100 bg-white/50 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <div className="rounded-md bg-green-100 p-1">
              <Icon name="DollarSign" size={14} className="text-green-600" />
            </div>
            Financial Summary
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card id="parcego-courier-performance-metric-earnings" className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-md bg-green-100 p-1.5">
                      <Icon name="DollarSign" size={16} className="text-green-600" />
                    </div>
                    <span>Earnings</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">{selectedPeriod === "monthly" ? "Monthly" : selectedPeriod === "weekly" ? "Weekly" : "Today"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-foreground">${currentData.earnings.toFixed(2)}</p>
                  <span className="ml-2 text-sm text-muted-foreground">earned</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Icon name="TrendingUp" size={12} className="mr-1 opacity-70" />
                  <span>{selectedPeriod === "today" ? "+$12.50 from yesterday" : "On track"}</span>
                </p>
              </CardContent>
            </Card>

            <Card id="parcego-courier-performance-metric-efficiency" className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-md bg-purple-100 p-1.5">
                      <Icon name="TrendingUp" size={16} className="text-purple-600" />
                    </div>
                    <span>Efficiency</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">On-time</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-foreground">{currentData.onTimeRate}%</p>
                  <span className="ml-2 text-sm text-muted-foreground">on-time</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Icon name="Target" size={12} className="mr-1 opacity-70" />
                  <span>Target: 90%</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-green-200 to-transparent flex-1"></div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="rounded-md bg-green-100 p-1.5">
              <Icon name="DollarSign" size={16} className="text-green-600" />
            </div>
            Financial Details
          </h2>
          <div className="h-px bg-gradient-to-l from-green-200 to-transparent flex-1"></div>
        </div>

        {/* Earnings Breakdown - Enhanced */}
        <Card id="parcego-courier-performance-metric-earnings-detailed" className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-md bg-green-100 p-1.5">
                  <Icon name="DollarSign" size={16} className="text-green-600" />
                </div>
                <span>Earnings Breakdown</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">{selectedPeriod === "monthly" ? "Monthly" : selectedPeriod === "weekly" ? "Weekly" : "Today"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-foreground">${currentData.earnings.toFixed(2)}</p>
              <span className="ml-2 text-sm text-muted-foreground">total earned</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wider mb-1">Base Pay</p>
                <p className="text-lg font-semibold text-green-800">${(selectedPeriod === "monthly" ? mockPerformanceData.earningsBreakdown.month.base : mockPerformanceData.earningsBreakdown.week.base).toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Payout Status</p>
                <p className="text-lg font-semibold text-blue-800">{selectedPeriod === "monthly" ? mockPerformanceData.earningsBreakdown.month.payouts : mockPerformanceData.earningsBreakdown.week.payouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gradient-to-r from-purple-200 to-transparent flex-1"></div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="rounded-md bg-purple-100 p-1.5">
              <Icon name="Timer" size={16} className="text-purple-600" />
            </div>
            Efficiency Analytics
          </h2>
          <div className="h-px bg-gradient-to-l from-purple-200 to-transparent flex-1"></div>
        </div>

        {/* Efficiency Metrics - Enhanced */}
        <Card id="parcego-courier-performance-metric-efficiency" className="parcego-courier-performance__efficiency-full-width hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-md bg-purple-100 p-1.5">
                <Icon name="Timer" size={16} className="text-purple-600" />
              </div>
              <span>Efficiency Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-blue-50 text-center border border-blue-200">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Average Time</p>
                <p className="text-xl font-bold text-blue-800">{currentData.averageTime} min</p>
                <p className="text-xs text-blue-600 mt-1">per delivery</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 text-center border border-purple-200">
                <p className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2">Distance per Delivery</p>
                <p className="text-xl font-bold text-purple-800">{Math.round((currentData.distance / Math.max(currentData.deliveries, 1)) * 10) / 10} km</p>
                <p className="text-xs text-purple-600 mt-1">average</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 text-center border border-green-200">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wider mb-2">On-time Rate</p>
                <p className="text-xl font-bold text-green-800">{currentData.onTimeRate}%</p>
                <p className="text-xs text-green-600 mt-1">target: 90%</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Fixed Bottom Navigation - Unified with other courier pages */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg shadow-gray-900/10 z-[100]"
        id="parcego-courier-performance-bottom-nav"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          <button
            onClick={() => router.push('/courier')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-overview-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out">
              <Icon name="Home" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Overview
            </span>
          </button>
          
          <button
            onClick={() => router.push('/courier')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-deliveries-btn"
            type="button"
          >
            <div className="relative transition-all duration-200 ease-out">
              <Icon name="Package" size={20} className="text-current" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {currentData.remaining}
              </div>
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Deliveries
            </span>
          </button>
          
          <button
            onClick={() => router.push('/courier/performance')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-blue-600 bg-blue-50/80 shadow-sm"
            id="parcego-nav-performance-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out transform scale-110">
              <Icon name="BarChart3" size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-blue-600">
              Performance
            </span>
            <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
          </button>
          
          <button
            onClick={() => router.push('/courier/profile')}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
            id="parcego-nav-profile-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out">
              <Icon name="User" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}