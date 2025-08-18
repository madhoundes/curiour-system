"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for dashboard
const mockStats = {
  totalShipments: 127,
  activeShipments: 23,
  deliveredToday: 8,
  revenue: 2450
};

const mockRecentShipments = [
  {
    id: "SH001",
    recipient: "John Smith",
    destination: "New York, NY",
    status: "delivered",
    date: "2024-01-15",
    amount: "$24.50"
  },
  {
    id: "SH002",
    recipient: "Sarah Johnson",
    destination: "Los Angeles, CA", 
    status: "in_transit",
    date: "2024-01-15",
    amount: "$18.75"
  },
  {
    id: "SH003",
    recipient: "Mike Wilson",
    destination: "Chicago, IL",
    status: "pending",
    date: "2024-01-14",
    amount: "$31.20"
  },
  {
    id: "SH004",
    recipient: "Emma Davis",
    destination: "Houston, TX",
    status: "delivered",
    date: "2024-01-14",
    amount: "$22.90"
  }
];

const mockNotifications = [
  {
    id: "1",
    message: "Shipment SH002 is out for delivery",
    time: "2 hours ago",
    type: "info" as const,
    isRead: false
  },
  {
    id: "2",
    message: "Payment received for shipment SH001",
    time: "4 hours ago", 
    type: "success" as const,
    isRead: false
  },
  {
    id: "3",
    message: "New feature: Bulk shipping labels now available",
    time: "1 day ago",
    type: "announcement" as const,
    isRead: true
  },
  {
    id: "4",
    message: "System maintenance scheduled for tonight",
    time: "3 hours ago",
    type: "warning" as const,
    isRead: false
  },
  {
    id: "5",
    message: "Failed to process payment for shipment SH003",
    time: "5 hours ago",
    type: "error" as const,
    isRead: false
  }
];

// Quick Quote form data and calculation logic
const packageSizes = [
  { value: "small", label: "Small (12x8x4 in)", basePrice: 8.99 },
  { value: "medium", label: "Medium (16x12x8 in)", basePrice: 12.99 },
  { value: "large", label: "Large (20x16x12 in)", basePrice: 18.99 },
  { value: "xlarge", label: "Extra Large (24x20x16 in)", basePrice: 24.99 }
];

const calculateShippingPrice = (size: string, weight: number, postalCode: string): number => {
  // Base price from package size
  const sizeData = packageSizes.find(s => s.value === size);
  if (!sizeData) return 0;
  
  let basePrice = sizeData.basePrice;
  
  // Weight factor (additional cost per pound over 5 lbs)
  if (weight > 5) {
    basePrice += (weight - 5) * 1.50;
  }
  
  // Distance factor based on postal code (simplified)
  const firstDigit = parseInt(postalCode.charAt(0));
  let distanceMultiplier = 1.0;
  
  if (firstDigit >= 0 && firstDigit <= 3) {
    distanceMultiplier = 1.0; // Local
  } else if (firstDigit >= 4 && firstDigit <= 6) {
    distanceMultiplier = 1.15; // Regional
  } else if (firstDigit >= 7 && firstDigit <= 9) {
    distanceMultiplier = 1.35; // National
  }
  
  return Math.round((basePrice * distanceMultiplier) * 100) / 100;
};

