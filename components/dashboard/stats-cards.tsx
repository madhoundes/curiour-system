"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { dashboardStats } from "@/lib/mock/dashboard"

const statsConfig = [
  {
    title: "Total Shipments",
    value: dashboardStats.totalShipments,
    icon: "Package",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Active Shipments",
    value: dashboardStats.activeShipments,
    icon: "Clock",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    title: "Delivered Today",
    value: dashboardStats.deliveredToday,
    icon: "CheckCircle",
    iconColor: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Revenue",
    value: dashboardStats.revenue,
    icon: "BarChart3",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50"
  }
]

export function StatsCards() {
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
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
