"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { shippingTips } from "@/lib/mock/dashboard"

export function ShippingTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const currentTip = shippingTips[currentTipIndex]

  const handleTipChange = (index: number) => {
    setCurrentTipIndex(index)
  }

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % shippingTips.length)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High Priority":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium Priority":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low Priority":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-blue-100">
            <Icon name="Lightbulb" size={20} className="text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-blue-900">
              Shipping Tips
            </CardTitle>
            <p className="text-sm text-blue-700">
              Expert advice to optimize your shipments and avoid common mistakes.
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-700"
          onClick={handleNextTip}
          aria-label="Next tip"
        >
          <Icon name="ChevronRight" size={16} />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Current Tip Display */}
        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              {currentTip.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {currentTip.description}
            </p>
            <div className="flex space-x-2">
              <Badge className={getPriorityColor(currentTip.priority)}>
                {currentTip.priority}
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                {currentTip.category}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Carousel Dots */}
        <div className="flex justify-center space-x-2 mt-3">
          {shippingTips.map((tip, index) => (
            <button
              key={tip.id}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentTipIndex ? 'bg-blue-600' : 'bg-blue-300'
              }`}
              onClick={() => handleTipChange(index)}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
