"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { getTrackingData, isValidTrackingNumber, formatTrackingNumber } from "@/lib/mock/tracking"
import { recentShipments } from "@/lib/mock/dashboard"
import type { ShipmentSummary } from "@/lib/mock/tracking"

export function DashboardSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [quickSearchSuggestions, setQuickSearchSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Set up quick search suggestions based on recent shipments data
    const suggestions = recentShipments
      .slice(0, 3) // Take first 3 shipments
      .map(shipment => shipment.id) // Use shipment IDs as suggestions
    
    setQuickSearchSuggestions(suggestions)
  }, [])

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      saveRecentSearch(query)
      
      // Check if it's a valid tracking number
      if (isValidTrackingNumber(query)) {
        const trackingData = getTrackingData(query)
        if (trackingData) {
          // Redirect to tracking page with the tracking number
          window.location.href = `/track-package?tracking=${encodeURIComponent(formatTrackingNumber(query))}`
          return
        }
      }
      
      // Fallback to general shipments search
      window.location.href = `/shipments?q=${encodeURIComponent(query)}`
    }
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    saveRecentSearch(query)
    
    // Check if it's a tracking number and redirect appropriately
    if (isValidTrackingNumber(query)) {
      window.location.href = `/track-package?tracking=${encodeURIComponent(formatTrackingNumber(query))}`
    } else {
      window.location.href = `/shipments?q=${encodeURIComponent(query)}`
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Bar - Left Side */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200" 
            />
            <Input
              type="text"
              placeholder="Search shipments, tracking numbers, or recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-base"
              aria-label="Search dashboard"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
          >
            Search
          </Button>
        </form>
        
        {/* Quick Search Suggestions - Right Side */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Quick search:</span>
          <div className="flex flex-wrap gap-2">
            {quickSearchSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickSearch(suggestion)}
                className="text-xs h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-gray-600">Recent searches:</span>
          {recentSearches.map((search) => (
            <Button
              key={search}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSearch(search)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {search}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
