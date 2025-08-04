"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Truck, 
  Package, 
  MapPin, 
  BarChart3, 
  Search, 
  Plus, 
  Bell, 
  User,
  Settings,
  LogOut,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

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
      console.log(`Tracking package: ${trackingNumber}`);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      in_transit: { color: "bg-blue-100 text-blue-800", icon: Clock },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      failed: { color: "bg-red-100 text-red-800", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
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
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Ashraf Courier</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="bg-blue-600 rounded-full p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">John Merchant</span>
                </Button>
                
                {/* Dropdown Menu (Mock) */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                  <div className="py-1">
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4 mr-3" />
                      Account Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="h-4 w-4 mr-3" />
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
                  <Package className="h-6 w-6 text-blue-600" />
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
                  <Clock className="h-6 w-6 text-yellow-600" />
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
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
                  <BarChart3 className="h-6 w-6 text-purple-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-16 flex flex-col space-y-2"
                onClick={() => router.push('/create-shipment')}
                id="ashraf-dashboard-create-shipment-btn"
              >
                <Plus className="h-6 w-6" />
                <span>Create New Shipment</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <Search className="h-6 w-6" />
                <span>Track Package</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
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
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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
                <div className="space-y-2">
                  <Label htmlFor="tracking-input">Tracking Number</Label>
                  <Input
                    id="tracking-input"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button 
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
                  <Button variant="ghost" className="w-full text-sm">View All Notifications</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}