"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { recentShipments } from "@/lib/mock/dashboard"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { Shipment } from "@/lib/mock/shipments"

interface RecentShipment {
  id: string
  recipient: string
  location: string
  date: string
  cost: string
  status: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "CheckCircle"
    case "IN TRANSIT":
    case "IN_TRANSIT":
      return "Clock"
    case "PENDING":
    case "LABEL_CREATED":
      return "AlertCircle"
    case "FAILED":
    case "CANCELLED":
      return "XCircle"
    case "OUT_FOR_DELIVERY":
      return "Truck"
    default:
      return "Package"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-800 border-emerald-200"
    case "IN TRANSIT":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-50 text-blue-800 border-blue-200"
    case "PENDING":
    case "LABEL_CREATED":
      return "bg-amber-50 text-amber-800 border-amber-200"
    case "FAILED":
    case "CANCELLED":
      return "bg-red-50 text-red-800 border-red-200"
    default:
      return "bg-slate-50 text-slate-700 border-slate-300"
  }
}

export function RecentShipments() {
  const [downloadingShipments, setDownloadingShipments] = useState<Set<string>>(new Set())
  const [selectedShipment, setSelectedShipment] = useState<RecentShipment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shipments, setShipments] = useState<RecentShipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentShipments()
  }, [])

  const fetchRecentShipments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Try to fetch from shipping API (if available)
      // For now, we'll simulate an API call and use mock data as fallback
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      // Transform mock data to match our interface
      const transformedShipments: RecentShipment[] = recentShipments.map(shipment => ({
        id: shipment.id,
        recipient: shipment.recipient,
        location: shipment.location,
        date: shipment.date,
        cost: shipment.cost,
        status: shipment.status
      }))
      
      setShipments(transformedShipments)
    } catch (err) {
      console.error('Error fetching recent shipments:', err)
      setError('Failed to load recent shipments')
      // Fallback to mock data
      const transformedShipments: RecentShipment[] = recentShipments.map(shipment => ({
        id: shipment.id,
        recipient: shipment.recipient,
        location: shipment.location,
        date: shipment.date,
        cost: shipment.cost,
        status: shipment.status
      }))
      setShipments(transformedShipments)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewShipment = (shipment: RecentShipment) => {
    setSelectedShipment(shipment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedShipment(null)
  }

  const handleDownloadShipment = async (shipment: RecentShipment) => {
    const shipmentId = shipment.id
    
    // Prevent multiple downloads of the same shipment
    if (downloadingShipments.has(shipmentId)) return
    
    setDownloadingShipments(prev => new Set(prev).add(shipmentId))
    
    // Generate shipment summary content
    const shipmentContent = `SHIPMENT SUMMARY

Shipment ID: ${shipment.id}
Status: ${shipment.status}
Recipient: ${shipment.recipient}
Location: ${shipment.location}
Date: ${shipment.date}
Cost: ${shipment.cost}

Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}

---
Parcego Courier Business Platform
Generated automatically for your records`
    
    try {
      // Create and download the file
      const blob = new Blob([shipmentContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `shipment-${shipment.id}-summary.txt`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error downloading shipment summary:', error)
      // Fallback: try to open in new tab with data URL
      try {
        const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(shipmentContent)}`
        window.open(dataUrl, '_blank')
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError)
        // Last resort: show content in alert
        alert(`Shipment Summary:\n\n${shipmentContent}`)
      }
    } finally {
      setDownloadingShipments(prev => {
        const newSet = new Set(prev)
        newSet.delete(shipmentId)
        return newSet
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Shipments
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your latest shipping activity.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-3 w-28 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8">
              <Icon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchRecentShipments} variant="outline">
                <Icon name="RefreshCw" className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : shipments.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <Icon name="Package" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No recent shipments found</p>
              <Button onClick={() => window.location.href = '/create-shipment'} variant="outline">
                <Icon name="Plus" className="h-4 w-4 mr-2" />
                Create First Shipment
              </Button>
            </div>
          ) : (
            // Shipments list
            <>
              {shipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {shipment.id}
                      </span>
                      <Badge className={getStatusColor(shipment.status)}>
                        <Icon 
                          name={getStatusIcon(shipment.status)} 
                          size={14} 
                          className="mr-1" 
                        />
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{shipment.recipient}</div>
                      <div className="text-gray-500">{shipment.location}</div>
                      <div className="text-gray-500">
                        {shipment.date} • {shipment.cost}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      aria-label={`View shipment ${shipment.id}`}
                      onClick={() => handleViewShipment(shipment)}
                      id={`parcego-recent-shipments-view-${shipment.id}`}
                      title={`View details for shipment ${shipment.id}`}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      aria-label={`Download shipment ${shipment.id}`}
                      onClick={() => handleDownloadShipment(shipment)}
                      disabled={downloadingShipments.has(shipment.id)}
                      id={`parcego-recent-shipments-download-${shipment.id}`}
                      title={`Download summary for shipment ${shipment.id}`}
                    >
                      {downloadingShipments.has(shipment.id) ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <Icon name="Download" size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/shipments'}
                >
                  View All Shipments
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Shipment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Icon name="Package" size={20} className="text-blue-600" />
              <span>Shipment Details</span>
            </DialogTitle>
            <DialogDescription>
              Detailed information for shipment {selectedShipment?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="space-y-4 py-4">
              {/* Shipment ID and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {selectedShipment.id}
                  </span>
                  <Badge className={getStatusColor(selectedShipment.status)}>
                    <Icon 
                      name={getStatusIcon(selectedShipment.status)} 
                      size={14} 
                      className="mr-1" 
                    />
                    {selectedShipment.status}
                  </Badge>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Icon name="User" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recipient</h4>
                    <p className="text-sm text-gray-900">{selectedShipment.recipient}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Icon name="MapPin" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                    <p className="text-sm text-gray-900">{selectedShipment.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Icon name="Calendar" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Date</h4>
                    <p className="text-sm text-gray-900">{selectedShipment.date}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Icon name="DollarSign" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Cost</h4>
                    <p className="text-sm text-gray-900 font-medium">{selectedShipment.cost}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadShipment(selectedShipment)}
                  disabled={downloadingShipments.has(selectedShipment.id)}
                  className="flex-1 h-10"
                  id={`parcego-modal-download-${selectedShipment.id}`}
                >
                  {downloadingShipments.has(selectedShipment.id) ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Icon name="Download" size={16} className="mr-2" />
                      Download Summary
                    </>
                  )}
                </Button>
                
                <Button
                  variant="default"
                  onClick={handleCloseModal}
                  className="flex-1 h-10"
                  id={`parcego-modal-close-${selectedShipment.id}`}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
