"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Icons will be rendered using React.createElement with kebab-case structure

const mockRouteData = {
  totalDeliveries: 3,
  totalDistance: "12.8 km",
  estimatedTime: "2h 15m",
  fuelCost: "$8.50",
  trafficStatus: "moderate",
  currentDelivery: 1
};

const mockDeliveries = [
  {
    id: "PCG-DEL-001",
    customerName: "Sarah Johnson",
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 123-4567",
    timeWindow: "2:00 PM - 4:00 PM",
    estimatedArrival: "2:30 PM",
    status: "current",
    distance: "3.2 km",
    duration: "8 min",
    notes: "Call upon arrival"
  },
  {
    id: "PCG-DEL-002",
    customerName: "Mike Chen",
    address: "456 Oak Avenue, Suburbs",
    phone: "+1 (555) 234-5678",
    timeWindow: "3:00 PM - 5:00 PM",
    estimatedArrival: "3:15 PM",
    status: "next",
    distance: "5.1 km",
    duration: "12 min",
    notes: "Handle with care - electronics"
  },
  {
    id: "PCG-DEL-003",
    customerName: "Lisa Brown",
    address: "789 Pine Road, Uptown",
    phone: "+1 (555) 345-6789",
    timeWindow: "4:00 PM - 6:00 PM",
    estimatedArrival: "4:45 PM",
    status: "pending",
    distance: "4.5 km",
    duration: "15 min",
    notes: "Signature required"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "current":
      return "bg-blue-500 text-white";
    case "next":
      return "bg-yellow-500 text-white";
    case "pending":
      return "bg-gray-500 text-white";
    case "completed":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "current":
      return "Current";
    case "next":
      return "Next";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
};

export default function RouteNavigation() {
  const router = useRouter();
  const [selectedDelivery, setSelectedDelivery] = useState(mockDeliveries[0]);

  const handleStartNavigation = (deliveryId: string) => {
    // Mock navigation start
    router.push(`/courier/delivery/${deliveryId}`);
  };

  const handleCallCustomer = (phone: string) => {
    // Mock phone call
    window.location.href = `tel:${phone}`;
  };

  const handleMessageCustomer = (phone: string) => {
    // Mock SMS
    window.location.href = `sms:${phone}`;
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      id="parcego-route-navigation-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-route-header"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="parcego-header__back-btn"
            id="parcego-route-back-btn"
          >
            {React.createElement('span', {
              className: 'iconify lucide-icon',
              'data-icon': 'lucide:arrow-left',
              style: { width: '20px', height: '20px', color: 'currentColor' }
            })}
          </Button>
          <h1 
            className="text-xl font-semibold"
            id="parcego-route-title"
          >
            Route Navigation
          </h1>
        </div>
      </div>

      <div 
        className="p-4 space-y-4"
        id="parcego-route-content"
      >
        {/* Route Overview */}
        <Card 
          className="parcego-route-overview-card"
          id="parcego-route-overview"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:route',
                style: { width: '20px', height: '20px', color: 'currentColor' }
              })}
              <span>Today's Route</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:truck',
                    style: { width: '16px', height: '16px', color: '#2563eb' }
                  })}
                  <span className="text-2xl font-bold">{mockRouteData.totalDeliveries}</span>
                </div>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:map-pin',
                    style: { width: '16px', height: '16px', color: '#16a34a' }
                  })}
                  <span className="text-2xl font-bold">{mockRouteData.totalDistance}</span>
                </div>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:timer',
                    style: { width: '16px', height: '16px', color: '#9333ea' }
                  })}
                  <span className="text-2xl font-bold">{mockRouteData.estimatedTime}</span>
                </div>
                <p className="text-xs text-gray-500">Est. Time</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:fuel',
                    style: { width: '16px', height: '16px', color: '#ea580c' }
                  })}
                  <span className="text-2xl font-bold">{mockRouteData.fuelCost}</span>
                </div>
                <p className="text-xs text-gray-500">Fuel Cost</p>
              </div>
            </div>

            <div 
              className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              id="parcego-traffic-status"
            >
              <div className="flex items-center">
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:alert-triangle',
                  style: { width: '16px', height: '16px', marginRight: '8px', color: '#ca8a04' }
                })}
                <div>
                  <p className="text-yellow-800 font-medium">Moderate Traffic</p>
                  <p className="text-yellow-700 text-sm">Consider alternative routes for faster delivery</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card 
          className="parcego-map-card"
          id="parcego-route-map"
        >
          <CardContent className="p-0">
            <div 
              className="bg-gradient-to-br from-blue-100 to-green-100 h-64 rounded-lg flex items-center justify-center"
              id="parcego-map-placeholder"
            >
              <div className="text-center">
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:map-pin',
                  style: { width: '48px', height: '48px', margin: '0 auto 8px', display: 'block', color: '#2563eb' }
                })}
                <p className="text-gray-700 font-medium">Interactive Map</p>
                <p className="text-sm text-gray-500">Google Maps integration will be here</p>
                <Button
                  className="mt-3 parcego-action-btn parcego-action-btn--map"
                  id="parcego-open-maps-btn"
                >
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:navigation',
                    style: { width: '16px', height: '16px', marginRight: '8px', color: 'currentColor' }
                  })}
                  Open in Maps App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery List */}
        <Card 
          className="parcego-delivery-list-card"
          id="parcego-delivery-list"
        >
          <CardHeader>
            <CardTitle>Delivery Sequence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className={`border rounded-lg p-4 ${
                  delivery.status === "current" ? "border-blue-500 bg-blue-50" :
                  delivery.status === "next" ? "border-yellow-500 bg-yellow-50" :
                  "border-gray-200"
                } parcego-delivery-item`}
                id={`parcego-delivery-item-${delivery.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        delivery.status === "current" ? "bg-blue-500" :
                        delivery.status === "next" ? "bg-yellow-500" :
                        "bg-gray-500"
                      }`}
                      id={`parcego-delivery-number-${delivery.id}`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 
                          className="font-medium text-gray-900"
                          id={`parcego-delivery-customer-${delivery.id}`}
                        >
                          {delivery.customerName}
                        </h3>
                        <Badge 
                          className={`text-xs ${getStatusColor(delivery.status)} parcego-delivery-status-badge`}
                          id={`parcego-delivery-status-${delivery.id}`}
                        >
                          {getStatusText(delivery.status)}
                        </Badge>
                      </div>
                      <p 
                        className="text-sm text-gray-600 flex items-center mb-1"
                        id={`parcego-delivery-address-${delivery.id}`}
                      >
                        {React.createElement('span', {
                          className: 'iconify lucide-icon',
                          'data-icon': 'lucide:map-pin',
                          style: { width: '16px', height: '16px', marginRight: '4px', color: 'currentColor' }
                        })}
                        {delivery.address}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center">
                          {React.createElement('span', {
                            className: 'iconify lucide-icon',
                            'data-icon': 'lucide:clock',
                            style: { width: '12px', height: '12px', marginRight: '4px', color: 'currentColor' }
                          })}
                          {delivery.timeWindow}
                        </span>
                        <span>ETA: {delivery.estimatedArrival}</span>
                        <span>{delivery.distance}</span>
                        <span>{delivery.duration}</span>
                      </div>
                      {delivery.notes && (
                        <p 
                          className="text-xs text-blue-600 bg-blue-50 p-2 rounded"
                          id={`parcego-delivery-notes-${delivery.id}`}
                        >
                          📝 {delivery.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {delivery.status === "current" && (
                    <>
                      <Button
                        onClick={() => handleStartNavigation(delivery.id)}
                        className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--navigate"
                        id={`parcego-navigate-btn-${delivery.id}`}
                      >
                        {React.createElement('span', {
                          className: 'iconify lucide-icon',
                          'data-icon': 'lucide:navigation',
                          style: { width: '16px', height: '16px', marginRight: '4px', color: 'currentColor' }
                        })}
                        Start Navigation
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCallCustomer(delivery.phone)}
                        className="parcego-delivery-action-btn parcego-delivery-action-btn--call"
                        id={`parcego-call-btn-${delivery.id}`}
                      >
                        {React.createElement('span', {
                          className: 'iconify lucide-icon',
                          'data-icon': 'lucide:phone',
                          style: { width: '16px', height: '16px', color: 'currentColor' }
                        })}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMessageCustomer(delivery.phone)}
                        className="parcego-delivery-action-btn parcego-delivery-action-btn--message"
                        id={`parcego-message-btn-${delivery.id}`}
                      >
                        {React.createElement('span', {
                          className: 'iconify lucide-icon',
                          'data-icon': 'lucide:message-square',
                          style: { width: '16px', height: '16px', color: 'currentColor' }
                        })}
                      </Button>
                    </>
                  )}
                  
                  {delivery.status === "next" && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDelivery(delivery)}
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--preview"
                      id={`parcego-preview-btn-${delivery.id}`}
                    >
                      View Details
                    </Button>
                  )}
                  
                  {delivery.status === "pending" && (
                    <Button
                      variant="ghost"
                      disabled
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--waiting"
                      id={`parcego-waiting-btn-${delivery.id}`}
                    >
                      {React.createElement('span', {
                        className: 'iconify lucide-icon',
                        'data-icon': 'lucide:clock',
                        style: { width: '16px', height: '16px', marginRight: '4px', color: 'currentColor' }
                      })}
                      Waiting in Queue
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card 
          className="parcego-route-actions-card"
          id="parcego-route-actions"
        >
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--optimize"
                id="parcego-optimize-route-btn"
              >
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:route',
                  style: { width: '16px', height: '16px', color: 'currentColor' }
                })}
                <span className="text-xs">Optimize Route</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-12 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--emergency"
                id="parcego-emergency-btn"
              >
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:alert-triangle',
                  style: { width: '16px', height: '16px', color: 'currentColor' }
                })}
                <span className="text-xs">Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}