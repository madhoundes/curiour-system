"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"
import { api } from "@/lib/api"
import type { QuoteEstimateRequest, QuoteEstimateResponse } from "@/lib/api/types"

interface GetInstantShippingQuoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QuoteFormData {
  packageSize: string
  weight: string
  destinationPostalCode: string
}

interface PackageSizeOption {
  value: string
  label: string
  dimensions: string
}

const packageSizeOptions: PackageSizeOption[] = [
  { value: "small", label: "Small", dimensions: "12x8x4 in" },
  { value: "medium", label: "Medium", dimensions: "16x12x8 in" },
  { value: "large", label: "Large", dimensions: "20x16x12 in" }
]

export function GetInstantShippingQuoteModal({ open, onOpenChange }: GetInstantShippingQuoteModalProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    packageSize: "",
    weight: "",
    destinationPostalCode: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState<string>("")
  const [quoteError, setQuoteError] = useState<string>("")

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGeneratePrice = async () => {
    if (!formData.packageSize || !formData.weight || !formData.destinationPostalCode) {
      return
    }

    setIsGenerating(true)
    setQuoteError("")
    
    try {
      const quoteRequest: QuoteEstimateRequest = {
        package_size: formData.packageSize as 'small' | 'medium' | 'large',
        weight: parseFloat(formData.weight),
        destination_postal_code: formData.destinationPostalCode
      }

      const response = await api.quotes.getEstimate(quoteRequest)
      
      setEstimatedCost(response.estimated_price.toFixed(2))
      setQuoteGenerated(true)
    } catch (error) {
      console.error('Quote generation failed:', error)
      setQuoteError(error instanceof Error ? error.message : 'Failed to generate quote. Please try again.')
      
      // Fallback to mock calculation
      const weight = parseFloat(formData.weight) || 1
      const baseRate = 15.99
      const weightMultiplier = weight * 2.5
      const distanceFactor = 1.2
      const total = (baseRate + weightMultiplier) * distanceFactor
      
      setEstimatedCost(total.toFixed(2))
      setQuoteGenerated(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setFormData({
      packageSize: "",
      weight: "",
      destinationPostalCode: ""
    })
    setQuoteGenerated(false)
    setEstimatedCost("")
    setQuoteError("")
  }

  const handleCreateShipment = () => {
    // Navigate to create shipment page with pre-filled data
    const queryParams = new URLSearchParams({
      packageSize: formData.packageSize,
      weight: formData.weight,
      destinationPostalCode: formData.destinationPostalCode
    })
    window.location.href = `/create-shipment?${queryParams.toString()}`
  }

  const isFormValid = formData.packageSize && formData.weight && formData.destinationPostalCode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Calculator" size={20} className="text-blue-600" />
            Get Instant Shipping Quote
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Enter package details to get an instant price estimate
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Package Size */}
          <div className="space-y-2">
            <Label htmlFor="parcego-package-size">Package Size</Label>
            <Select value={formData.packageSize} onValueChange={(value) => handleInputChange("packageSize", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select package size" />
              </SelectTrigger>
              <SelectContent>
                {packageSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({option.dimensions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="parcego-weight">Weight (lbs)</Label>
            <Input
              id="parcego-weight"
              type="number"
              placeholder="Enter weight in pounds"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              min="0.1"
              step="0.1"
            />
          </div>

          {/* Destination Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="parcego-destination-postal">Destination Postal Code</Label>
            <Input
              id="parcego-destination-postal"
              placeholder="Enter postal code"
              value={formData.destinationPostalCode}
              onChange={(e) => handleInputChange("destinationPostalCode", e.target.value)}
            />
          </div>

          {/* Generate Price Button */}
          <Button
            onClick={handleGeneratePrice}
            disabled={!isFormValid || isGenerating}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-bold"
          >
            <Icon name="Calculator" size={16} className="mr-2" />
            {isGenerating ? "Generating..." : "Generate Price"}
          </Button>

          {/* Error Display */}
          {quoteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{quoteError}</p>
            </div>
          )}

          {/* Estimated Cost Display */}
          {quoteGenerated && estimatedCost && (
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-800">Estimated Shipping Cost:</span>
                <span className="text-3xl font-extrabold text-green-700">${estimatedCost}</span>
              </div>
              <p className="text-xs font-medium text-green-700 mt-1">
                Price includes base rate, weight surcharge, and distance factor
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-10"
          >
            Reset
          </Button>
          <Button
            onClick={handleCreateShipment}
            disabled={!quoteGenerated}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 font-bold"
          >
            Create Shipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
