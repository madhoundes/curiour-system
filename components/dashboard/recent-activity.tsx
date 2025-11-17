"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { recentActivities } from "@/lib/mock/dashboard"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface RecentActivity {
  id: number
  type: string
  message: string
  timestamp: string
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "shipment":
    case "delivery":
      return "Truck"
    case "payment":
    case "billing":
      return "CreditCard"
    case "announcement":
    case "notification":
      return "Megaphone"
    case "system":
    case "profile":
      return "Settings"
    case "error":
    case "failed":
      return "AlertTriangle"
    case "quote":
      return "Calculator"
    case "tracking":
      return "MapPin"
    default:
      return "Bell"
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "shipment":
    case "delivery":
    case "tracking":
      return "text-blue-600"
    case "payment":
    case "billing":
      return "text-green-600"
    case "announcement":
    case "notification":
      return "text-purple-600"
    case "system":
    case "profile":
      return "text-gray-600"
    case "error":
    case "failed":
      return "text-red-600"
    case "quote":
      return "text-orange-600"
    default:
      return "text-gray-600"
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentActivities()
  }, [])

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API call for activity feed
      // In a real implementation, this would fetch from a notifications/activity API
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // Transform mock data to match our interface
      const transformedActivities: RecentActivity[] = recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        timestamp: activity.timestamp
      }))
      
      setActivities(transformedActivities)
    } catch (err) {
      setError('Failed to load recent activities')
      // Fallback to mock data
      const transformedActivities: RecentActivity[] = recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        timestamp: activity.timestamp
      }))
      setActivities(transformedActivities)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
        <p className="text-sm text-gray-600">
          Latest updates and notifications.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="text-center py-8">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchRecentActivities}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : activities.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">No recent activity</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchRecentActivities}
            >
              Refresh
            </Button>
          </div>
        ) : (
          // Activity list
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className={`p-2 rounded-lg bg-gray-100 ${getActivityColor(activity.type)}`}>
                <Icon 
                  name={getActivityIcon(activity.type)} 
                  size={16} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/notifications'}
          >
            View All Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
