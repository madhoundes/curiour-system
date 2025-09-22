"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { recentActivities } from "@/lib/mock/dashboard"

const getActivityIcon = (type: string) => {
  switch (type) {
    case "shipment":
      return "Truck"
    case "payment":
      return "CreditCard"
    case "announcement":
      return "Megaphone"
    case "system":
      return "Settings"
    case "error":
      return "AlertTriangle"
    default:
      return "Bell"
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "shipment":
      return "text-blue-600"
    case "payment":
      return "text-green-600"
    case "announcement":
      return "text-purple-600"
    case "system":
      return "text-gray-600"
    case "error":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export function RecentActivity() {
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
        {recentActivities.map((activity) => (
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
        ))}
        
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
