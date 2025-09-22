"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export function DashboardSearch() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to shipments page with search query
      window.location.href = `/shipments?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      // Redirect to shipments page with search query
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
          >
            Search
          </Button>
        </form>
        
        {/* Quick Search Suggestions - Right Side */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Quick search:</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSearch("SH002")}
              className="text-xs h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              SH002
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSearch("John Smith")}
              className="text-xs h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              John Smith
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSearch("New York")}
              className="text-xs h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New York
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
