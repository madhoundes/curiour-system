"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

// Mock data for charts
const shipmentOverTimeData = [
  { month: "Jan", shipments: 124, revenue: 3420, delivered: 118 },
  { month: "Feb", shipments: 156, revenue: 4200, delivered: 148 },
  { month: "Mar", shipments: 189, revenue: 5100, delivered: 182 },
  { month: "Apr", shipments: 143, revenue: 3850, delivered: 135 },
  { month: "May", shipments: 201, revenue: 5400, delivered: 194 },
  { month: "Jun", shipments: 234, revenue: 6300, delivered: 227 },
  { month: "Jul", shipments: 298, revenue: 8100, delivered: 285 },
  { month: "Aug", shipments: 267, revenue: 7200, delivered: 251 },
  { month: "Sep", shipments: 312, revenue: 8500, delivered: 298 },
  { month: "Oct", shipments: 285, revenue: 7800, delivered: 272 },
  { month: "Nov", shipments: 334, revenue: 9200, delivered: 321 },
  { month: "Dec", shipments: 387, revenue: 10500, delivered: 375 }
];

const statusDistributionData = [
  { name: "Delivered", value: 2847, color: "#22c55e" },
  { name: "In Transit", value: 234, color: "#3b82f6" },
  { name: "Pending", value: 156, color: "#f59e0b" },
  { name: "Failed", value: 43, color: "#ef4444" }
];

const serviceMixData = [
  { name: "Parcego Standard", value: 3280, color: "#8b5cf6" }
];

const revenueData = [
  { month: "Jan", revenue: 3420, cost: 2580 },
  { month: "Feb", revenue: 4200, cost: 3150 },
  { month: "Mar", revenue: 5100, cost: 3825 },
  { month: "Apr", revenue: 3850, cost: 2887 },
  { month: "May", revenue: 5400, cost: 4050 },
  { month: "Jun", revenue: 6300, cost: 4725 },
  { month: "Jul", revenue: 8100, cost: 6075 },
  { month: "Aug", revenue: 7200, cost: 5400 },
  { month: "Sep", revenue: 8500, cost: 6375 },
  { month: "Oct", revenue: 7800, cost: 5850 },
  { month: "Nov", revenue: 9200, cost: 6900 },
  { month: "Dec", revenue: 10500, cost: 7875 }
];

// Key metrics calculations
const currentMonth = shipmentOverTimeData[shipmentOverTimeData.length - 1];
const previousMonth = shipmentOverTimeData[shipmentOverTimeData.length - 2];
const totalShipments = shipmentOverTimeData.reduce((sum, item) => sum + item.shipments, 0);
const totalRevenue = shipmentOverTimeData.reduce((sum, item) => sum + item.revenue, 0);
const totalDelivered = shipmentOverTimeData.reduce((sum, item) => sum + item.delivered, 0);
const onTimePercentage = Math.round((totalDelivered / totalShipments) * 100);

