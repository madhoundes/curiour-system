"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { adminService } from "@/lib/api/admin"
import type { UserStatisticsResponse } from "@/lib/api/types"
import { withReAuth } from "@/lib/utils/re-auth"

interface PerformanceMetric {
  metric: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon: string
  description: string
}

// Helper function to calculate performance metrics from API data
function calculatePerformanceMetrics(data: UserStatisticsResponse): PerformanceMetric[] {
  const totalShipments = data.delivered_shipments + data.in_transit_shipments + data.unfulfilled_shipments + data.undelivered_shipments + data.in_warehouse_shipments
  const deliveredPercentage = totalShipments > 0 ? ((data.delivered_shipments / totalShipments) * 100).toFixed(1) : "0.0"
  const inTransitPercentage = totalShipments > 0 ? ((data.in_transit_shipments / totalShipments) * 100).toFixed(1) : "0.0"
  const undeliveredPercentage = totalShipments > 0 ? ((data.undelivered_shipments / totalShipments) * 100).toFixed(1) : "0.0"
  
  return [
    {
      metric: "Delivery Success Rate",
      value: `${deliveredPercentage}%`,
      change: "N/A", // No historical data available
      changeType: "positive",
      icon: "Clock",
      description: "of total shipments"
    },
    {
      metric: "Active Shipments",
      value: `${inTransitPercentage}%`,
      change: "N/A", // No historical data available
      changeType: "positive",
      icon: "Truck",
      description: "currently in transit"
    },
    {
      metric: "Undelivered Rate",
      value: `${undeliveredPercentage}%`,
      change: "N/A", // No historical data available
      changeType: undeliveredPercentage === "0.0" ? "positive" : "negative",
      icon: "RotateCcw",
      description: "failed deliveries"
    },
    {
      metric: "Total Shipments",
      value: totalShipments.toString(),
      change: "N/A", // No historical data available
      changeType: "positive",
      icon: "Star",
      description: "all time"
    }
  ]
}

export function PerformanceSummary() {
  const router = useRouter()
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use withReAuth to automatically handle 401 errors and re-authenticate
        const response = await withReAuth(async () => {
          return await adminService.getCurrentUserStatistics()
        })
        
        const metrics = calculatePerformanceMetrics(response.data)
        setPerformanceData(metrics)
      } catch (err: any) {
        // Check if it's an authentication error (401 or 403)
        const status = err?.status || err?.response?.status;
        const isUnauthorized = status === 401 || status === 403;
        
        if (isUnauthorized) {
          // Clear auth data and redirect to login
          localStorage.removeItem('auth_token')
          document.cookie = "mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          router.push('/login')
          return
        }
        
        // Only log non-auth errors
        console.error('Failed to fetch performance data:', err)
        
        setError('Failed to load performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [router])
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Performance Summary
        </CardTitle>
        <p className="text-sm text-gray-600">
          Key metrics and trends for your shipping operations.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading performance data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceData.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <Icon name={item.icon} size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {item.metric}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {item.value}
                    </span>
                    <span className={`text-sm font-medium ${
                      item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
