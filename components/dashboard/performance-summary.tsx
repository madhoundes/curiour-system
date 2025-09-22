"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

const performanceData = [
  {
    metric: "On-Time Delivery",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive",
    icon: "Clock",
    description: "vs. last month"
  },
  {
    metric: "Customer Satisfaction",
    value: "4.8/5.0",
    change: "+0.2",
    changeType: "positive",
    icon: "Star",
    description: "vs. last month"
  },
  {
    metric: "Average Delivery Time",
    value: "2.3 days",
    change: "-0.4 days",
    changeType: "positive",
    icon: "Truck",
    description: "vs. last month"
  },
  {
    metric: "Return Rate",
    value: "1.2%",
    change: "-0.3%",
    changeType: "positive",
    icon: "RotateCcw",
    description: "vs. last month"
  }
]

export function PerformanceSummary() {
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
      </CardContent>
    </Card>
  )
}
