"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { dashboardStats } from "@/lib/mock/dashboard"
import { adminService } from "@/lib/api/admin"
import type { UserStatisticsResponse } from "@/lib/api/types"
import { withReAuth } from "@/lib/utils/re-auth"

interface DashboardStats {
  totalShipments: string
  activeShipments: string
  deliveredToday: string
  revenue: string
}

// Helper function to convert API response to dashboard stats format
const convertApiStatsToDisplay = (apiStats: UserStatisticsResponse): DashboardStats => {
  // Calculate total shipments from all categories
  const total = apiStats.delivered_shipments + 
                apiStats.in_transit_shipments + 
                apiStats.in_warehouse_shipments + 
                apiStats.undelivered_shipments + 
                apiStats.unfulfilled_shipments;

  return {
    totalShipments: total.toString(),
    activeShipments: apiStats.in_transit_shipments.toString(),
    deliveredToday: apiStats.delivered_shipments.toString(),
    revenue: "$2,450" // Keep revenue as mock for now since it's not in the API response
  };
};

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
  }
  // Revenue card removed - was previously here
]

export function StatsCards() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(dashboardStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Use withReAuth to automatically handle 401 errors and re-authenticate
        const response = await withReAuth(async () => {
          return await adminService.getCurrentUserStatistics()
        })
        
        if (response.data) {
          const displayStats = convertApiStatsToDisplay(response.data)
          setStats(displayStats)
        } else {
          throw new Error('No data received from API')
        }
      } catch (error: any) {
        // Check if it's an authentication error (401 or 403)
        const status = error?.status || error?.response?.status;
        const isUnauthorized = status === 401 || status === 403;
        
        if (isUnauthorized) {
          // Clear auth data and redirect to login
          localStorage.removeItem('auth_token')
          document.cookie = "mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          router.push('/login')
          return
        }
        
        // Only log non-auth errors
        console.error('Failed to fetch dashboard stats:', error)
        
        setError('Failed to load statistics')
        // Fallback to mock data
        setStats(dashboardStats)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router])
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
              ) : error ? (
                <div className="text-red-500 text-sm">Error</div>
              ) : (
                stats[stat.key]
              )}
            </div>
            {error && (
              <div className="text-xs text-red-500 mt-1">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
