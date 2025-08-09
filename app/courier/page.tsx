"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";

// Mock data for courier dashboard
const mockCourierData = {
  name: "Ahmed Hassan",
  id: "PCG-C001",
  stats: {
    deliveriesToday: 8,
    completed: 5,
    remaining: 3,
    earnings: 145.50,
    rating: 4.8,
    efficiency: 92
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
    priority: "high",
    packageType: "Standard",
    weight: "2.5 kg",
    specialInstructions: "Call upon arrival"
  },
  {
    id: "PCG-DEL-002",
    trackingNumber: "PCG789123457",
    customerName: "Mike Chen",
    address: "456 Oak Avenue, Suburbs",
    timeWindow: "3:00 PM - 5:00 PM",
    estimatedTime: "3:15 PM",
    status: "in_transit",
    priority: "medium",
    packageType: "Fragile",
    weight: "1.2 kg",
    specialInstructions: "Handle with care - electronics"
  },
  {
    id: "PCG-DEL-003",
    trackingNumber: "PCG789123458",
    customerName: "Lisa Brown",
    address: "789 Pine Road, Uptown",
    timeWindow: "4:00 PM - 6:00 PM",
    estimatedTime: "4:45 PM",
    status: "assigned",
    priority: "low",
    packageType: "Documents",
    weight: "0.3 kg",
    specialInstructions: "Signature required"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready_for_pickup":
      return "bg-blue-500";
    case "in_transit":
      return "bg-yellow-500";
    case "delivered":
      return "bg-green-500";
    case "assigned":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
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
      return "border-l-red-500";
    case "medium":
      return "border-l-yellow-500";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-gray-500";
  }
};

export default function CourierDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("deliveries");

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
              className="h-10 w-10"
              id="parcego-courier-avatar"
            >
              <AvatarFallback className="parcego-avatar__fallback">
                {mockCourierData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 
                className="font-semibold text-gray-900"
                id="parcego-courier-welcome-title"
              >
                Welcome back, {mockCourierData.name}
              </h1>
              <p 
                className="text-sm text-gray-500"
                id="parcego-courier-id-text"
              >
                ID: {mockCourierData.id}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="parcego-header__notification-btn"
            id="parcego-courier-notifications-btn"
          >
            <Icon name="Bell" size={20} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div 
        className="p-4 space-y-4"
        id="parcego-courier-stats-section"
      >
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="parcego-stats-card parcego-stats-card--deliveries"
            id="parcego-courier-deliveries-stat"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{mockCourierData.stats.deliveriesToday}</p>
                  <p className="text-xs text-gray-500">Deliveries Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stats-card parcego-stats-card--completed"
            id="parcego-courier-completed-stat"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockCourierData.stats.completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stats-card parcego-stats-card--earnings"
            id="parcego-courier-earnings-stat"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={20} className="text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">${mockCourierData.stats.earnings}</p>
                  <p className="text-xs text-gray-500">Today's Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stats-card parcego-stats-card--rating"
            id="parcego-courier-rating-stat"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={20} className="text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{mockCourierData.stats.rating}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card 
          className="parcego-quick-actions-card"
          id="parcego-courier-quick-actions"
        >
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-16 flex flex-col space-y-2 parcego-action-btn parcego-action-btn--next-delivery"
                onClick={() => handleStartRoute(mockDeliveries[0].id)}
                id="parcego-courier-next-delivery-btn"
              >
                <Icon name="Navigation" size={20} />
                <span className="text-sm">Start Next</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-2 parcego-action-btn parcego-action-btn--route"
                onClick={() => router.push('/courier/route')}
                id="parcego-courier-view-route-btn"
              >
                <Icon name="Route" size={20} />
                <span className="text-sm">View Route</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-2 parcego-action-btn parcego-action-btn--scan"
                onClick={() => router.push('/courier/scan')}
                id="parcego-courier-scan-btn"
              >
                <Icon name="Camera" size={20} />
                <span className="text-sm">Scan Package</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-2 parcego-action-btn parcego-action-btn--performance"
                onClick={handleViewPerformance}
                id="parcego-courier-performance-btn"
              >
                <Icon name="BarChart3" size={20} />
                <span className="text-sm">Performance</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Deliveries */}
        <Card 
          className="parcego-deliveries-card"
          id="parcego-courier-deliveries-list"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Deliveries</CardTitle>
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
            {mockDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(delivery.priority)} parcego-delivery-card`}
                id={`parcego-delivery-card-${delivery.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
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
                    </div>
                    <p 
                      className="text-sm text-gray-600 flex items-center"
                      id={`parcego-delivery-address-${delivery.id}`}
                    >
                      <Icon name="MapPin" size={16} className="mr-1" />
                      {delivery.address}
                    </p>
                    <p 
                      className="text-sm text-gray-500 flex items-center mt-1"
                      id={`parcego-delivery-time-${delivery.id}`}
                    >
                      <Icon name="Clock" size={16} className="mr-1" />
                      {delivery.timeWindow} (Est: {delivery.estimatedTime})
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Icon name="Package" size={12} className="mr-1" />
                        {delivery.packageType}
                      </span>
                      <span>{delivery.weight}</span>
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          delivery.priority === 'high' ? 'bg-red-100 text-red-700' :
                          delivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}
                      >
                        {delivery.priority.toUpperCase()}
                      </span>
                    </div>
                    {delivery.specialInstructions && (
                      <p 
                        className="text-xs text-blue-600 mt-2 flex items-center"
                        id={`parcego-delivery-instructions-${delivery.id}`}
                      >
                        <Icon name="AlertCircle" size={12} className="mr-1" />
                        {delivery.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {delivery.status === "ready_for_pickup" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScanPackage(delivery.id)}
                        className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--scan"
                        id={`parcego-scan-btn-${delivery.id}`}
                      >
                        <Icon name="Camera" size={16} className="mr-1" />
                        Scan Package
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartRoute(delivery.id)}
                        className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--route"
                        id={`parcego-route-btn-${delivery.id}`}
                      >
                        <Icon name="Route" size={16} className="mr-1" />
                        Start Route
                      </Button>
                    </>
                  )}
                  
                  {delivery.status === "in_transit" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkDelivered(delivery.id)}
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--delivered"
                      id={`parcego-delivered-btn-${delivery.id}`}
                    >
                      <Icon name="CheckCircle" size={16} className="mr-1" />
                      Mark as Delivered
                    </Button>
                  )}
                  
                  {delivery.status === "assigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--waiting"
                      id={`parcego-waiting-btn-${delivery.id}`}
                    >
                      <Icon name="Clock" size={16} className="mr-1" />
                      Waiting for Pickup
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2"
        id="parcego-courier-bottom-nav"
      >
        <div className="flex justify-around">
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
            variant={activeTab === "route" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("route");
              router.push('/courier/route');
            }}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--route"
            id="parcego-nav-route-btn"
          >
            <Icon name="Route" size={16} />
            <span className="text-xs">Route</span>
          </Button>
          
          <Button
            variant={activeTab === "performance" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("performance");
              handleViewPerformance();
            }}
            className="flex flex-col items-center space-y-1 parcego-nav-btn parcego-nav-btn--performance"
            id="parcego-nav-performance-btn"
          >
            <Icon name="BarChart3" size={16} />
            <span className="text-xs">Performance</span>
          </Button>
          
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("profile");
              router.push('/courier/profile');
            }}
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