// Mock data for the merchant dashboard

export interface DashboardStats {
  totalShipments: string
  activeShipments: string
  deliveredToday: string
  revenue: string
}

export interface ShippingTip {
  id: number
  title: string
  description: string
  priority: string
  category: string
  icon: string
}

export interface RecentShipment {
  id: string
  status: 'DELIVERED' | 'IN TRANSIT' | 'PENDING' | 'FAILED'
  recipient: string
  location: string
  date: string
  cost: string
}

export interface RecentActivity {
  id: number
  message: string
  timestamp: string
  type: 'shipment' | 'payment' | 'announcement' | 'system' | 'error'
}

export const dashboardStats: DashboardStats = {
  totalShipments: "127",
  activeShipments: "23",
  deliveredToday: "8",
  revenue: "$2,450"
}

export const shippingTips: ShippingTip[] = [
  {
    id: 1,
    title: "Accurate Weight Saves Money",
    description: "Always weigh your package after packaging to avoid additional charges. Include the weight of all packaging materials in your total.",
    priority: "Medium Priority",
    category: "Cost",
    icon: "Scale"
  },
  {
    id: 2,
    title: "Proper Packaging Prevents Damage",
    description: "Use appropriate packaging materials and ensure items are well-cushioned to prevent damage during transit.",
    priority: "High Priority",
    category: "Safety",
    icon: "Shield"
  },
  {
    id: 3,
    title: "Clear Labeling Ensures Delivery",
    description: "Write addresses clearly and include all necessary information to avoid delivery delays or returns.",
    priority: "High Priority",
    category: "Delivery",
    icon: "Tag"
  },
  {
    id: 4,
    title: "Choose the Right Service Level",
    description: "Select the appropriate shipping service based on urgency and budget. Express shipping costs more but delivers faster.",
    priority: "Medium Priority",
    category: "Cost",
    icon: "Zap"
  },
  {
    id: 5,
    title: "Track Your Shipments",
    description: "Use tracking numbers to monitor your shipments and provide customers with real-time delivery updates.",
    priority: "Low Priority",
    category: "Customer Service",
    icon: "Search"
  }
]

export const recentShipments: RecentShipment[] = [
  {
    id: "SH001",
    status: "DELIVERED",
    recipient: "John Smith",
    location: "New York, NY",
    date: "2024-01-15",
    cost: "$24.50"
  },
  {
    id: "SH002",
    status: "IN TRANSIT",
    recipient: "Sarah Johnson",
    location: "Los Angeles, CA",
    date: "2024-01-15",
    cost: "$18.75"
  },
  {
    id: "SH003",
    status: "PENDING",
    recipient: "Mike Wilson",
    location: "Chicago, IL",
    date: "2024-01-14",
    cost: "$31.20"
  },
  {
    id: "SH004",
    status: "DELIVERED",
    recipient: "Emma Davis",
    location: "Houston, TX",
    date: "2024-01-14",
    cost: "$22.90"
  },
  {
    id: "SH005",
    status: "IN TRANSIT",
    recipient: "David Brown",
    location: "Phoenix, AZ",
    date: "2024-01-13",
    cost: "$28.15"
  }
]

export const recentActivities: RecentActivity[] = [
  {
    id: 1,
    message: "Shipment SH002 is out for delivery",
    timestamp: "2 hours ago",
    type: "shipment"
  },
  {
    id: 2,
    message: "Payment received for shipment SH001",
    timestamp: "4 hours ago",
    type: "payment"
  },
  {
    id: 3,
    message: "New feature: Bulk shipping labels now available",
    timestamp: "1 day ago",
    type: "announcement"
  },
  {
    id: 4,
    message: "System maintenance scheduled for tonight",
    timestamp: "3 hours ago",
    type: "system"
  },
  {
    id: 5,
    message: "Failed to process payment for shipment SH003",
    timestamp: "5 hours ago",
    type: "error"
  },
  {
    id: 6,
    message: "Shipment SH005 picked up by courier",
    timestamp: "6 hours ago",
    type: "shipment"
  },
  {
    id: 7,
    message: "Invoice #INV-2024-001 generated",
    timestamp: "1 day ago",
    type: "payment"
  }
]

export const merchantInfo = {
  name: "John Merchant",
  business_name: "John's Electronics Store",
  email: "john@electronicsstore.com",
  phone: "+1 (555) 123-4567",
  location: "Toronto, ON, Canada"
}
