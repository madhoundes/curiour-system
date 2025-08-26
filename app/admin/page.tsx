"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Truck,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  Bell,
  Search,
  Filter,
  ArrowLeft,
  BarChart3,
  Activity,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Eye,
  Ban
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  // Mock data for platform overview
  const platformStats = {
    totalMerchants: 1248,
    activeCouriers: 342,
    totalShipments: 25678,
    monthlyRevenue: 145890,
    systemHealth: 99.2,
    pendingApprovals: 23
  };

  // Mock data for merchants
  const mockMerchants = [
    {
      id: "M001",
      businessName: "TechParts Solutions",
      contactName: "Sarah Johnson",
      email: "sarah@techparts.com",
      status: "active",
      joinDate: "2024-01-15",
      totalShipments: 1245,
      monthlyRevenue: 12450
    },
    {
      id: "M002", 
      businessName: "Green Garden Supply",
      contactName: "Mike Chen",
      email: "mike@greengarden.com",
      status: "pending",
      joinDate: "2024-03-20",
      totalShipments: 0,
      monthlyRevenue: 0
    },
    {
      id: "M003",
      businessName: "Fashion Forward LLC",
      contactName: "Emma Wilson",
      email: "emma@fashionforward.com",
      status: "suspended",
      joinDate: "2023-11-08",
      totalShipments: 2156,
      monthlyRevenue: 8900
    }
  ];

  // Mock data for couriers
  const mockCouriers = [
    {
      id: "C001",
      fullName: "David Rodriguez",
      email: "david.r@parcego.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      rating: 4.8,
      completedDeliveries: 1245,
      joinDate: "2023-08-15",
      vehicle: "Van"
    },
    {
      id: "C002",
      fullName: "Lisa Thompson",
      email: "lisa.t@parcego.com", 
      phone: "+1 (555) 987-6543",
      status: "pending",
      rating: 0,
      completedDeliveries: 0,
      joinDate: "2024-03-25",
      vehicle: "Motorcycle"
    },
    {
      id: "C003",
      fullName: "James Mitchell",
      email: "james.m@parcego.com",
      phone: "+1 (555) 456-7890",
      status: "inactive",
      rating: 4.6,
      completedDeliveries: 892,
      joinDate: "2023-12-02",
      vehicle: "Car"
    }
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: "A001",
      type: "merchant_joined",
      message: "New merchant 'Green Garden Supply' registered",
      timestamp: "2 hours ago",
      status: "pending"
    },
    {
      id: "A002", 
      type: "courier_verified",
      message: "Courier David Rodriguez completed verification",
      timestamp: "4 hours ago",
      status: "completed"
    },
    {
      id: "A003",
      type: "system_alert",
      message: "Server maintenance scheduled for tonight",
      timestamp: "1 day ago",
      status: "alert"
    },
    {
      id: "A004",
      type: "payment_processed",
      message: "Monthly payout of $45,890 processed to couriers",
      timestamp: "2 days ago", 
      status: "completed"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800" id={`parcego-status-badge-${status}`}>Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800" id={`parcego-status-badge-${status}`}>Pending</Badge>;
      case "suspended":
      case "inactive":
        return <Badge className="bg-red-100 text-red-800" id={`parcego-status-badge-${status}`}>Suspended</Badge>;
      default:
        return <Badge id={`parcego-status-badge-${status}`}>{status}</Badge>;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6" id="parcego-admin-overview-section">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card id="parcego-admin-stat-merchants">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">Total Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">{platformStats.totalMerchants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-couriers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">Active Couriers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">{platformStats.activeCouriers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-shipments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">{platformStats.totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">${platformStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">{platformStats.systemHealth}%</div>
            <p className="text-xs text-green-600">All systems operational</p>
          </CardContent>
        </Card>

        <Card id="parcego-admin-stat-approvals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-normal">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-3xl font-bold">{platformStats.pendingApprovals}</div>
            <p className="text-xs text-yellow-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card id="parcego-admin-activity-card">
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50" id={`parcego-activity-item-${activity.id}`}>
                <div className="flex-shrink-0">
                  {activity.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {activity.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                  {activity.status === "alert" && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMerchants = () => (
    <div className="space-y-6" id="parcego-admin-merchants-section">
      <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Manage Merchants</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" id="parcego-merchants-filter-btn">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" id="parcego-merchants-search-btn">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Card id="parcego-merchants-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Business</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Shipments</th>
                  <th className="text-left p-4">Revenue</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockMerchants.map((merchant) => (
                  <tr key={merchant.id} className="border-b hover:bg-gray-50" id={`parcego-merchant-row-${merchant.id}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{merchant.businessName}</p>
                        <p className="text-sm text-gray-500">ID: {merchant.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{merchant.contactName}</p>
                        <p className="text-sm text-gray-500">{merchant.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(merchant.status)}
                    </td>
                    <td className="p-4">{merchant.totalShipments.toLocaleString()}</td>
                    <td className="p-4">${merchant.monthlyRevenue.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          id={`parcego-merchant-view-${merchant.id}`}
                          onClick={() => console.log(`View merchant ${merchant.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          id={`parcego-merchant-edit-${merchant.id}`}
                          onClick={() => console.log(`Edit merchant ${merchant.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {merchant.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600" 
                            id={`parcego-merchant-approve-${merchant.id}`}
                            onClick={() => console.log(`Approve merchant ${merchant.id}`)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {merchant.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600" 
                            id={`parcego-merchant-suspend-${merchant.id}`}
                            onClick={() => console.log(`Suspend merchant ${merchant.id}`)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCouriers = () => (
    <div className="space-y-6" id="parcego-admin-couriers-section">
      <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Manage Couriers</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" id="parcego-couriers-filter-btn">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" id="parcego-couriers-search-btn">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Card id="parcego-couriers-table-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Courier</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Deliveries</th>
                  <th className="text-left p-4">Vehicle</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCouriers.map((courier) => (
                  <tr key={courier.id} className="border-b hover:bg-gray-50" id={`parcego-courier-row-${courier.id}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{courier.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{courier.fullName}</p>
                          <p className="text-sm text-gray-500">ID: {courier.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm">{courier.email}</p>
                        <p className="text-sm text-gray-500">{courier.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(courier.status)}
                    </td>
                    <td className="p-4">
                      {courier.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="font-medium">{courier.rating}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4">{courier.completedDeliveries.toLocaleString()}</td>
                    <td className="p-4">{courier.vehicle}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          id={`parcego-courier-view-${courier.id}`}
                          onClick={() => console.log(`View courier ${courier.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          id={`parcego-courier-edit-${courier.id}`}
                          onClick={() => console.log(`Edit courier ${courier.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {courier.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600" 
                            id={`parcego-courier-verify-${courier.id}`}
                            onClick={() => console.log(`Verify courier ${courier.id}`)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {courier.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600" 
                            id={`parcego-courier-deactivate-${courier.id}`}
                            onClick={() => console.log(`Deactivate courier ${courier.id}`)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6" id="parcego-admin-analytics-section">
                    <h2 className="text-xl font-bold">Platform Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="parcego-analytics-revenue-chart">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Revenue Chart Placeholder</p>
                <p className="text-sm">Monthly revenue growth +15%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-analytics-shipment-chart">
          <CardHeader>
            <CardTitle>Shipment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Shipment Chart Placeholder</p>
                <p className="text-sm">Daily average: 850 shipments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-analytics-geographic-chart">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p>Geographic Chart Placeholder</p>
                <p className="text-sm">Top markets: NY, CA, TX</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-analytics-performance-chart">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                <p>Performance Chart Placeholder</p>
                <p className="text-sm">On-time delivery: 96.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="parcego-admin-settings-section">
                    <h2 className="text-xl font-bold">Platform Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="parcego-settings-general">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Platform Maintenance Mode</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Configure maintenance mode')}>Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>API Rate Limiting</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Manage API rate limiting')}>Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Email notification settings')}>Settings</Button>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-settings-security">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Two-Factor Authentication</span>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Security</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Configure API security')}>Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Access Logs</span>
              <Button variant="outline" size="sm" onClick={() => console.log('View access logs')}>View</Button>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-settings-billing">
          <CardHeader>
            <CardTitle>Billing & Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Payment Gateway</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Stripe settings')}>Stripe Settings</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Commission Rates</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Configure commission rates')}>Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Payout Schedule</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Manage payout schedule')}>Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card id="parcego-settings-support">
          <CardHeader>
            <CardTitle>Support & Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Help Documentation</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Manage help documentation')}>Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Support Tickets</span>
              <Button variant="outline" size="sm" onClick={() => console.log('View support ticket queue')}>View Queue</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>System Status Page</span>
              <Button variant="outline" size="sm" onClick={() => console.log('Configure system status page')}>Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" id="parcego-admin-dashboard-container">
      {/* Header */}
      <header className="bg-white border-b border-gray-200" id="parcego-admin-header">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
              id="parcego-admin-back-btn"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
            <div className="hidden md:flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Parcego Admin</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" id="parcego-admin-notifications-btn">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar id="parcego-admin-avatar">
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200" id="parcego-admin-nav">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "merchants", label: "Merchants", icon: Users },
              { key: "couriers", label: "Couriers", icon: Truck },
              { key: "analytics", label: "Analytics", icon: TrendingUp },
              { key: "settings", label: "Settings", icon: Settings }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                id={`parcego-admin-tab-${tab.key}`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6" id="parcego-admin-main-content">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "merchants" && renderMerchants()}
        {activeTab === "couriers" && renderCouriers()}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "settings" && renderSettings()}
      </main>
    </div>
  );
}