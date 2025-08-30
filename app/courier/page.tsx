"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
    onTimeRate: 98,
    customerRating: 4.8
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

const mockQuickActions = [
  {
    id: "scan",
    title: "Scan Package",
    description: "Scan barcode to confirm pickup",
    icon: "Camera",
    color: "bg-blue-500",
    action: "scan"
  },
  {
    id: "route",
    title: "View Route",
    description: "See optimized delivery route",
    icon: "Route",
    color: "bg-green-500",
    action: "route"
  },
  {
    id: "proof",
    title: "Upload Proof",
    description: "Submit delivery confirmation",
    icon: "Camera",
    color: "bg-purple-500",
    action: "proof"
  },
  {
    id: "support",
    title: "Get Help",
    description: "Contact support team",
    icon: "HelpCircle",
    color: "bg-orange-500",
    action: "support"
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

export default function CourierDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const handleScanPackage = (deliveryId: string) => {
    router.push(`/courier/scan/${deliveryId}`);
  };

  const handleStartRoute = (deliveryId: string) => {
    router.push(`/courier/route/${deliveryId}`);
  };

  const handleMarkDelivered = (deliveryId: string) => {
    router.push(`/courier/proof/${deliveryId}`);
  };

  const handleViewPerformance = () => {
    router.push('/courier/performance');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "scan":
        if (mockDeliveries.length > 0) {
          handleScanPackage(mockDeliveries[0].id);
        }
        break;
      case "route":
        router.push('/courier/route');
        break;
      case "proof":
        if (mockDeliveries.length > 1) {
          handleMarkDelivered(mockDeliveries[1].id);
        }
        break;
      case "support":
        router.push('/support');
        break;
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-20"
      id="parcego-courier-dashboard-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-courier-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              className="h-12 w-12"
              id="parcego-courier-avatar"
            >
              <AvatarFallback className="parcego-avatar__fallback text-lg font-semibold">
                {mockCourierData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 
                className="text-xl font-semibold text-gray-900 -mt-4"
                id="parcego-courier-welcome-title"
              >
                Welcome back, {mockCourierData.name}
              </h1>
              <p 
                className="text-sm text-gray-500"
                id="parcego-courier-id-text"
              >
                Courier ID: {mockCourierData.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="parcego-header__notification-btn"
              id="parcego-courier-notifications-btn"
            >
              <Icon name="Bell" size={20} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/courier/profile')}
              id="parcego-courier-profile-btn"
            >
              <Icon name="User" size={16} className="mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats Cards - Featured Section Style */}
        <div 
          className="space-y-4"
          id="parcego-courier-stats-section"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 px-1">Today&apos;s Performance</h2>
            <Badge variant="outline" className="text-xs">
              <Icon name="Calendar" size={12} className="mr-1" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="parcego-stats-card parcego-stats-card--deliveries hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name="Package" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{mockCourierData.stats.deliveriesToday}</p>
                    <p className="text-base font-normal text-gray-500">Total Deliveries</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(mockCourierData.stats.completed / mockCourierData.stats.deliveriesToday) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="parcego-stats-card parcego-stats-card--completed hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{mockCourierData.stats.completed}</p>
                    <p className="text-base font-normal text-gray-500">Completed</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center text-xs text-green-600">
                    <Icon name="TrendingUp" size={12} className="mr-1" />
                    <span>On track</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="parcego-stats-card parcego-stats-card--earnings hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Icon name="DollarSign" size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">${mockCourierData.stats.earnings}</p>
                    <p className="text-base font-normal text-gray-500">Today&apos;s Earnings</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center text-xs text-yellow-600">
                    <Icon name="TrendingUp" size={12} className="mr-1" />
                    <span>+$12.50 from yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="parcego-stats-card parcego-stats-card--efficiency hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Icon name="TrendingUp" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{mockCourierData.stats.efficiency}%</p>
                    <p className="text-base font-normal text-gray-500">Efficiency</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center text-xs text-purple-600">
                    <Icon name="Target" size={12} className="mr-1" />
                    <span>Target: 90%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions - Featured Section Style */}
        <div 
          className="space-y-4"
          id="parcego-courier-quick-actions"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 px-1">Quick Actions</h2>
            <Button variant="ghost" size="sm" className="text-xs">
              <Icon name="Settings" size={14} className="mr-1" />
              Customize
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockQuickActions.map((action) => (
              <Card 
                key={action.id}
                className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer parcego-quick-action-card group"
                id={`parcego-quick-action-${action.id}`}
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon name={action.icon} size={24} className="text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div 
          className="space-y-4"
          id="parcego-courier-main-content"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full parcego-tabs-enhanced">
            <TabsList className="parcego-tabs-list grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="overview" className="parcego-tabs-trigger">Overview</TabsTrigger>
              <TabsTrigger value="deliveries" className="parcego-tabs-trigger">Deliveries</TabsTrigger>
              <TabsTrigger value="performance" className="parcego-tabs-trigger">Performance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Welcome Message */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Icon name="Sun" size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-1">Good Morning, {mockCourierData.name.split(' ')[0]}!</h3>
                      <p className="text-blue-700">
                        You have {mockCourierData.stats.remaining} deliveries remaining today. 
                        {mockCourierData.stats.efficiency >= 90 ? ' Great job maintaining high efficiency!' : ' Keep up the good work!'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">{mockCourierData.stats.efficiency}%</p>
                      <p className="text-sm text-blue-600">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Delivery Action */}
              <Card 
                className="parcego-next-delivery-card hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                id="parcego-courier-next-delivery-action"
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Navigation" size={20} className="text-blue-600" />
                    <span>Ready for Next Delivery?</span>
                  </CardTitle>
                  <CardDescription>
                    Start your next assigned delivery route
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon name="Package" size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Next: {mockDeliveries[0]?.customerName}</p>
                        <p className="text-sm text-gray-500">{mockDeliveries[0]?.address}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          <Icon name="Clock" size={12} className="mr-1 inline" />
                          {mockDeliveries[0]?.timeWindow}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => handleStartRoute(mockDeliveries[0]?.id || '')}
                      id="parcego-courier-next-delivery-btn"
                    >
                      <Icon name="Route" size={16} className="mr-2" />
                      Start Route
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-green-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-green-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Clock" size={20} className="text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockCourierData.stats.onTimeRate}%</p>
                    <p className="text-sm text-gray-500">On-Time Rate</p>
                    <div className="mt-2 text-xs text-green-600">
                      <Icon name="TrendingUp" size={12} className="mr-1 inline" />
                      +2% this week
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-yellow-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-yellow-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="Star" size={20} className="text-yellow-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockCourierData.stats.customerRating}</p>
                    <p className="text-sm text-gray-500">Customer Rating</p>
                    <div className="mt-2 text-xs text-yellow-600">
                      <Icon name="TrendingUp" size={12} className="mr-1 inline" />
                      Excellent feedback
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-purple-500">
                  <CardContent className="p-4 text-center">
                    <div className="p-2 bg-purple-100 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Icon name="TrendingUp" size={20} className="text-purple-600" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{mockCourierData.stats.remaining}</p>
                    <p className="text-sm text-gray-500">Remaining Today</p>
                    <div className="mt-2 text-xs text-purple-600">
                      <Icon name="Target" size={12} className="mr-1 inline" />
                      On track for target
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
            </TabsContent>

            {/* Deliveries Tab */}
            <TabsContent value="deliveries" className="space-y-4 mt-4">
              <Card 
                className="parcego-deliveries-card hover:shadow-md transition-shadow"
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
                      className="border rounded-lg p-4 parcego-delivery-card hover:shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30"
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
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4 mt-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    View your delivery performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Icon name="BarChart3" size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Detailed performance analytics coming soon</p>
                    <Button onClick={handleViewPerformance}>
                      View Full Performance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2"
        id="parcego-courier-bottom-nav"
      >
        <div className="flex justify-around">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--overview"
            id="parcego-nav-overview-btn"
          >
            <Icon name="Home" size={16} />
            <span className="text-xs">Overview</span>
          </Button>
          
          <Button
            variant={activeTab === "deliveries" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("deliveries")}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--deliveries"
            id="parcego-nav-deliveries-btn"
          >
            <Icon name="Package" size={16} />
            <span className="text-xs">Deliveries</span>
          </Button>
          
          <Button
            variant={activeTab === "performance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("performance")}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--performance"
            id="parcego-nav-performance-btn"
          >
            <Icon name="BarChart3" size={16} />
            <span className="text-xs">Performance</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/courier/profile')}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--profile"
            id="parcego-nav-profile-btn"
          >
            <Icon name="User" size={16} />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}