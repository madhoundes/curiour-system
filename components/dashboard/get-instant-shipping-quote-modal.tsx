"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@/components/ui/icon"
import { api } from "@/lib/api"
import type { QuoteEstimateRequest } from "@/lib/api/types"
import { useShipment } from "@/lib/shipment-context"
import { toast } from "sonner"

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
  const [postalCodeError, setPostalCodeError] = useState<string>("")

  // Postal code validation functions
  const isTorontoPostalCode = (postalCode: string): boolean => {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('M')) {
      return false;
    }
    const digit1 = parseInt(normalized.charAt(1));
    return digit1 >= 1 && digit1 <= 9;
  };

  const isMississaugaPostalCode = (postalCode: string): boolean => {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('L')) {
      return false;
    }
    const fsa = normalized.substring(0, 3);
    const digit1 = parseInt(fsa.charAt(1));
    const letter2 = fsa.charAt(2);
    
    if (digit1 === 4) {
      return ['T', 'W', 'X', 'Y', 'Z'].includes(letter2);
    }
    if (digit1 === 5) {
      return ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'].includes(letter2);
    }
    return false;
  };

  const isPostalCodeInServiceArea = (postalCode: string): boolean => {
    return isTorontoPostalCode(postalCode) || isMississaugaPostalCode(postalCode);
  };

  const validatePostalCode = (postalCode: string): string | null => {
    if (!postalCode || postalCode.trim() === '') {
      return 'Postal code is required';
    }

    // Basic format validation
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!canadianPostalCodeRegex.test(postalCode.trim())) {
      return 'Invalid postal code format. Please use format A1A 1A1';
    }

    // Check if postal code is in service area
    if (!isPostalCodeInServiceArea(postalCode)) {
      return 'This postal code is not in our service area. Delivery is only available in Downtown Toronto (M prefix) and Mississauga (L4T-L5W prefix).';
    }

    return null;
  };

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate postal code when it changes
    if (field === 'destinationPostalCode') {
      const error = validatePostalCode(value);
      setPostalCodeError(error || '');
    }
  }

  const handleGeneratePrice = async () => {
    // Reset previous errors
    setQuoteError("")
    setPostalCodeError("")
    setQuoteGenerated(false)
    setEstimatedCost("")

    // Validate all required fields
    if (!formData.packageSize) {
      setQuoteError("Please select a package size")
      return
    }

    if (!formData.weight) {
      setQuoteError("Please enter package weight")
      return
    }

    // Validate weight is a positive number
    const weight = parseFloat(formData.weight)
    if (isNaN(weight) || weight <= 0) {
      setQuoteError("Weight must be a positive number")
      return
    }

    if (weight > 50) {
      setQuoteError("Weight cannot exceed 50 kg. For heavier packages, please contact support.")
      return
    }

    if (!formData.destinationPostalCode) {
      setQuoteError("Please enter destination postal code")
      return
    }

    // Validate postal code format and service area
    const postalCodeValidationError = validatePostalCode(formData.destinationPostalCode);
    if (postalCodeValidationError) {
      setPostalCodeError(postalCodeValidationError);
      setQuoteError(postalCodeValidationError);
      return;
    }

    setIsGenerating(true)
    
    try {
      const quoteRequest: QuoteEstimateRequest = {
        package_size: formData.packageSize as 'small' | 'medium' | 'large',
        weight: weight,
        destination_postal_code: formData.destinationPostalCode.trim().toUpperCase()
      }

      console.log('Requesting quote with:', quoteRequest)
      const response = await api.quotes.getEstimate(quoteRequest)
      
      if (!response || typeof response.estimated_price !== 'number') {
        throw new Error('Invalid response from server')
      }

      if (response.estimated_price <= 0) {
        throw new Error('Invalid price calculation')
      }
      
      setEstimatedCost(response.estimated_price.toFixed(2))
      setQuoteGenerated(true)
      console.log('Quote generated successfully:', response)
    } catch (error: any) {
      console.error('Quote generation failed:', error)
      
      // Extract error message from different error formats
      let errorMessage = 'Failed to generate quote. Please try again.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error) {
        errorMessage = error.error
      } else if (error?.details) {
        if (typeof error.details === 'string') {
          errorMessage = error.details
        } else if (Array.isArray(error.details) && error.details.length > 0) {
          errorMessage = error.details[0]?.message || error.details[0]?.msg || String(error.details[0])
        }
      }

      // Check for specific error types
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (errorMessage.toLowerCase().includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (errorMessage.toLowerCase().includes('service area') || 
                 errorMessage.toLowerCase().includes('not in our service area') ||
                 errorMessage.toLowerCase().includes('not supported')) {
        // Service area error - don't fallback to mock calculation
        setQuoteError(errorMessage)
        return;
      } else if (errorMessage.toLowerCase().includes('validation')) {
        // Validation error from API
        setQuoteError(errorMessage)
        return;
      }
      
      // For other errors, show error but provide fallback calculation
      setQuoteError(`${errorMessage} (Showing estimated price)`)
      
      // Fallback to mock calculation for non-service-area errors
      try {
        const baseRate = 15.99
        const weightMultiplier = weight * 2.5
        const sizeMultiplier = formData.packageSize === 'large' ? 1.3 : formData.packageSize === 'medium' ? 1.15 : 1.0
        const distanceFactor = 1.2
        const total = (baseRate + weightMultiplier) * sizeMultiplier * distanceFactor
        
        if (total > 0 && total < 10000) { // Sanity check
          setEstimatedCost(total.toFixed(2))
          setQuoteGenerated(true)
        } else {
          throw new Error('Invalid calculation result')
        }
      } catch (calcError) {
        console.error('Fallback calculation failed:', calcError)
        setQuoteError('Unable to calculate shipping cost. Please try again or contact support.')
      }
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
          {/* Service Area Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>Service Area:</strong> Both <strong>pickup</strong> and <strong>delivery</strong> must be in <strong>Downtown Toronto</strong> or <strong>Mississauga</strong>, Ontario.
              </p>
            </div>
          </div>

          {/* Package Size */}
          <div className="space-y-2">
            <Label htmlFor="parcego-package-size">Package Size <span className="text-red-500">*</span></Label>
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
            {formData.packageSize && (
              <p className="text-xs text-green-600">
                ✓ {packageSizeOptions.find(opt => opt.value === formData.packageSize)?.label} package selected
              </p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="parcego-weight">Weight (kg) <span className="text-red-500">*</span></Label>
            <Input
              id="parcego-weight"
              type="number"
              placeholder="Enter weight in kilograms"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              min="0.1"
              max="50"
              step="0.1"
              className={formData.weight && (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 50) ? 'border-red-500' : ''}
            />
            {formData.weight && parseFloat(formData.weight) > 50 && (
              <p className="text-xs text-red-600">
                Weight cannot exceed 50 kg
              </p>
            )}
            {formData.weight && parseFloat(formData.weight) <= 0 && (
              <p className="text-xs text-red-600">
                Weight must be greater than 0
              </p>
            )}
            {formData.weight && parseFloat(formData.weight) > 0 && parseFloat(formData.weight) <= 50 && (
              <p className="text-xs text-green-600">
                ✓ Valid weight
              </p>
            )}
            {!formData.weight && (
              <p className="text-xs text-gray-500">
                Enter weight between 0.1 and 50 kg
              </p>
            )}
          </div>

          {/* Destination Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="parcego-destination-postal">Destination Postal Code</Label>
            <Input
              id="parcego-destination-postal"
              placeholder="M5V 3A8 (Toronto) or L5A 1B2 (Mississauga)"
              value={formData.destinationPostalCode}
              onChange={(e) => handleInputChange("destinationPostalCode", e.target.value)}
              className={postalCodeError ? 'border-red-500 focus-visible:ring-red-200' : ''}
              aria-invalid={!!postalCodeError}
              aria-describedby={postalCodeError ? 'parcego-destination-postal-error' : undefined}
            />
            {postalCodeError && (
              <p id="parcego-destination-postal-error" className="text-sm text-red-600 mt-1">
                {postalCodeError}
              </p>
            )}
            {!postalCodeError && formData.destinationPostalCode && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Valid postal code for service area
              </p>
            )}
            {!postalCodeError && !formData.destinationPostalCode && (
              <p className="text-xs text-gray-500">
                Enter a postal code in Downtown Toronto (M prefix) or Mississauga (L4T-L5W prefix)
              </p>
            )}
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
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Unable to Generate Quote
                  </p>
                  <p className="text-sm text-red-700 leading-relaxed">{quoteError}</p>
                  {quoteError.toLowerCase().includes('service area') && (
                    <p className="text-xs text-red-600 mt-2">
                      💡 Tip: Make sure both pickup and delivery addresses are in Downtown Toronto or Mississauga.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Calculating shipping cost...</p>
                  <p className="text-xs text-blue-700 mt-1">Please wait while we process your request</p>
                </div>
              </div>
            </div>
          )}

          {/* Estimated Cost Display */}
          {quoteGenerated && estimatedCost && !isGenerating && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Estimated Shipping Cost</span>
                </div>
                <span className="text-3xl font-extrabold text-green-700">${estimatedCost}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-800">
                  ✓ Price includes base rate, weight surcharge, and distance factor
                </p>
                <p className="text-xs text-green-700">
                  📦 {packageSizeOptions.find(opt => opt.value === formData.packageSize)?.label} package • {formData.weight} kg • {formData.destinationPostalCode}
                </p>
              </div>
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
