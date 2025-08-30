"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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
    week: { base: 540.25, tips: 140.0, payouts: "On Schedule" },
    month: { base: 2280.75, tips: 565.0, payouts: "Processed" },
  },


};



export default function CourierPerformance() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("today");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const handleGoBack = () => {
    router.back();
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
      className="min-h-screen bg-gray-50 pb-20"
      id="parcego-courier-performance-root"
    >
      <div
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-courier-performance-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              aria-label="Go back"
              id="parcego-courier-performance-back-btn"
              className="parcego-courier-performance__back-btn"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold -mt-4" id="parcego-courier-performance-title">
                Courier Performance Analytics
              </h1>
              <p className="text-sm text-gray-500">Insights and trends for your deliveries</p>
            </div>
          </div>
          <div className="flex items-center gap-3" id="parcego-courier-performance-courier-chip">
            <Avatar>
              <AvatarImage src={mockPerformanceData.courier.avatarUrl} alt={mockPerformanceData.courier.name} />
              <AvatarFallback aria-label="courier avatar">AH</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium">{mockPerformanceData.courier.name}</p>
              <p className="text-xs text-gray-500">ID: {mockPerformanceData.courier.id}</p>
            </div>
            <Badge id="parcego-courier-performance-status" className="ml-1">
              {mockPerformanceData.courier.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6" id="parcego-courier-performance-content">
        <Card id="parcego-courier-performance-period-card" className="parcego-courier-performance__period-card">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Date range</h3>
                <p className="text-xs text-gray-500">Choose a preset or enter a custom range</p>
              </div>
              
              {/* Preset Buttons - Single Group with Consistent Labeling */}
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
                  id="parcego-courier-performance-preset-last90"
                  variant={selectedPeriod === "last90" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("last90");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "last90"}
                  className="parcego-courier-performance__preset-btn"
                >
                  Last 90 days
                </Button>
                <Button
                  id="parcego-courier-performance-preset-week"
                  variant={selectedPeriod === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("weekly");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "weekly"}
                  className="parcego-courier-performance__preset-btn"
                >
                  This week
                </Button>
                <Button
                  id="parcego-courier-performance-preset-month"
                  variant={selectedPeriod === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod("monthly");
                    setFromDate("");
                    setToDate("");
                  }}
                  role="tab"
                  aria-selected={selectedPeriod === "monthly"}
                  className="parcego-courier-performance__preset-btn"
                >
                  This month
                </Button>
              </div>

              {/* Custom Date Range - Integrated Below Presets */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="parcego-courier-performance-from" className="block text-sm font-medium text-gray-700 mb-1">
                      From
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
                      placeholder="yyyy-mm-dd"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="parcego-courier-performance-to" className="block text-sm font-medium text-gray-700 mb-1">
                      To
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
                      placeholder="yyyy-mm-dd"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      id="parcego-courier-performance-apply-custom"
                      size="sm"
                      onClick={() => setSelectedPeriod("custom")}
                      disabled={!fromDate || !toDate || fromDate > toDate}
                      className="parcego-courier-performance__apply-btn"
                    >
                      Apply
                    </Button>
                    <Button
                      id="parcego-courier-performance-clear-custom"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setSelectedPeriod("today");
                      }}
                      className="parcego-courier-performance__clear-btn"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                {/* Validation Error */}
                {fromDate && toDate && fromDate > toDate && (
                  <p className="text-sm text-red-600 mt-2" id="parcego-courier-performance-date-error">
                    Start date must be before end date
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2" id="parcego-courier-performance-key-metrics">
          <Card id="parcego-courier-performance-metric-completion">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Target" size={18} /> Delivery Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{completionPct}%</p>
                <Badge variant="secondary">{currentData.completed}/{currentData.deliveries}</Badge>
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

          <Card id="parcego-courier-performance-metric-earnings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="DollarSign" size={18} /> Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">${currentData.earnings.toFixed(2)}</p>
                <Badge variant="secondary">{selectedPeriod === "monthly" ? "Monthly" : selectedPeriod === "weekly" ? "Weekly" : "Today"}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-gray-500">Base</p>
                  <p className="font-medium">${(selectedPeriod === "monthly" ? mockPerformanceData.earningsBreakdown.month.base : mockPerformanceData.earningsBreakdown.week.base).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-gray-500">Tips</p>
                  <p className="font-medium">${(selectedPeriod === "monthly" ? mockPerformanceData.earningsBreakdown.month.tips : mockPerformanceData.earningsBreakdown.week.tips).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-gray-500">Payout</p>
                  <p className="font-medium">{selectedPeriod === "monthly" ? mockPerformanceData.earningsBreakdown.month.payouts : mockPerformanceData.earningsBreakdown.week.payouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card id="parcego-courier-performance-metric-efficiency" className="parcego-courier-performance__efficiency-full-width">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Timer" size={18} /> Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500 mb-2">Average Time</p>
                <p className="text-xl font-bold text-blue-600">{currentData.averageTime} min</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500 mb-2">Distance per Delivery</p>
                <p className="text-xl font-bold text-purple-600">{Math.round((currentData.distance / Math.max(currentData.deliveries, 1)) * 10) / 10} km</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500 mb-2">On-time Rate</p>
                <p className="text-xl font-bold text-green-600">{currentData.onTimeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>



        <div className="grid gap-4 md:grid-cols-1">
          {/* Achievements section disabled */}

          <Card id="parcego-courier-performance-career">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={18} /> Career Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Total Deliveries</h4>
                  <p className="text-xl font-bold text-blue-600">{mockPerformanceData.courier.totalDeliveries}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-medium text-gray-900">Success Rate</h4>
                  <p className="text-xl font-bold text-green-600">{mockPerformanceData.courier.successRate}%</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-full h-2" aria-label="progress to 1000 deliveries">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(mockPerformanceData.courier.totalDeliveries / 1000) * 100}%` }}
                  id="parcego-courier-performance-milestone-bar"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {1000 - mockPerformanceData.courier.totalDeliveries} deliveries to reach 1,000 milestone
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}