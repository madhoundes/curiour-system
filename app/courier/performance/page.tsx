"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

const mockPerformanceData = {
  courier: {
    name: "Ahmed Hassan",
    id: "PCG-C001",
    joinDate: "2024-01-15",
    totalDeliveries: 847,
    successRate: 98.2
  },
  today: {
    deliveries: 8,
    completed: 5,
    remaining: 3,
    earnings: 145.50,
    distance: 45.8,
    averageTime: 18,
    averageRating: 4.8
  },
  weekly: {
    deliveries: 42,
    earnings: 680.25,
    distance: 215.4,
    averageRating: 4.9,
    onTimeRate: 96.5
  },
  monthly: {
    deliveries: 178,
    earnings: 2845.75,
    distance: 892.3,
    averageRating: 4.8,
    efficiency: 94.2
  },
  achievements: [
    {
      id: "streak",
      title: "Delivery Streak",
      description: "15 consecutive successful deliveries",
      icon: "🔥",
      earned: true
    },
    {
      id: "speed",
      title: "Speed Demon",
      description: "Completed 10 deliveries in under 6 hours",
      icon: "⚡",
      earned: true
    },
    {
      id: "satisfaction",
      title: "Customer Favorite",
      description: "Maintain 4.8+ rating for 30 days",
      icon: "⭐",
      earned: false
    },
    {
      id: "efficiency",
      title: "Route Master",
      description: "Optimize route to save 20% travel time",
      icon: "🗺️",
      earned: false
    }
  ]
};

const mockRecentDeliveries = [
  {
    id: "PCG-DEL-005",
    customer: "John Smith",
    address: "789 Oak Street",
    completedAt: "3:45 PM",
    duration: "15 min",
    rating: 5,
    tip: 5.00
  },
  {
    id: "PCG-DEL-004",
    customer: "Emma Wilson",
    address: "456 Pine Avenue",
    completedAt: "2:30 PM",
    duration: "12 min",
    rating: 5,
    tip: 3.50
  },
  {
    id: "PCG-DEL-003",
    customer: "Mike Chen",
    address: "123 Main Street",
    completedAt: "1:15 PM",
    duration: "20 min",
    rating: 4,
    tip: 2.00
  }
];

