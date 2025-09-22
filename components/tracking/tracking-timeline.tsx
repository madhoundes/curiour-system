"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { TrackingEvent, ShipmentStatus, statusBadgeTone, typeToIcon } from "@/lib/mock/tracking"

type TrackingTimelineProps = {
  id?: string
  events: TrackingEvent[]
  currentStatus: ShipmentStatus
  estimatedDelivery?: string
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ id = "parcego-tracking-timeline", events, currentStatus, estimatedDelivery }) => {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sorted = React.useMemo(() => [...events].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)), [events])

  // Enhanced icon mapping with proper Lucide icon names
  const getStatusIcon = (eventType: string, statusAfter: ShipmentStatus) => {
    const iconMap: Record<string, string> = {
      'LABEL_CREATED': 'FileText',
      'DROP_OFF_CONFIRMED': 'MapPin',
      'SCANNED_AT_FACILITY': 'ScanBarcode',
      'IN_TRANSIT_DEPARTED': 'Truck',
      'IN_TRANSIT_ARRIVED': 'Warehouse',
      'OUT_FOR_DELIVERY': 'Truck',
      'DELIVERY_ATTEMPTED': 'Clock',
      'DELIVERY_FAILED': 'CircleX',
      'DELIVERED': 'CircleCheck',
      'RETURNED_TO_SENDER': 'RotateCcw',
      'POD_UPLOADED': 'Camera',
      'NOTE_ADDED': 'MessageSquare'
    }
    return iconMap[eventType] || 'Circle'
  }

  // Get status-specific colors for icons
  const getStatusIconColor = (statusAfter: ShipmentStatus, isCurrent: boolean) => {
    if (isCurrent) return 'text-blue-600'
    
    const colorMap: Record<ShipmentStatus, string> = {
      'LabelCreated': 'text-slate-500',
      'DropoffConfirmed': 'text-indigo-500',
      'ReceivedAtFacility': 'text-violet-500',
      'InTransit': 'text-blue-500',
      'OutForDelivery': 'text-amber-500',
      'DeliveryAttempted': 'text-orange-500',
      'Delivered': 'text-green-500',
      'FailedDelivery': 'text-red-500',
      'ReturnedToSender': 'text-rose-500',
      'Cancelled': 'text-gray-500'
    }
    return colorMap[statusAfter] || 'text-gray-500'
  }

  return (
    <Card id={id} className="w-full border border-gray-200 rounded-2xl shadow-sm">
      <CardContent className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="MapPin" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Shipment Timeline</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Current status:</span>
                <Badge className={`${statusBadgeTone[currentStatus].bg} ${statusBadgeTone[currentStatus].text} border-transparent font-medium`}>
                  {currentStatus.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
            </div>
          </div>
          {estimatedDelivery && (
            <div aria-label="Estimated delivery" className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">ETA</div>
              <div className="text-sm font-semibold text-gray-900">
                {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
        <ol className="space-y-6">
          {sorted.map((evt, idx) => {
            const isLast = idx === sorted.length - 1
            const iconName = getStatusIcon(evt.type, evt.statusAfter)
            const isCurrent = evt.statusAfter === currentStatus
            const iconColor = getStatusIconColor(evt.statusAfter, isCurrent)
            
            return (
              <li 
                key={evt.id} 
                id={`parcego-tracking-timeline-item-${evt.id}`} 
                className={`grid grid-cols-[40px_1fr] gap-4 group cursor-pointer ${reducedMotion ? '' : 'transition-all duration-200 hover:bg-gray-50/50 rounded-lg p-2 -m-2'}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full bg-white border-2 grid place-items-center relative
                    ${isCurrent 
                      ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] bg-blue-50' 
                      : 'border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50/30'
                    }
                    ${reducedMotion ? '' : 'transition-all duration-200 group-hover:scale-110 group-hover:shadow-md'}
                  `}>
                    <Icon 
                      name={iconName} 
                      size={20} 
                      className={`${iconColor} ${reducedMotion ? '' : 'transition-all duration-200 group-hover:scale-110'}`} 
                    />
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  {!isLast && (
                    <div className={`flex-1 w-0.5 mt-3 transition-colors duration-200 ${isCurrent ? 'bg-blue-200' : 'bg-gray-200 group-hover:bg-blue-300'}`} aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col gap-2 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="font-semibold text-gray-900 text-base group-hover:text-gray-700 transition-colors duration-200">
                      {evt.type.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())}
                    </h4>
                    <Badge className={`${statusBadgeTone[evt.statusAfter].bg} ${statusBadgeTone[evt.statusAfter].text} text-xs font-medium w-fit`}>
                      {evt.statusAfter.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600">
                    <span className="font-medium">
                      {new Date(evt.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {evt.location && (
                      <>
                        <span className="hidden sm:inline text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <Icon name="MapPin" size={14} className="text-gray-400" />
                          <span>{evt.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {evt.details && (
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 mt-2 group-hover:bg-gray-100 transition-colors duration-200">
                      {evt.details}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export default TrackingTimeline


