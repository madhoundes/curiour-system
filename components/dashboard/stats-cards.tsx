"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { dashboardStats } from "@/lib/mock/dashboard"

interface DashboardStats {
  totalShipments: string
  activeShipments: string
  deliveredToday: string
  revenue: string
}

const statsConfig = [
  {
    title: "Total Shipments",
    key: "totalShipments" as keyof DashboardStats,
    icon: "Package",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Active Shipments", 
    key: "activeShipments" as keyof DashboardStats,
    icon: "Clock",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    title: "Delivered Today",
    key: "deliveredToday" as keyof DashboardStats,
    icon: "CheckCircle",
    iconColor: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Revenue",
    key: "revenue" as keyof DashboardStats,
    icon: "BarChart3",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50"
  }
]

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>(dashboardStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call - replace with real API when available
        // const response = await api.analyticsService.getDashboardStats()
        
        // For now, use mock data with simulated loading
        await new Promise(resolve => setTimeout(resolve, 1000))
        setStats(dashboardStats)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Fallback to mock data
        setStats(dashboardStats)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <Icon 
                name={stat.icon} 
                size={24} 
                className={stat.iconColor} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                stats[stat.key]
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