export default function MerchantDashboard() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  // Quick Quote state
  const [quoteForm, setQuoteForm] = useState({
    packageSize: "",
    weight: "",
    postalCode: ""
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleTrackPackage = () => {
    if (!trackingNumber) return;
    setIsTracking(true);
    setTimeout(() => {
      setIsTracking(false);
      router.push(`/track-package?tracking=${encodeURIComponent(trackingNumber)}`);
    }, 500);
  };

  const handleQuoteFormChange = (field: string, value: string) => {
    setQuoteForm(prev => ({ ...prev, [field]: value }));
    // Reset calculated price when form changes
    setCalculatedPrice(null);
  };

  const handleGeneratePrice = () => {
    if (!quoteForm.packageSize || !quoteForm.weight || !quoteForm.postalCode) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const weight = parseFloat(quoteForm.weight);
      const price = calculateShippingPrice(quoteForm.packageSize, weight, quoteForm.postalCode);
      setCalculatedPrice(price);
      setIsCalculating(false);
    }, 800);
  };

  const resetQuoteForm = () => {
    setQuoteForm({ packageSize: "", weight: "", postalCode: "" });
    setCalculatedPrice(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: "bg-green-100 text-green-800", icon: <Icon name="CircleCheck" size={12} className="mr-1" /> },
      in_transit: { color: "bg-blue-100 text-blue-800", icon: <Icon name="Clock" size={12} className="mr-1" /> },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: <Icon name="CircleAlert" size={12} className="mr-1" /> },
      failed: { color: "bg-red-100 text-red-800", icon: <Icon name="CircleX" size={12} className="mr-1" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo width={140} height={30} />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/claims')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Icon name="Shield" size={16} />
                <span className="text-sm font-medium">Claims</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/support')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Icon name="help-circle" size={16} />
                <span className="text-sm font-medium">Help & Support</span>
              </Button>
              <NotificationDropdown 
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
              />
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="bg-blue-600 rounded-full p-2">
                    <Icon name="User" size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">John Merchant</span>
                </Button>
                
                {/* Dropdown Menu (Mock) */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                  <div className="py-1">
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Icon name="Settings" size={16} className="mr-3" />
                      Account Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Icon name="LogOut" size={16} className="mr-3" />
                      Sign Out
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your shipments today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <Icon name="Package" size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                  <Icon name="Clock" size={24} className="text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.activeShipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-3 mr-4">
                  <Icon name="CircleCheck" size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered Today</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.deliveredToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3 mr-4">
                  <Icon name="BarChart3" size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${mockStats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Separated into its own row section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your most common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {/* Quick Quote Widget - Prominent placement */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="h-16 flex flex-col space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    id="parcego-dashboard-quick-quote-btn"
                  >
                    <Icon name="Calculator" size={24} />
                    <span>Quick Quote</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Icon name="Calculator" size={20} className="text-blue-600" />
                      <span>Get Instant Shipping Quote</span>
                    </DialogTitle>
                    <DialogDescription>
                      Enter package details to get an instant price estimate
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Package Size Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="parcego-quote-package-size">Package Size</Label>
                      <Select 
                        value={quoteForm.packageSize} 
                        onValueChange={(value) => handleQuoteFormChange('packageSize', value)}
                      >
                        <SelectTrigger id="parcego-quote-package-size">
                          <SelectValue placeholder="Select package size" />
                        </SelectTrigger>
                        <SelectContent>
                          {packageSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Weight Input */}
                    <div className="space-y-2">
                      <Label htmlFor="parcego-quote-weight">Weight (lbs)</Label>
                      <Input
                        id="parcego-quote-weight"
                        type="number"
                        placeholder="Enter weight in pounds"
                        value={quoteForm.weight}
                        onChange={(e) => handleQuoteFormChange('weight', e.target.value)}
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    {/* Postal Code Input */}
                    <div className="space-y-2">
                      <Label htmlFor="parcego-quote-postal-code">Destination Postal Code</Label>
                      <Input
                        id="parcego-quote-postal-code"
                        placeholder="Enter postal code"
                        value={quoteForm.postalCode}
                        onChange={(e) => handleQuoteFormChange('postalCode', e.target.value)}
                        maxLength={10}
                      />
                    </div>

                    {/* Generate Price Button */}
                    <Button 
                      onClick={handleGeneratePrice}
                      disabled={!quoteForm.packageSize || !quoteForm.weight || !quoteForm.postalCode || isCalculating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      id="parcego-quote-generate-price-btn"
                    >
                      {isCalculating ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Icon name="Calculator" size={16} className="mr-2" />
                          Generate Price
                        </>
                      )}
                    </Button>

                    {/* Price Display */}
                    {calculatedPrice && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Estimated Shipping Cost:</span>
                          <span className="text-2xl font-bold text-green-600">${calculatedPrice}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Price includes base rate, weight surcharge, and distance factor
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={resetQuoteForm}
                      className="flex-1"
                      id="parcego-quote-reset-btn"
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={() => router.push('/create-shipment')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      id="parcego-quote-create-shipment-btn"
                    >
                      Create Shipment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/create-shipment')}
                id="parcego-dashboard-create-shipment-btn"
              >
                <Icon name="Plus" size={24} />
                <span>Create New Shipment</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/shipments')}
                id="parcego-dashboard-shipments-history-btn"
                aria-label="Open Shipments History"
              >
                <Icon name="History" size={24} />
                <span>Shipments History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/find-dropoff')}
                id="parcego-dashboard-find-dropoff-btn"
              >
                <Icon name="MapPin" size={24} />
                <span>Find Drop-off Locations</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/analytics')}
                id="parcego-dashboard-analytics-btn"
              >
                <Icon name="BarChart3" size={24} />
                <span>Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/profile')}
                id="parcego-dashboard-profile-btn"
              >
                <Icon name="User" size={24} />
                <span>Account Profile</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/billing')}
                id="parcego-dashboard-billing-btn"
              >
                <Icon name="CreditCard" size={24} />
                <span>Billing & Payments</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/support')}
                id="parcego-dashboard-support-btn"
              >
                <Icon name="help-circle" size={24} />
                <span>Help & Support</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/claims')}
                id="parcego-dashboard-claims-btn"
              >
                <Icon name="Shield" size={24} />
                <span>File a Claim</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pages for Development Preview - New section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pages for Development Preview</CardTitle>
            <CardDescription>Access development and testing pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push('/courier')}
                id="parcego-dashboard-courier-btn"
              >
                <Icon name="Truck" size={24} />
                <span>Courier Dashboard</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push('/admin')}
                id="parcego-dashboard-admin-btn"
              >
                <Icon name="Shield" size={24} />
                <span>Admin Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Shipments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Shipments</CardTitle>
                <CardDescription>Your latest shipping activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentShipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="font-medium text-gray-900">{shipment.id}</span>
                          {getStatusBadge(shipment.status)}
                        </div>
                        <p className="text-sm text-gray-600">{shipment.recipient} • {shipment.destination}</p>
                        <p className="text-xs text-gray-500">{shipment.date} • {shipment.amount}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Icon name="Eye" size={16} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Download" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/shipments')}
                    id="parcego-dashboard-view-all-shipments-btn"
                    aria-label="View all shipments in history"
                  >
                    View All Shipments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Tracking and Notifications */}
          <div className="space-y-6">
            {/* Tracking Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Track Package</CardTitle>
                <CardDescription>Enter tracking number to get status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-tracking-widget-input">Tracking Number</Label>
                  <Input
                    id="parcego-tracking-widget-input"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button 
                  id="parcego-tracking-widget-submit-btn"
                  onClick={handleTrackPackage}
                  disabled={isTracking || !trackingNumber}
                  className="w-full"
                >
                  {isTracking ? "Tracking..." : "Track Package"}
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => router.push('/notifications')}
                  >
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}