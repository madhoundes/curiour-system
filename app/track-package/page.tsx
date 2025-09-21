"use client"

import React, { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TrackingTimeline } from "@/components/tracking/tracking-timeline"
import { formatTrackingNumber, isValidTrackingNumber, getTrackingData } from "@/lib/mock/tracking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import ProofOfDeliveryGallery from "@/components/tracking/proof-of-delivery-gallery"
import TrackingDemoExamples from "@/components/tracking/tracking-demo-examples"

const DEFAULT_TRACKING = "ASH-20250910-ABC123"

function TrackPackageContent() {
  const router = useRouter()
  const search = useSearchParams()
  const initial = formatTrackingNumber(search.get("tracking") || DEFAULT_TRACKING)
  const [tracking, setTracking] = React.useState<string>(initial)
  const [heroTracking, setHeroTracking] = React.useState<string>("")
  const [showTimeline, setShowTimeline] = React.useState<boolean>(true)
  interface TrackingEvent {
    id: string;
    type: string;
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }

  interface TrackingSummary {
    status: string;
    eta: string;
    origin: string;
    destination: string;
    carrier: string;
    lastUpdate: string;
    hasPOD: boolean;
  }

  const [trackingData, setTrackingData] = React.useState<{ events: TrackingEvent[]; summary: TrackingSummary } | null>(null)

  React.useEffect(() => {
    const isValid = isValidTrackingNumber(initial)
    setShowTimeline(isValid)
    
    if (isValid) {
      const data = getTrackingData(initial)
      setTrackingData(data)
    } else {
      setTrackingData(null)
    }
  }, [initial])

  const handleSubmit = (tn: string) => {
    const formatted = formatTrackingNumber(tn)
    setTracking(formatted)
    setHeroTracking(formatted) // Also update the hero input
    
    const isValid = isValidTrackingNumber(formatted)
    setShowTimeline(isValid)
    
    if (isValid) {
      const data = getTrackingData(formatted)
      setTrackingData(data)
    } else {
      setTrackingData(null)
    }
    
    router.push(`/track-package?tracking=${encodeURIComponent(formatted)}`)
  }

  const handleHeroSubmit = () => {
    if (!heroTracking.trim()) return
    const formatted = formatTrackingNumber(heroTracking)
    handleSubmit(formatted)
  }

  const handleHeroKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleHeroSubmit()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header id="parcego-tracking-header" className="container mx-auto max-w-7xl px-4 py-6 flex items-center gap-3">
        <Button id="parcego-tracking-back-btn" variant="ghost" size="sm" aria-label="Back to dashboard" onClick={() => router.push('/dashboard')}>
          <Icon name="ArrowLeft" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Track Package</h1>
      </header>

      {/* Hero Banner */}
      <section className="container mx-auto max-w-7xl px-4 pb-8 pt-8">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-8 py-12 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-700/90" />
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Track Your Shipment
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Enter your tracking number to get real-time updates and delivery status
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1">
                <Input
                  id="parcego-hero-tracking-input"
                  value={heroTracking}
                  onChange={(e) => setHeroTracking(e.target.value)}
                  onKeyDown={handleHeroKeyDown}
                  placeholder="ASH-20250910-ABC123"
                  className="h-12 text-base bg-white border-0 shadow-lg text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <Button
                id="parcego-hero-track-btn"
                onClick={handleHeroSubmit}
                disabled={!heroTracking.trim()}
                size="lg"
                className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Icon name="Search" className="mr-2" />
                Track
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Examples Section */}
      <section className="container mx-auto max-w-7xl px-4 pb-8">
        <TrackingDemoExamples onTrackingSelect={handleSubmit} />
      </section>

      {showTimeline && trackingData ? (
        <section className="container mx-auto max-w-7xl px-4 pb-16">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Main Timeline */}
            <div className="space-y-6">
              <TrackingTimeline events={trackingData.events} currentStatus={trackingData.summary.status} estimatedDelivery={trackingData.summary.eta} />
            </div>
            
            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Shipment Summary Card */}
              <div id="parcego-tracking-summary-card" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="Package" className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Shipment Details</h3>
                      <p className="text-sm text-gray-500">#{tracking}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Origin</span>
                    <span className="text-sm font-semibold text-gray-900">{trackingData.summary.origin}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Destination</span>
                    <span className="text-sm font-semibold text-gray-900">{trackingData.summary.destination}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Carrier</span>
                    <span className="text-sm font-semibold text-gray-900">{trackingData.summary.carrier}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-medium text-gray-600">Last Update</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(trackingData.summary.lastUpdate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Proof of Delivery Gallery */}
              <ProofOfDeliveryGallery hasPOD={trackingData.summary.hasPOD} />
            </aside>
          </div>
        </section>
      ) : (
        <section className="container mx-auto max-w-7xl px-4 pb-16">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Search" className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tracking Data</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter tracking number (ASH-YYYYMMDD-XXXXXX) to view shipment details.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

export default function TrackPackagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    }>
      <TrackPackageContent />
    </Suspense>
  )
}

