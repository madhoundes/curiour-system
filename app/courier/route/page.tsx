"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

// Enhanced mock data for AI route optimization
const initialRouteData = {
  totalDeliveries: 5,
  totalDistance: "18.3 km",
  estimatedTime: "3h 25m",
  fuelCost: "$12.80",
  trafficStatus: "moderate",
  currentDelivery: 1,
  optimizationScore: 87,
  co2Saved: "2.1 kg"
};

const initialDeliveries = [
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
    notes: "Call upon arrival",
    priority: "high",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    trafficLevel: "light"
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
    notes: "Handle with care - electronics",
    priority: "medium",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    trafficLevel: "moderate"
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
    notes: "Signature required",
    priority: "high",
    coordinates: { lat: 40.7831, lng: -73.9712 },
    trafficLevel: "heavy"
  },
  {
    id: "PCG-DEL-004",
    customerName: "Robert Wilson",
    address: "321 Elm Street, Midtown",
    phone: "+1 (555) 456-7890",
    timeWindow: "5:00 PM - 7:00 PM",
    estimatedArrival: "5:30 PM",
    status: "pending",
    distance: "3.8 km",
    duration: "10 min",
    notes: "Leave at reception",
    priority: "low",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    trafficLevel: "light"
  },
  {
    id: "PCG-DEL-005",
    customerName: "Amanda Davis",
    address: "567 Broadway, Theater District",
    phone: "+1 (555) 567-8901",
    timeWindow: "6:00 PM - 8:00 PM",
    estimatedArrival: "6:15 PM",
    status: "pending",
    distance: "2.7 km",
    duration: "7 min",
    notes: "Express delivery",
    priority: "urgent",
    coordinates: { lat: 40.7590, lng: -73.9845 },
    trafficLevel: "moderate"
  }
];

