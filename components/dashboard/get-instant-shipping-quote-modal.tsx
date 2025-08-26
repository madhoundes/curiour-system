"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"

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
  { value: "large", label: "Large", dimensions: "20x16x12 in" },
  { value: "extra-large", label: "Extra Large", dimensions: "24x20x16 in" }
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
    
    // Simulate API call for price calculation
    setTimeout(() => {
      const weight = parseFloat(formData.weight) || 1
      const baseRate = 15.99
      const weightMultiplier = weight * 2.5
      const distanceFactor = 1.2 // Mock distance calculation
      const total = (baseRate + weightMultiplier) * distanceFactor
      
      setEstimatedCost(total.toFixed(2))
      setQuoteGenerated(true)
      setIsGenerating(false)
    }, 1500)
  }

  const handleReset = () => {
    setFormData({
      packageSize: "",
      weight: "",
      destinationPostalCode: ""
    })
    setQuoteGenerated(false)
    setEstimatedCost("")
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
      <DialogContent className="max-w-md">
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

          {/* Estimated Cost Display */}
          {quoteGenerated && estimatedCost && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">Estimated Shipping Cost:</span>
                <span className="text-2xl font-bold text-green-600">${estimatedCost}</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
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
