"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { isValidTrackingNumber, formatTrackingNumber } from "@/lib/mock/tracking"

type TrackingExample = {
  id: string
  number: string
  label: string
  description: string
  status: 'valid' | 'invalid'
  stage?: string
  variant: 'default' | 'destructive' | 'secondary'
}

const trackingExamples: TrackingExample[] = [
  // Valid examples with different stages
  {
    id: 'valid-001',
    number: 'ASH-20250915-PQR678',
    label: 'Label Created',
    description: 'Package label created, ready for drop-off',
    status: 'valid',
    stage: 'LabelCreated',
    variant: 'default'
  },
  {
    id: 'valid-002',
    number: 'ASH-20250911-DEF456',
    label: 'In Transit',
    description: 'Package is currently being transported',
    status: 'valid',
    stage: 'InTransit',
    variant: 'default'
  },
  {
    id: 'valid-003',
    number: 'ASH-20250912-GHI789',
    label: 'Out for Delivery',
    description: 'Package is out for delivery today',
    status: 'valid',
    stage: 'OutForDelivery',
    variant: 'default'
  },
  {
    id: 'valid-004',
    number: 'ASH-20250913-JKL012',
    label: 'Delivered',
    description: 'Package successfully delivered',
    status: 'valid',
    stage: 'Delivered',
    variant: 'default'
  },
  {
    id: 'valid-005',
    number: 'ASH-20250914-MNO345',
    label: 'Failed Delivery',
    description: 'Delivery attempt failed, will retry',
    status: 'valid',
    stage: 'FailedDelivery',
    variant: 'default'
  },
  // Invalid examples
  {
    id: 'invalid-001',
    number: 'ASH-2024-ABC123',
    label: 'Wrong Date Format',
    description: 'Date should be 8 digits (YYYYMMDD)',
    status: 'invalid',
    variant: 'destructive'
  },
  {
    id: 'invalid-002',
    number: 'INVALID-NUMBER',
    label: 'Wrong Prefix',
    description: 'Must start with "ASH-"',
    status: 'invalid',
    variant: 'destructive'
  },
  {
    id: 'invalid-003',
    number: 'ASH-20250910-AB',
    label: 'Code Too Short',
    description: 'End code must be 6 characters',
    status: 'invalid',
    variant: 'destructive'
  },
  {
    id: 'invalid-004',
    number: 'ASH-20250910-ABCDEFGHIJ',
    label: 'Code Too Long',
    description: 'End code must be exactly 6 characters',
    status: 'invalid',
    variant: 'destructive'
  },
  {
    id: 'invalid-005',
    number: 'ASH-20250910-123456',
    label: 'Missing Hyphens',
    description: 'Format: ASH-YYYYMMDD-XXXXXX',
    status: 'invalid',
    variant: 'destructive'
  }
]

const getStatusIcon = (stage?: string) => {
  const iconMap: Record<string, string> = {
    'LabelCreated': 'FileText',
    'InTransit': 'Truck',
    'OutForDelivery': 'Truck',
    'Delivered': 'CircleCheck',
    'FailedDelivery': 'XCircle'
  }
  return iconMap[stage || ''] || 'Package'
}

const getStatusColor = (stage?: string) => {
  const colorMap: Record<string, string> = {
    'LabelCreated': 'text-slate-600',
    'InTransit': 'text-blue-600',
    'OutForDelivery': 'text-amber-600',
    'Delivered': 'text-green-600',
    'FailedDelivery': 'text-red-600'
  }
  return colorMap[stage || ''] || 'text-gray-600'
}

interface TrackingDemoExamplesProps {
  onTrackingSelect?: (trackingNumber: string) => void
}

const TrackingDemoExamples: React.FC<TrackingDemoExamplesProps> = ({ onTrackingSelect }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = async (number: string, id: string) => {
    try {
      await navigator.clipboard.writeText(number)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      
      // Auto-fill the hero tracking input and trigger tracking
      if (onTrackingSelect) {
        onTrackingSelect(number)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = number
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      
      // Auto-fill the hero tracking input and trigger tracking
      if (onTrackingSelect) {
        onTrackingSelect(number)
      }
    }
  }

  const validExamples = trackingExamples.filter(ex => ex.status === 'valid')
  // const invalidExamples = trackingExamples.filter(ex => ex.status === 'invalid')

  return (
    <div id="parcego-tracking-demo-examples" className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Tracking Numbers</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Try these example tracking numbers to test different scenarios. Click &quot;Copy&quot; to quickly paste them into the tracking input above.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
        {/* Valid Examples */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Check" className="w-4 h-4 text-green-600" />
              </div>
              Valid Examples
            </CardTitle>
            <CardDescription className="text-green-700">
              These tracking numbers will show complete shipment timelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {validExamples.map((example) => {
              // const isValid = isValidTrackingNumber(formatTrackingNumber(example.number))
              const isCopied = copiedId === example.id
              
              return (
                <div 
                  key={example.id}
                  className="flex items-center justify-between bg-white border border-green-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(example.stage).replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <Icon name={getStatusIcon(example.stage)} className={`w-4 h-4 ${getStatusColor(example.stage)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          {example.number}
                        </code>
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <Icon name="Check" className="w-3 h-3 mr-1" />
                          Valid
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">{example.label}</h4>
                      <p className="text-xs text-gray-600">{example.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(example.number, example.id)}
                    className="h-8 px-3 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 transition-colors"
                  >
                    {isCopied ? (
                      "Copied!"
                    ) : (
                      "Copy"
                    )}
                  </Button>
                </div>
              )
            })}
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Icon name="Info" className="w-4 h-4" />
                Valid Format Rules:
              </h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Starts with &quot;ASH-&quot;</li>
                <li>• 8-digit date (YYYYMMDD)</li>
                <li>• Hyphen separator</li>
                <li>• 6-character alphanumeric code</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        </div>
      </div>

      {/* Usage Instructions */}
      {/* <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="Lightbulb" className="w-4 h-4 text-blue-600" />
            </div>
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Copy a Number</h4>
                <p className="text-xs text-gray-600">Click the "Copy" button next to any tracking number</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Paste & Track</h4>
                <p className="text-xs text-gray-600">Paste into the tracking input above and click "Track"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">View Results</h4>
                <p className="text-xs text-gray-600">See the timeline or validation error message</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}

export { TrackingDemoExamples }
export default TrackingDemoExamples