// Calculate growth percentages
const shipmentsGrowth = Math.round(((currentMonth.shipments - previousMonth.shipments) / previousMonth.shipments) * 100);
const revenueGrowth = Math.round(((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100);

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("12months");

  const handleBack = () => router.push("/dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey.includes('revenue') || entry.dataKey.includes('cost') ? formatCurrency(entry.value) : formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Left side: Back button */}
              <div className="flex-shrink-0">
                <Button 
                  id="parcego-analytics-back-btn" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-full"
                  aria-label="Back to Dashboard"
                >
                  <Icon name="ArrowLeft" size={18} />
                </Button>
              </div>

              {/* Center: Title and description */}
              <div className="flex-1 flex justify-center">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-500">Performance insights and shipping analytics</p>
                </div>
              </div>

              {/* Right side: Controls */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="3months">Last 3 months</option>
                  <option value="6months">Last 6 months</option>
                  <option value="12months">Last 12 months</option>
                </select>
                <Button variant="outline" size="sm">
                  <Icon name="Download" size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(totalShipments)}</p>
                  <div className="flex items-center mt-2">
                    <Icon 
                      name={shipmentsGrowth >= 0 ? "TrendingUp" : "TrendingDown"} 
                      size={16} 
                      className={`mr-1 ${shipmentsGrowth >= 0 ? "text-green-600" : "text-red-600"}`} 
                    />
                    <span className={`text-sm font-medium ${shipmentsGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(shipmentsGrowth)}% vs last month
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <Icon name="Package" size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(totalDelivered)}</p>
                  <div className="flex items-center mt-2">
                    <Icon name="CircleCheck" size={16} className="mr-1 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      {onTimePercentage}% success rate
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <Icon name="CircleCheck" size={24} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-time %</p>
                  <p className="text-3xl font-bold text-gray-900">{onTimePercentage}%</p>
                  <div className="flex items-center mt-2">
                    <Icon name="Clock" size={16} className="mr-1 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">
                      Delivery performance
                    </span>
                  </div>
                </div>
                <div className="bg-orange-100 rounded-lg p-3">
                  <Icon name="Clock" size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <Icon 
                      name={revenueGrowth >= 0 ? "TrendingUp" : "TrendingDown"} 
                      size={16} 
                      className={`mr-1 ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`} 
                    />
                    <span className={`text-sm font-medium ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(revenueGrowth)}% vs last month
                    </span>
                  </div>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <Icon name="DollarSign" size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shipments Over Time - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-blue-600" />
                Shipments Over Time
              </CardTitle>
              <CardDescription>Monthly shipment volume and delivery performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shipmentOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="shipments" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      name="Total Shipments"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="delivered" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                      name="Delivered"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Over Time - Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="DollarSign" size={20} className="text-green-600" />
                Revenue Analysis
              </CardTitle>
              <CardDescription>Revenue vs operational costs comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stackId="2"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Operational Cost"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="PieChart" size={20} className="text-purple-600" />
                Delivery Status Distribution
              </CardTitle>
              <CardDescription>Current status breakdown of all shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value), 'Shipments']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Service Mix - Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Truck" size={20} className="text-indigo-600" />
                Service Distribution
              </CardTitle>
              <CardDescription>Current shipping service usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {serviceMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value), 'Shipments']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Award" size={20} className="text-yellow-600" />
                Top Performance
              </CardTitle>
              <CardDescription>Best performing metrics this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Icon name="Clock" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Fastest Delivery</p>
                    <p className="text-sm text-green-700">2.3 hours average</p>
                  </div>
                </div>
                <Icon name="TrendingUp" size={20} className="text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <Icon name="MapPin" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Top Route</p>
                    <p className="text-sm text-blue-700">NYC → LA (234 shipments)</p>
                  </div>
                </div>
                <Icon name="Star" size={20} className="text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 rounded-full p-2">
                    <Icon name="DollarSign" size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Highest Revenue Day</p>
                    <p className="text-sm text-purple-700">Dec 15: $2,450</p>
                  </div>
                </div>
                <Icon name="TrendingUp" size={20} className="text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} className="text-indigo-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest shipping and delivery updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { time: "2 min ago", action: "New shipment created", icon: "Plus" as const, color: "text-green-600" },
                { time: "15 min ago", action: "Package delivered in NYC", icon: "CircleCheck" as const, color: "text-blue-600" },
                { time: "1 hour ago", action: "Express shipment picked up", icon: "Truck" as const, color: "text-orange-600" },
                { time: "2 hours ago", action: "Route optimized for Zone A", icon: "MapPin" as const, color: "text-purple-600" },
                { time: "3 hours ago", action: "Payment processed: $245", icon: "DollarSign" as const, color: "text-green-600" }
              ] as const).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Icon name={activity.icon} size={16} className={activity.color} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-cyan-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common analytics tasks and reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Icon name="FileText" size={16} className="mr-2" />
                Generate Monthly Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Export Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Icon name="BarChart3" size={16} className="mr-2" />
                Custom Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Icon name="Settings" size={16} className="mr-2" />
                Configure Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Icon name="Share" size={16} className="mr-2" />
                Share Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}