export default function CourierPerformance() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "weekly" | "monthly">("today");

  const handleGoBack = () => {
    router.back();
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case "weekly":
        return mockPerformanceData.weekly;
      case "monthly":
        return mockPerformanceData.monthly;
      default:
        return mockPerformanceData.today;
    }
  };

  const currentData = getCurrentData();

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-20"
      id="parcego-performance-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-performance-header"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="parcego-header__back-btn"
            id="parcego-performance-back-btn"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 
            className="text-xl font-semibold"
            id="parcego-performance-title"
          >
            Performance Dashboard
          </h1>
        </div>
      </div>

      <div 
        className="p-4 space-y-6"
        id="parcego-performance-content"
      >
        {/* Period Selector */}
        <Card 
          className="parcego-period-selector-card"
          id="parcego-period-selector"
        >
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button
                variant={selectedPeriod === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("today")}
                className="flex-1 parcego-period-btn parcego-period-btn--today"
                id="parcego-period-today-btn"
              >
                Today
              </Button>
              <Button
                variant={selectedPeriod === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("weekly")}
                className="flex-1 parcego-period-btn parcego-period-btn--weekly"
                id="parcego-period-weekly-btn"
              >
                This Week
              </Button>
              <Button
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("monthly")}
                className="flex-1 parcego-period-btn parcego-period-btn--monthly"
                id="parcego-period-monthly-btn"
              >
                This Month
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div 
          className="grid grid-cols-2 gap-4"
          id="parcego-performance-stats"
        >
          <Card 
            className="parcego-stat-card parcego-stat-card--deliveries"
            id="parcego-stat-deliveries"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {selectedPeriod === "today" ? currentData.deliveries : 
                     selectedPeriod === "weekly" ? currentData.deliveries :
                     currentData.deliveries}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPeriod === "today" ? "Today" : 
                     selectedPeriod === "weekly" ? "This Week" : "This Month"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stat-card parcego-stat-card--earnings"
            id="parcego-stat-earnings"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={20} className="text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${selectedPeriod === "today" ? currentData.earnings :
                       selectedPeriod === "weekly" ? currentData.earnings :
                       currentData.earnings}
                  </p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stat-card parcego-stat-card--rating"
            id="parcego-stat-rating"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={20} className="text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {currentData.averageRating}
                  </p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="parcego-stat-card parcego-stat-card--distance"
            id="parcego-stat-distance"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={20} className="text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {selectedPeriod === "today" ? currentData.distance :
                     selectedPeriod === "weekly" ? currentData.distance :
                     currentData.distance}km
                  </p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card 
          className="parcego-achievements-card"
          id="parcego-achievements"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Award" size={20} />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockPerformanceData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  achievement.earned 
                    ? "bg-green-50 border-green-200" 
                    : "bg-gray-50 border-gray-200"
                } parcego-achievement-item`}
                id={`parcego-achievement-${achievement.id}`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 
                    className={`font-medium ${
                      achievement.earned ? "text-green-800" : "text-gray-700"
                    }`}
                    id={`parcego-achievement-title-${achievement.id}`}
                  >
                    {achievement.title}
                  </h4>
                  <p 
                    className={`text-sm ${
                      achievement.earned ? "text-green-600" : "text-gray-500"
                    }`}
                    id={`parcego-achievement-desc-${achievement.id}`}
                  >
                    {achievement.description}
                  </p>
                </div>
                <Badge 
                  variant={achievement.earned ? "default" : "secondary"}
                  className={`parcego-achievement-badge ${
                    achievement.earned ? "parcego-achievement-badge--earned" : "parcego-achievement-badge--pending"
                  }`}
                  id={`parcego-achievement-badge-${achievement.id}`}
                >
                  {achievement.earned ? "Earned" : "Locked"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card 
          className="parcego-recent-deliveries-card"
          id="parcego-recent-deliveries"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Clock" size={20} />
              <span>Recent Deliveries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRecentDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg parcego-recent-delivery-item"
                id={`parcego-recent-delivery-${delivery.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    id={`parcego-delivery-number-${delivery.id}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 
                      className="font-medium text-gray-900"
                      id={`parcego-delivery-customer-${delivery.id}`}
                    >
                      {delivery.customer}
                    </h4>
                    <p 
                      className="text-sm text-gray-600"
                      id={`parcego-delivery-address-${delivery.id}`}
                    >
                      {delivery.address}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{delivery.completedAt}</span>
                      <span>•</span>
                      <span>{delivery.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Icon name="Star" size={16} className="text-yellow-500" />
                    <span 
                      className="text-sm font-medium"
                      id={`parcego-delivery-rating-${delivery.id}`}
                    >
                      {delivery.rating}
                    </span>
                  </div>
                  <p 
                    className="text-sm text-green-600 font-medium"
                    id={`parcego-delivery-tip-${delivery.id}`}
                  >
                    +${delivery.tip.toFixed(2)} tip
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card 
          className="parcego-insights-card"
          id="parcego-performance-insights"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={20} />
              <span>Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="bg-green-50 border border-green-200 rounded-lg p-4"
              id="parcego-insight-positive"
            >
              <div className="flex items-center mb-2">
                <Icon name="CheckCircle" size={20} className="mr-2 text-green-600" />
                <h4 className="font-medium text-green-800">Great Performance!</h4>
              </div>
              <p className="text-green-700 text-sm">
                Your delivery time is 15% faster than the average courier in your area.
              </p>
            </div>

            <div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              id="parcego-insight-tip"
            >
              <div className="flex items-center mb-2">
                <Icon name="Target" size={20} className="mr-2 text-blue-600" />
                <h4 className="font-medium text-blue-800">Improvement Opportunity</h4>
              </div>
              <p className="text-blue-700 text-sm">
                Complete 3 more deliveries this week to reach your monthly target and earn a bonus.
              </p>
            </div>

            <div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              id="parcego-insight-reminder"
            >
              <div className="flex items-center mb-2">
                <Icon name="AlertCircle" size={20} className="mr-2 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Reminder</h4>
              </div>
              <p className="text-yellow-700 text-sm">
                Don&apos;t forget to take photos for proof of delivery to maintain your rating.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Career Progress */}
        <Card 
          className="parcego-career-card"
          id="parcego-career-progress"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Calendar" size={20} />
              <span>Career Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Total Deliveries</h4>
                <p className="text-2xl font-bold text-blue-600">{mockPerformanceData.courier.totalDeliveries}</p>
              </div>
              <div className="text-right">
                <h4 className="font-medium text-gray-900">Success Rate</h4>
                <p className="text-2xl font-bold text-green-600">{mockPerformanceData.courier.successRate}%</p>
              </div>
            </div>
            
            <div 
              className="bg-gray-100 rounded-full h-2"
              id="parcego-progress-bar-bg"
            >
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(mockPerformanceData.courier.totalDeliveries / 1000) * 100}%` }}
                id="parcego-progress-bar"
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              {1000 - mockPerformanceData.courier.totalDeliveries} deliveries to reach 1,000 milestone
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}