"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Lucide icons now implemented as kebab-case spans with data-icon attributes
// Following @lucide-kebab-case-icon-structure.mdc rule

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
    id: 1,
    message: "Shipment SH002 is out for delivery",
    time: "2 hours ago",
    type: "info"
  },
  {
    id: 2,
    message: "Payment received for shipment SH001",
    time: "4 hours ago", 
    type: "success"
  },
  {
    id: 3,
    message: "New feature: Bulk shipping labels now available",
    time: "1 day ago",
    type: "announcement"
  }
];

export default function MerchantDashboard() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackPackage = () => {
    setIsTracking(true);
    setTimeout(() => {
      setIsTracking(false);
      router.push(`/track-package?tracking=${encodeURIComponent(trackingNumber)}`);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: "bg-green-100 text-green-800", iconData: "lucide:check-circle" },
      in_transit: { color: "bg-blue-100 text-blue-800", iconData: "lucide:clock" },
      pending: { color: "bg-yellow-100 text-yellow-800", iconData: "lucide:alert-circle" },
      failed: { color: "bg-red-100 text-red-800", iconData: "lucide:x-circle" }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {React.createElement('span', {
          className: 'iconify lucide-icon',
          'data-icon': config.iconData,
          style: { width: '12px', height: '12px', marginRight: '4px', color: 'currentColor' }
        })}
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
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-lg p-2 mr-3">
                  {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:truck',
                  style: { width: '24px', height: '24px', color: 'white' }
                })}
                </div>
                <h1 className="text-xl font-bold text-gray-900">Parcego</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
{React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:bell',
                  style: { width: '20px', height: '20px', color: 'currentColor' }
                })}
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="bg-blue-600 rounded-full p-2">
{React.createElement('span', {
                      className: 'iconify lucide-icon',
                      'data-icon': 'lucide:user',
                      style: { width: '16px', height: '16px', color: 'white' }
                    })}
                  </div>
                  <span className="text-sm font-medium">John Merchant</span>
                </Button>
                
                {/* Dropdown Menu (Mock) */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                  <div className="py-1">
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:settings',
                    style: { width: '16px', height: '16px', marginRight: '12px', color: 'currentColor' }
                  })}
                      Account Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:log-out',
                    style: { width: '16px', height: '16px', marginRight: '12px', color: 'currentColor' }
                  })}
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
          <p className="text-gray-600">Here's what's happening with your shipments today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  {React.createElement('span', {
              className: 'iconify lucide-icon',
              'data-icon': 'lucide:package',
              style: { width: '24px', height: '24px', color: '#2563eb' }
            })}
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
                  {React.createElement('span', {
              className: 'iconify lucide-icon',
              'data-icon': 'lucide:clock',
              style: { width: '24px', height: '24px', color: '#ca8a04' }
            })}
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
                  {React.createElement('span', {
              className: 'iconify lucide-icon',
              'data-icon': 'lucide:check-circle',
              style: { width: '24px', height: '24px', color: '#16a34a' }
            })}
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
                  {React.createElement('span', {
              className: 'iconify lucide-icon',
              'data-icon': 'lucide:bar-chart-3',
              style: { width: '24px', height: '24px', color: '#9333ea' }
            })}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${mockStats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your most common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/create-shipment')}
                id="parcego-dashboard-create-shipment-btn"
              >
                {React.createElement('span', {
            className: 'iconify lucide-icon',
            'data-icon': 'lucide:plus',
            style: { width: '24px', height: '24px', color: 'currentColor' }
          })}
                <span>Create New Shipment</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/find-dropoff')}
                id="parcego-dashboard-find-dropoff-btn"
              >
                {React.createElement('span', {
            className: 'iconify lucide-icon',
            'data-icon': 'lucide:map-pin',
            style: { width: '24px', height: '24px', color: 'currentColor' }
          })}
                <span>Find Drop-off</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/courier')}
                id="parcego-dashboard-courier-btn"
              >
                {React.createElement('span', {
            className: 'iconify lucide-icon',
            'data-icon': 'lucide:truck',
            style: { width: '24px', height: '24px', color: 'currentColor' }
          })}
                <span>Courier Dashboard</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push('/admin')}
                id="parcego-dashboard-admin-btn"
              >
                {React.createElement('span', {
            className: 'iconify lucide-icon',
            'data-icon': 'lucide:shield',
            style: { width: '24px', height: '24px', color: 'currentColor' }
          })}
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
                          {React.createElement('span', {
                      className: 'iconify lucide-icon',
                      'data-icon': 'lucide:eye',
                      style: { width: '16px', height: '16px', color: 'currentColor' }
                    })}
                        </Button>
                        <Button variant="ghost" size="sm">
                          {React.createElement('span', {
                      className: 'iconify lucide-icon',
                      'data-icon': 'lucide:download',
                      style: { width: '16px', height: '16px', color: 'currentColor' }
                    })}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">View All Shipments</Button>
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
                <div className="space-y-2" id="parcego-tracking-widget-result-card">
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
            <Card id="parcego-notif-center">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      id={`parcego-notif-item-${notification.id}`}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" className="w-full text-sm" id="parcego-notif-mark-read-btn">Mark all as read</Button>
                  <Button variant="outline" className="w-full text-sm" id="parcego-notif-clear-all-btn">Clear all</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}