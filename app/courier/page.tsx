"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for courier dashboard
const mockCourierData = {
  name: "Ahmed Hassan",
  id: "PCG-C001",
  avatar: "/avatars/ahmed.jpg",
  stats: {
    deliveriesToday: 8,
    completed: 5,
    remaining: 3,
    earnings: 145.50,
    efficiency: 92,
    onTimeRate: 98
  }
};

const mockDeliveries = [
  {
    id: "PCG-DEL-001",
    trackingNumber: "PCG789123456",
    customerName: "Sarah Johnson",
    address: "123 Main Street, Downtown",
    timeWindow: "2:00 PM - 4:00 PM",
    estimatedTime: "2:30 PM",
    status: "ready_for_pickup",
    packageType: "Standard",
    weight: "2.5 kg",
    specialInstructions: "Call upon arrival",
    priority: "high"
  },
  {
    id: "PCG-DEL-002",
    trackingNumber: "PCG789123457",
    customerName: "Mike Chen",
    address: "456 Oak Avenue, Suburbs",
    timeWindow: "3:00 PM - 5:00 PM",
    estimatedTime: "3:15 PM",
    status: "in_transit",
    packageType: "Fragile",
    weight: "1.2 kg",
    specialInstructions: "Handle with care - electronics",
    priority: "medium"
  },
  {
    id: "PCG-DEL-003",
    trackingNumber: "PCG789123458",
    customerName: "Lisa Brown",
    address: "789 Pine Road, Uptown",
    timeWindow: "4:00 PM - 6:00 PM",
    estimatedTime: "4:45 PM",
    status: "assigned",
    packageType: "Documents",
    weight: "0.3 kg",
    specialInstructions: "Signature required",
    priority: "low"
  }
];

// Mock notification data
const mockNotifications = [
  {
    id: "notif-001",
    type: "delivery_assignment",
    priority: "high",
    status: "unread",
    title: "New Delivery Assigned",
    message: "Package PCG789123459 assigned for delivery to Downtown area",
    timestamp: "2025-01-15T14:30:00Z",
    icon: "Package",
    category: "assignment"
  },
  {
    id: "notif-002", 
    type: "package_status",
    priority: "normal",
    status: "unread",
    title: "Package Scanned Successfully",
    message: "PCG789123456 scanned at pickup location - ready for transit",
    timestamp: "2025-01-15T13:45:00Z",
    icon: "CheckCircle",
    category: "status"
  },
  {
    id: "notif-003",
    type: "system_message",
    priority: "normal", 
    status: "read",
    title: "Route Optimization Complete",
    message: "Your delivery route has been optimized for maximum efficiency",
    timestamp: "2025-01-15T12:15:00Z",
    icon: "Route",
    category: "system"
  },
  {
    id: "notif-004",
    type: "delivery_assignment",
    priority: "high",
    status: "read",
    title: "Urgent Delivery Added",
    message: "High-priority package PCG789123460 added to your route",
    timestamp: "2025-01-15T11:30:00Z", 
    icon: "AlertTriangle",
    category: "assignment"
  },
  {
    id: "notif-005",
    type: "package_status",
    priority: "low",
    status: "read",
    title: "Delivery Confirmation",
    message: "PCG789123455 successfully delivered with proof of delivery",
    timestamp: "2025-01-15T10:45:00Z",
    icon: "CircleCheck",
    category: "status"
  },
  {
    id: "notif-006",
    type: "system_message",
    priority: "normal",
    status: "read", 
    title: "Platform Maintenance Scheduled",
    message: "System maintenance scheduled for tonight 11 PM - 1 AM EST",
    timestamp: "2025-01-15T09:00:00Z",
    icon: "Settings",
    category: "system"
  }
];


const getStatusColor = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "bg-blue-600";
    case "in_transit":
      return "bg-amber-600";
    case "delivered":
      return "bg-emerald-600";
    case "assigned":
      return "bg-slate-600";
    default:
      return "bg-slate-600";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "Ready for Pickup";
    case "in_transit":
      return "In Transit";
    case "delivered":
      return "Delivered";
    case "assigned":
      return "Assigned";
    default:
      return "Unknown";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-600";
    case "medium":
      return "bg-amber-600";
    case "low":
      return "bg-emerald-600";
    default:
      return "bg-slate-600";
  }
};

// Client-only wrapper to prevent hydration mismatches
const ClientOnlyCourierDashboard = dynamic(() => Promise.resolve(CourierDashboard), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
});

function CourierDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  // Notification state management
  const [notifications, setNotifications] = useState(mockNotifications);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      // Only run on client side to prevent hydration mismatch
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Add debugging for HTTPS context
      console.log('🔍 Courier Dashboard - Checking authentication...');
      console.log('🔍 Current protocol:', window.location.protocol);
      console.log('🔍 Current host:', window.location.host);
      console.log('🔍 Is secure context:', window.isSecureContext);

      try {
        const authenticated = localStorage.getItem("courier_authenticated");
        const loginTime = localStorage.getItem("courier_login_time");
        
        console.log('🔍 Authentication status:', authenticated);
        console.log('🔍 Login time:', loginTime);
        
        // Check if authentication exists and is not expired (24 hours)
        if (authenticated === "true" && loginTime) {
          const timeSinceLogin = Date.now() - parseInt(loginTime);
          const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          console.log('🔍 Time since login:', timeSinceLogin, 'ms');
          
          if (timeSinceLogin < twentyFourHours) {
            console.log('✅ Authentication valid, setting authenticated to true');
            setIsAuthenticated(true);
          } else {
            console.log('⏰ Session expired, clearing storage and redirecting');
            // Session expired, clear storage and redirect
            localStorage.removeItem("courier_authenticated");
            localStorage.removeItem("courier_email");
            localStorage.removeItem("courier_login_time");
            document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            router.push("/courier-login");
          }
        } else {
          console.log('❌ No authentication found, redirecting to login');
          // No authentication found, redirect to login
          router.push("/courier-login");
        }
      } catch (error) {
        console.error('❌ Error during authentication check:', error);
        // If there's an error, redirect to login for safety
        router.push("/courier-login");
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, [router]);

  // Keyboard support for notification modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isNotificationModalOpen) {
        handleNotificationClose();
      }
    };

    if (isNotificationModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isNotificationModalOpen]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading Courier Dashboard...</p>
          <p className="text-xs text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="AlertCircle" size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the courier dashboard.</p>
          <Button 
            onClick={() => router.push("/courier-login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleScanPackage = (deliveryId: string) => {
    // Development mode: Skip modal and treat as successful scan
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧪 Development: Bypassing scan modal for delivery ${deliveryId}`);
      
      // Simulate immediate successful scan and progress to next step
      const delivery = mockDeliveries.find(d => d.id === deliveryId);
      if (delivery) {
        // Progress based on current status
        if (delivery.status === "ready_for_pickup") {
          // Skip to route planning
          router.push(`/courier/route/${deliveryId}`);
        } else if (delivery.status === "in_transit") {
          // Skip to proof of delivery
          router.push(`/courier/proof/${deliveryId}`);
        } else {
          // Default to scan page
          router.push(`/courier/scan/${deliveryId}`);
        }
        return;
      }
    }
    
    // Production mode: Navigate to scan page
    router.push(`/courier/scan/${deliveryId}`);
  };

  const handleStartRoute = (deliveryId: string) => {
    router.push(`/courier/route/${deliveryId}`);
  };

  const handleMarkDelivered = (deliveryId: string) => {
    router.push(`/courier/proof/${deliveryId}`);
  };


  const handleLogout = () => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') return;

    // Clear all authentication data
    localStorage.removeItem("courier_authenticated");
    localStorage.removeItem("courier_email");
    localStorage.removeItem("courier_login_time");
    
    // Clear authentication cookie with proper attributes
    document.cookie = "courier_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    
    // Reset authentication state
    setIsAuthenticated(false);
    
    // Redirect to login page
    router.push("/courier-login");
  };

  // Notification functions
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotificationModalOpen(false);
  };

  const handleNotificationItemClick = (notificationId: string) => {
    // Mark notification as read
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.status === 'unread' 
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
    console.log('All notifications marked as read');
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    console.log('All notifications cleared');
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (iconName: string) => {
    return iconName;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "normal":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const unreadNotificationsCount = notifications.filter(n => n.status === 'unread').length;


  return (
    <div 
      className="min-h-screen bg-gray-50 pb-24 md:pb-28"
      id="parcego-courier-dashboard-container"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      {/* Enhanced Courier Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-3"
        id="parcego-courier-header"
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
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                      {mockCourierData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{mockCourierData.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {mockCourierData.id}
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

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Greeting & Progress Banner */}
        <Card 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow"
          id="parcego-courier-greeting-banner"
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Icon name="Sun" size={20} className="md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-1">
                  Good Morning, {mockCourierData.name.split(' ')[0]}!
                </h3>
                <p className="text-sm md:text-base text-blue-700">
                  You have {mockCourierData.stats.remaining} deliveries remaining today. 
                  {mockCourierData.stats.completed > 0 ? ` Great job completing ${mockCourierData.stats.completed} deliveries!` : ' Ready to start your deliveries!'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl md:text-2xl font-bold text-blue-900">{mockCourierData.stats.completed}/{mockCourierData.stats.deliveriesToday}</p>
                <p className="text-xs md:text-sm text-blue-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>




        {/* Main Content */}
        <div 
          className="space-y-4"
          id="parcego-courier-main-content"
        >
          {/* Overview Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">

              {/* Delivery Progress Card */}
              <Card className="border-l-4 border-l-emerald-500 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontWeight: 700 }}>
                      Delivery Progress
                    </h3>
                    <span className="text-2xl font-bold text-gray-900" style={{ fontWeight: 700 }}>
                      {Math.round((mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar with Gradient */}
                  <div className="relative w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.round((mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100)}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)',
                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600" style={{ fontWeight: 700 }}>
                    Next: {mockDeliveries[0]?.customerName} - {mockDeliveries[0]?.address}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-blue-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Package" size={20} className="text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockCourierData.stats.completed}</p>
                    <p className="text-sm text-gray-500">Completed Today</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <Icon name="CheckCircle" size={12} className="mr-1 inline" />
                      {Math.round((mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100)}% of total
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-orange-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-orange-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockCourierData.stats.remaining}</p>
                    <p className="text-sm text-gray-500">Remaining Today</p>
                    <div className="mt-2 text-xs text-orange-600">
                      <Icon name="Target" size={12} className="mr-1 inline" />
                      Ready to deliver
                    </div>
                  </CardContent>
                </Card>
              </div>


              {/* Quick Tips */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg mt-1">
                      <Icon name="Lightbulb" size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Today&apos;s Tip</h4>
                      <p className="text-sm text-amber-800">
                        Remember to scan packages before pickup and take photos for proof of delivery. 
                        This helps maintain accurate tracking and customer satisfaction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Deliveries Content */}
          {activeTab === "deliveries" && (
            <div className="space-y-4">
              <Card 
                className="parcego-deliveries-card"
                id="parcego-courier-deliveries-list"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Today&apos;s Deliveries</CardTitle>
                    <Badge 
                      variant="secondary"
                      className="parcego-badge parcego-badge--remaining"
                      id="parcego-courier-remaining-count"
                    >
                      {mockCourierData.stats.remaining} remaining
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="border rounded-lg p-4 parcego-delivery-card"
                      id={`parcego-delivery-card-${delivery.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 
                              className="font-medium text-gray-900"
                              id={`parcego-delivery-customer-${delivery.id}`}
                            >
                              {delivery.customerName}
                            </h3>
                            <Badge 
                              className={`text-xs ${getStatusColor(delivery.status)} text-white parcego-status-badge`}
                              id={`parcego-delivery-status-${delivery.id}`}
                            >
                              {getStatusText(delivery.status)}
                            </Badge>
                            <Badge 
                              className={`text-xs ${getPriorityColor(delivery.priority)} text-white`}
                              variant="secondary"
                            >
                              {delivery.priority}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <p 
                              className="text-sm text-gray-600 flex items-center"
                              id={`parcego-delivery-address-${delivery.id}`}
                            >
                              <Icon name="MapPin" size={16} className="mr-2 text-gray-400" />
                              {delivery.address}
                            </p>
                            <p 
                              className="text-sm text-gray-500 flex items-center"
                              id={`parcego-delivery-time-${delivery.id}`}
                            >
                              <Icon name="Clock" size={16} className="mr-2 text-gray-400" />
                              {delivery.timeWindow} (Est: {delivery.estimatedTime})
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Icon name="Package" size={12} className="mr-1" />
                                {delivery.packageType}
                              </span>
                              <span className="flex items-center">
                                <Icon name="Scale" size={12} className="mr-1" />
                                {delivery.weight}
                              </span>
                            </div>
                          </div>
                          {delivery.specialInstructions && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                              <p 
                                className="text-xs text-blue-700 flex items-center"
                                id={`parcego-delivery-instructions-${delivery.id}`}
                              >
                                <Icon name="AlertCircle" size={12} className="mr-2" />
                                <span className="font-medium">Special Instructions:</span> {delivery.specialInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Status Timeline Indicator */}
                        <div className="ml-4 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`}></div>
                          </div>
                          <p className="text-xs text-gray-500 text-center">Status</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex space-x-2">
                        {delivery.status === "ready_for_pickup" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScanPackage(delivery.id)}
                              className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--scan hover:bg-blue-50 hover:border-blue-300"
                              id={`parcego-scan-btn-${delivery.id}`}
                            >
                              <Icon name="Camera" size={16} className="mr-2" />
                              Scan Package
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartRoute(delivery.id)}
                              className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--route bg-blue-600 hover:bg-blue-700"
                              id={`parcego-route-btn-${delivery.id}`}
                            >
                              <Icon name="Route" size={16} className="mr-2" />
                              Start Route
                            </Button>
                          </>
                        )}
                        
                        {delivery.status === "in_transit" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkDelivered(delivery.id)}
                            className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--delivered bg-green-600 hover:bg-green-700"
                            id={`parcego-delivered-btn-${delivery.id}`}
                          >
                            <Icon name="CheckCircle" size={16} className="mr-2" />
                            Mark as Delivered
                          </Button>
                        )}
                        
                        {delivery.status === "assigned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--waiting text-gray-400"
                            id={`parcego-waiting-btn-${delivery.id}`}
                          >
                            <Icon name="Clock" size={16} className="mr-2" />
                            Waiting for Pickup
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Content */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={20} className="text-blue-600" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics and insights are available in the dedicated Performance page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Icon name="BarChart3" size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">View Your Performance</h3>
                    <p className="text-gray-600 mb-6">
                      Access comprehensive analytics including delivery completion rates, 
                      earnings breakdown, efficiency metrics, and career progress.
                    </p>
                    <Button 
                      onClick={() => router.push('/courier/performance')}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Icon name="ArrowRight" size={16} className="mr-2" />
                      Go to Performance Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Native-Style Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg shadow-gray-900/10 z-[100]"
        id="parcego-courier-bottom-nav"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--overview group
              ${activeTab === "overview" 
                ? "bg-blue-100/80 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
              }
            `}
            id="parcego-nav-overview-btn"
            type="button"
          >
            <div className={`
              transition-all duration-200 ease-out
              ${activeTab === "overview" ? "transform scale-110" : "group-active:scale-95"}
            `}>
              <Icon 
                name="Home" 
                size={20} 
                className={`
                  ${activeTab === "overview" ? "text-blue-600" : "text-current"}
                `} 
              />
            </div>
            <span className={`
              text-xs font-medium mt-1 transition-all duration-200 ease-out
              ${activeTab === "overview" ? "text-blue-600" : "text-current"}
            `}>
              Overview
            </span>
            {activeTab === "overview" && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--deliveries group
              ${activeTab === "deliveries" 
                ? "bg-blue-100/80 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
              }
            `}
            id="parcego-nav-deliveries-btn"
            type="button"
          >
            <div className={`
              relative transition-all duration-200 ease-out
              ${activeTab === "deliveries" ? "transform scale-110" : "group-active:scale-95"}
            `}>
              <Icon 
                name="Package" 
                size={20} 
                className={`
                  ${activeTab === "deliveries" ? "text-blue-600" : "text-current"}
                `} 
              />
              {/* Delivery count badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {mockCourierData.stats.remaining}
              </div>
            </div>
            <span className={`
              text-xs font-medium mt-1 transition-all duration-200 ease-out
              ${activeTab === "deliveries" ? "text-blue-600" : "text-current"}
            `}>
              Deliveries
            </span>
            {activeTab === "deliveries" && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("performance")}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--performance group
              ${activeTab === "performance" 
                ? "bg-blue-100/80 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95"
              }
            `}
            id="parcego-nav-performance-btn"
            type="button"
          >
            <div className={`
              transition-all duration-200 ease-out
              ${activeTab === "performance" ? "transform scale-110" : "group-active:scale-95"}
            `}>
              <Icon 
                name="BarChart3" 
                size={20} 
                className={`
                  ${activeTab === "performance" ? "text-blue-600" : "text-current"}
                `} 
              />
            </div>
            <span className={`
              text-xs font-medium mt-1 transition-all duration-200 ease-out
              ${activeTab === "performance" ? "text-blue-600" : "text-current"}
            `}>
              Performance
            </span>
            {activeTab === "performance" && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => router.push('/courier/profile')}
            className={`
              flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200 ease-out
              parcego-nav-btn parcego-nav-btn--profile group
              text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-200/50 active:scale-95
            `}
            id="parcego-nav-profile-btn"
            type="button"
          >
            <div className="transition-all duration-200 ease-out group-active:scale-95">
              <Icon name="User" size={20} className="text-current" />
            </div>
            <span className="text-xs font-medium mt-1 transition-all duration-200 ease-out text-current">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Off-Canvas Notification Modal */}
      {isNotificationModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[200] transition-opacity duration-300 ease-out"
            id="parcego-courier-notification-backdrop"
            onClick={handleNotificationClose}
            aria-hidden="true"
          />
          
          {/* Off-Canvas Modal */}
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[201] transform transition-transform duration-300 ease-out animate-in slide-in-from-left"
            id="parcego-courier-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="parcego-notification-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
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

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                /* Empty State */
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
                /* Notification List */
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
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
                        {/* Notification Icon */}
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
                        
                        {/* Notification Content */}
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

            {/* Modal Footer - Action Buttons */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white">
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
    </div>
  );
}

export default ClientOnlyCourierDashboard;