// Mock turn-by-turn directions
const mockDirections = [
  { step: 1, instruction: "Head north on Main Street", distance: "0.3 km", duration: "2 min", maneuver: "straight" },
  { step: 2, instruction: "Turn right onto Broadway", distance: "1.2 km", duration: "4 min", maneuver: "turn-right" },
  { step: 3, instruction: "Continue straight for 500m", distance: "0.5 km", duration: "2 min", maneuver: "straight" },
  { step: 4, instruction: "Turn left onto Oak Avenue", distance: "0.8 km", duration: "3 min", maneuver: "turn-left" },
  { step: 5, instruction: "Destination will be on your right", distance: "0.1 km", duration: "1 min", maneuver: "arrive" }
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "low":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTrafficColor = (level: string) => {
  switch (level) {
    case "light":
      return "bg-green-500";
    case "moderate":
      return "bg-yellow-500";
    case "heavy":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getManeuverIcon = (maneuver: string) => {
  switch (maneuver) {
    case "turn-left":
      return "ArrowLeft";
    case "turn-right":
      return "ArrowRight";
    case "straight":
      return "ArrowUp";
    case "arrive":
      return "MapPin";
    default:
      return "Navigation";
  }
};

export default function AIRouteOptimization() {
  const router = useRouter();
  const [routeData, setRouteData] = useState(initialRouteData);
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  // Enhanced handler functions
  const handleStartNavigation = () => {
    setShowDirections(true);
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessageCustomer = (phone: string) => {
    window.location.href = `sms:${phone}`;
  };

  const handleGoBack = () => {
    router.back();
  };

  // AI Route Optimization
  const handleOptimizeRoute = useCallback(async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock optimization results
    const optimizedDeliveries = [...deliveries].sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });
    
    // Update route data with optimized metrics
    setDeliveries(optimizedDeliveries);
    setRouteData(prev => ({
      ...prev,
      totalDistance: "16.2 km",
      estimatedTime: "2h 45m",
      fuelCost: "$10.90",
      optimizationScore: 94,
      co2Saved: "3.2 kg"
    }));
    
    setIsOptimizing(false);
  }, [deliveries]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, deliveryId: string) => {
    setDraggedItem(deliveryId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", deliveryId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, deliveryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(deliveryId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setIsDragOver(null);
      return;
    }

    const newDeliveries = [...deliveries];
    const draggedIndex = newDeliveries.findIndex(d => d.id === draggedItem);
    const targetIndex = newDeliveries.findIndex(d => d.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedDelivery] = newDeliveries.splice(draggedIndex, 1);
      newDeliveries.splice(targetIndex, 0, draggedDelivery);
      setDeliveries(newDeliveries);
    }
    
    setDraggedItem(null);
    setIsDragOver(null);
  }, [draggedItem, deliveries]);

  // Accessibility: Keyboard support for reordering
  const handleKeyDown = useCallback((e: React.KeyboardEvent, deliveryId: string, index: number) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = e.key === "ArrowUp" ? index - 1 : index + 1;
      
      if (newIndex >= 0 && newIndex < deliveries.length) {
        const newDeliveries = [...deliveries];
        const [movedDelivery] = newDeliveries.splice(index, 1);
        newDeliveries.splice(newIndex, 0, movedDelivery);
        setDeliveries(newDeliveries);
      }
    }
  }, [deliveries]);

  return (
    <div 
      className="min-h-screen bg-gray-50"
      id="parcego-ai-route-optimization-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-route-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="parcego-header__back-btn p-3"
              id="parcego-route-back-btn"
              aria-label="Go back to previous page"
            >
              <Icon name="ArrowLeft" size={24} className="text-gray-700" />
            </Button>
            <div>
              <h1 
                className="text-xl font-semibold"
                id="parcego-route-title"
              >
                AI Route Optimization
              </h1>
              <p className="text-sm text-muted-foreground">
                Smart delivery planning with real-time optimization
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              className="bg-green-100 text-green-800 border-green-200 px-3 py-2"
              id="parcego-optimization-score"
            >
              <Icon name="Zap" size={18} className="mr-2 text-green-700" />
              <span className="font-semibold">{routeData.optimizationScore}% Optimized</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDirections(!showDirections)}
              className="parcego-toggle-directions-btn"
              id="parcego-toggle-directions-btn"
              aria-label="Toggle turn-by-turn directions"
            >
              <Icon name="Navigation" size={20} className="mr-2 text-blue-600" />
              <span className="font-medium">{showDirections ? "Hide" : "Show"} Directions</span>
            </Button>
          </div>
        </div>
      </div>

      <div 
        className="p-4 space-y-4"
        id="parcego-route-content"
      >
        {/* Enhanced Route Overview */}
        <Card 
          className="parcego-route-overview-card"
          id="parcego-route-overview"
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Route" size={24} className="text-blue-600" />
                <span className="text-lg font-semibold">AI-Optimized Route</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeRoute}
                disabled={isOptimizing}
                className="parcego-optimize-btn"
                id="parcego-ai-optimize-btn"
                aria-label="Optimize route using AI"
              >
                {isOptimizing ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin text-purple-600" />
                    <span className="font-medium">Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Zap" size={20} className="mr-2 text-purple-600" />
                    <span className="font-medium">Re-optimize</span>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Truck" size={24} className="text-blue-600" />
                  <span className="text-2xl font-bold">{routeData.totalDeliveries}</span>
                </div>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="MapPin" size={24} className="text-green-600" />
                  <span className="text-2xl font-bold">{routeData.totalDistance}</span>
                </div>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Timer" size={24} className="text-purple-600" />
                  <span className="text-2xl font-bold">{routeData.estimatedTime}</span>
                </div>
                <p className="text-xs text-gray-500">Est. Time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Fuel" size={20} className="text-green-600" />
                  <span className="text-lg font-bold text-green-800">{routeData.fuelCost}</span>
                </div>
                <p className="text-xs text-green-700">Fuel Cost</p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Leaf" size={20} className="text-blue-600" />
                  <span className="text-lg font-bold text-blue-800">{routeData.co2Saved}</span>
                </div>
                <p className="text-xs text-blue-700">CO₂ Saved</p>
              </div>
            </div>

            <div 
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              id="parcego-traffic-status"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon name="TriangleAlert" size={20} className="mr-3 text-yellow-700" />
                  <div>
                    <p className="text-yellow-800 font-medium">Traffic-Aware Routing Active</p>
                    <p className="text-yellow-700 text-sm">Real-time traffic data integrated</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Light traffic"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Moderate traffic"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="Heavy traffic"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map with Route Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card 
            className="lg:col-span-2 parcego-map-card"
            id="parcego-route-map"
          >
            <CardContent className="p-0">
              <div 
                className="bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 h-80 rounded-lg relative overflow-hidden"
                id="parcego-interactive-map"
              >
                {/* Route visualization overlay */}
                <div className="absolute inset-4 pointer-events-none">
                  <svg 
                    className="w-full h-full" 
                    viewBox="0 0 400 300"
                    aria-label="Route visualization with delivery points"
                  >
                    {/* Route path */}
                    <path
                      d="M50,250 Q150,200 200,150 Q250,100 350,50"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="8,4"
                      className="opacity-80"
                    />
                    
                    {/* Delivery points */}
                    {deliveries.slice(0, 4).map((delivery, index) => {
                      const positions = [
                        { x: 50, y: 250 },
                        { x: 150, y: 180 },
                        { x: 250, y: 120 },
                        { x: 350, y: 50 }
                      ];
                      const pos = positions[index];
                      return (
                        <g key={delivery.id}>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="12"
                            fill={delivery.status === "current" ? "#3b82f6" : 
                                  delivery.status === "next" ? "#eab308" : "#6b7280"}
                            stroke="white"
                            strokeWidth="2"
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 4}
                            textAnchor="middle"
                            className="text-xs font-bold fill-white"
                          >
                            {index + 1}
                          </text>
                          {/* Traffic indicator */}
                          <circle
                            cx={pos.x + 15}
                            cy={pos.y - 10}
                            r="4"
                            fill={getTrafficColor(delivery.trafficLevel)}
                            className="opacity-80"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3 text-sm">
                      <Icon name="MapPin" size={20} className="text-blue-600" />
                      <span className="font-semibold">Route Visualization</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Drag delivery points to reorder
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm parcego-action-btn parcego-action-btn--map"
                    id="parcego-open-maps-btn"
                    aria-label="Open route in external maps application"
                  >
                    <Icon name="ExternalLink" size={18} className="mr-2 text-blue-600" />
                    Open Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turn-by-turn Directions Panel */}
          {showDirections && (
            <Card 
              className="parcego-directions-panel"
              id="parcego-directions-panel"
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Icon name="Navigation" size={24} className="text-blue-600" />
                  <span className="text-lg font-semibold">Turn-by-Turn</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mockDirections.map((direction, index) => (
                    <div
                      key={direction.step}
                      className={`flex items-start space-x-3 p-2 rounded-lg ${
                        index === 0 ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                      } transition-colors duration-200`}
                      id={`parcego-direction-step-${direction.step}`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      >
                        <Icon name={getManeuverIcon(direction.maneuver)} size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {direction.instruction}
                        </p>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                          <span>{direction.distance}</span>
                          <span>•</span>
                          <span>{direction.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Delivery Management with Drag & Drop */}
        <Card 
          className="parcego-delivery-list-card"
          id="parcego-delivery-list"
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Delivery Sequence</span>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <Icon name="GripVertical" size={20} className="text-gray-400" />
                <span>Drag to reorder</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className={`border rounded-lg cursor-move transition-all duration-300 ${
                  delivery.status === "current" ? "parcego-status-current" :
                  delivery.status === "next" ? "parcego-status-next" :
                  "border-gray-200 hover:border-gray-300"
                } ${
                  draggedItem === delivery.id ? "opacity-50 scale-105" : ""
                } ${
                  isDragOver === delivery.id ? "border-blue-400 bg-blue-100 scale-105" : ""
                } parcego-delivery-item`}
                id={`parcego-delivery-item-${delivery.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, delivery.id)}
                onDragOver={(e) => handleDragOver(e, delivery.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, delivery.id)}
                onKeyDown={(e) => handleKeyDown(e, delivery.id, index)}
                tabIndex={0}
                role="button"
                aria-label={`Delivery ${index + 1}: ${delivery.customerName}. ${delivery.status} status. Press arrow keys to reorder.`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name="GripVertical" 
                        size={20} 
                        className="text-gray-400 hover:text-gray-700 transition-colors" 
                      />
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md ${
                          delivery.status === "current" ? "bg-blue-500 ring-2 ring-blue-200" :
                          delivery.status === "next" ? "bg-yellow-500 ring-2 ring-yellow-200" :
                          "bg-gray-500"
                        }`}
                        id={`parcego-delivery-number-${delivery.id}`}
                      >
                        {index + 1}
                      </div>
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
                        <Badge 
                          className={`text-xs border font-semibold ${
                            delivery.priority === 'urgent' ? 'parcego-priority-urgent' :
                            delivery.priority === 'high' ? 'parcego-priority-high' :
                            delivery.priority === 'medium' ? 'parcego-priority-medium' :
                            getPriorityColor(delivery.priority)
                          }`}
                          id={`parcego-delivery-priority-${delivery.id}`}
                        >
                          {delivery.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p 
                        className="text-sm text-gray-700 flex items-center mb-2"
                        id={`parcego-delivery-address-${delivery.id}`}
                      >
                        <Icon name="MapPin" size={18} className="mr-2 text-gray-500" />
                        <span className="font-medium">{delivery.address}</span>
                      </p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <Icon name="Clock" size={16} className="mr-2 text-blue-500" />
                  <span className="font-medium">{delivery.timeWindow}</span>
                </span>
                        <span>ETA: {delivery.estimatedArrival}</span>
                        <span>{delivery.distance}</span>
                        <span>{delivery.duration}</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getTrafficColor(delivery.trafficLevel)} shadow-sm`}
                            title={`${delivery.trafficLevel} traffic`}
                          ></div>
                          <span className="capitalize font-medium">{delivery.trafficLevel}</span>
                        </div>
                      </div>
                      {delivery.notes && (
                        <div 
                          className={`text-sm p-3 rounded-lg mt-2 ${
                            delivery.priority === 'urgent' || delivery.priority === 'high' 
                              ? 'parcego-critical-info' 
                              : 'text-blue-700 bg-blue-50 border border-blue-200'
                          }`}
                          id={`parcego-delivery-notes-${delivery.id}`}
                        >
                          <Icon name="FileText" size={16} className="mr-2 inline" />
                          <strong>Note:</strong> {delivery.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {delivery.status === "current" && (
                    <>
                      <Button
                        onClick={() => handleStartNavigation()}
                        className="flex-1 parcego-delivery-action-btn parcego-delivery-action-btn--navigate py-3"
                        id={`parcego-navigate-btn-${delivery.id}`}
                        aria-label={`Start navigation to ${delivery.customerName}`}
                      >
                        <Icon name="Navigation" size={20} className="mr-2 text-white" />
                        <span className="font-semibold">Start Navigation</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCallCustomer(delivery.phone)}
                        className="parcego-delivery-action-btn parcego-delivery-action-btn--call p-3"
                        id={`parcego-call-btn-${delivery.id}`}
                        aria-label={`Call ${delivery.customerName}`}
                      >
                        <Icon name="Phone" size={20} className="text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMessageCustomer(delivery.phone)}
                        className="parcego-delivery-action-btn parcego-delivery-action-btn--message p-3"
                        id={`parcego-message-btn-${delivery.id}`}
                        aria-label={`Message ${delivery.customerName}`}
                      >
                        <Icon name="MessageSquare" size={20} className="text-blue-600" />
                      </Button>
                    </>
                  )}
                  
                  {delivery.status === "next" && (
                    <Button
                      variant="outline"
                      onClick={() => {}}
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--preview py-3"
                      id={`parcego-preview-btn-${delivery.id}`}
                      aria-label={`View details for ${delivery.customerName}`}
                    >
                      <Icon name="Eye" size={18} className="mr-2 text-gray-600" />
                      <span className="font-medium">View Details</span>
                    </Button>
                  )}
                  
                  {delivery.status === "pending" && (
                    <Button
                      variant="ghost"
                      disabled
                      className="w-full parcego-delivery-action-btn parcego-delivery-action-btn--waiting py-3"
                      id={`parcego-waiting-btn-${delivery.id}`}
                      aria-label={`${delivery.customerName} waiting in queue`}
                    >
                      <Icon name="Clock" size={18} className="mr-2 text-gray-400" />
                      <span className="font-medium text-gray-500">Waiting in Queue</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Enhanced AI-Powered Quick Actions */}
        <Card 
          className="parcego-route-actions-card"
          id="parcego-route-actions"
        >
          <CardHeader>
            <CardTitle className="text-lg">Smart Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={handleOptimizeRoute}
                disabled={isOptimizing}
                className="h-16 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--optimize transition-all duration-200 hover:scale-105"
                id="parcego-optimize-route-btn"
                aria-label="Use AI to optimize the current route"
              >
                {isOptimizing ? (
                  <Icon name="Loader2" size={24} className="animate-spin text-purple-600" />
                ) : (
                  <Icon name="Zap" size={24} className="text-purple-600" />
                )}
                <span className="text-xs font-medium">
                  {isOptimizing ? "Optimizing..." : "AI Optimize"}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--traffic transition-all duration-200 hover:scale-105"
                id="parcego-traffic-update-btn"
                aria-label="Refresh traffic data for better routing"
              >
                <Icon name="RefreshCw" size={24} className="text-orange-600" />
                <span className="text-xs font-medium">Traffic Update</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--alternative transition-all duration-200 hover:scale-105"
                id="parcego-alternative-routes-btn"
                aria-label="View alternative route options"
              >
                <Icon name="GitBranch" size={24} className="text-blue-600" />
                <span className="text-xs font-medium">Alt Routes</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 parcego-action-btn parcego-action-btn--emergency transition-all duration-200 hover:scale-105"
                id="parcego-emergency-btn"
                aria-label="Emergency support and assistance"
              >
                <Icon name="AlertTriangle" size={24} className="text-red-600" />
                <span className="text-xs font-medium">Emergency</span>
              </Button>
            </div>
            
            {/* AI Insights */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="Brain" size={24} className="text-purple-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 mb-1">AI Insights</h4>
                  <p className="text-sm text-purple-700">
                    Current route saves <strong>{routeData.co2Saved}</strong> CO₂ and <strong>$3.20</strong> in fuel costs compared to standard routing.
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-purple-600">
                    <span>🚦 Traffic-optimized</span>
                    <span>⚡ Priority-sorted</span>
                    <span>🌱 Eco-friendly</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}