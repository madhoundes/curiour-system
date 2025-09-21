import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrackingTimeline } from '@/components/tracking/tracking-timeline'
import { PackageDetails } from '@/components/tracking/package-details'
import { TrackingHeader } from '@/components/tracking/tracking-header'
import { TrackingStatus } from '@/components/tracking/tracking-status'

export default function TrackPackagePage() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('ASH-20250101-ABC123')
  const [isTracking, setIsTracking] = useState(false)
  
  const handleTrack = () => {
    setIsTracking(true)
    // Mock tracking logic - in real app this would fetch data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            id="parcego-tracking-back-btn"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Package
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to see real-time updates
          </p>
        </div>

        {/* Tracking Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter tracking number (e.g., ASH-20250101-ABC123)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleTrack}
              disabled={!trackingNumber.trim()}
              className="px-8"
            >
              Track Package
            </Button>
          </div>
        </div>

        {/* Tracking Results */}
        {isTracking && (
          <div className="space-y-6">
            <TrackingStatus trackingNumber={trackingNumber} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrackingTimeline trackingNumber={trackingNumber} />
              </div>
              <div className="lg:col-span-1">
                <PackageDetails trackingNumber={trackingNumber} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}