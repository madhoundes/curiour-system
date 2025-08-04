"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  ArrowRight,
  Package,
  Scale,
  Ruler,
  Shield,
  AlertTriangle,
  DollarSign
} from "lucide-react";

interface ShipmentData {
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
  recipientPhone: string;
  recipientEmail: string;
  packageType: string;
  serviceType: string;
  specialInstructions: string;
  weight: string;
  weightUnit: string;
  length: string;
  width: string;
  height: string;
  dimensionUnit: string;
  fragile: boolean;
  valuable: boolean;
  insurance: boolean;
}

export default function PackageDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ShipmentData>({
    recipientName: "",
    recipientCompany: "",
    recipientAddress: "",
    recipientCity: "",
    recipientState: "",
    recipientZip: "",
    recipientPhone: "",
    recipientEmail: "",
    packageType: "box",
    serviceType: "standard",
    specialInstructions: "",
    weight: "",
    weightUnit: "lbs",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "in",
    fragile: false,
    valuable: false,
    insurance: false
  });

  // Load previous form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('shipmentFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else {
      // If no saved data, redirect back to create shipment
      router.push('/create-shipment');
    }
  }, [router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToShipmentDetails = () => {
    // Save current data before going back
    localStorage.setItem('shipmentFormData', JSON.stringify(formData));
    router.push('/create-shipment');
  };

  const handleContinueToQuote = () => {
    setIsLoading(true);
    
    // Simulate validation and processing
    setTimeout(() => {
      setIsLoading(false);
      // Store complete form data for quote calculation
      localStorage.setItem('shipmentFormData', JSON.stringify(formData));
      router.push('/quote-preview');
    }, 1000);
  };

  const isFormValid = () => {
    return formData.weight && formData.length && formData.width && formData.height;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToShipmentDetails}
                id="ashraf-package-details-back-btn"
                className="ashraf-nav__back-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shipment Details
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Package Details</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">✓</span>
                </div>
                <span>Shipment Details</span>
              </div>
              <ArrowRight className="h-4 w-4" />
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">2</span>
                </div>
                <span>Package Details</span>
              </div>
              <ArrowRight className="h-4 w-4" />
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">3</span>
                </div>
                <span>Quote & Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Package Dimensions */}
          <Card className="ashraf-card ashraf-card--dimensions">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                <span>Package Dimensions</span>
              </CardTitle>
              <CardDescription>
                Enter the exact dimensions of your package for accurate shipping quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dimension Unit Selector */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Measurement Unit</Label>
                <div className="flex space-x-3">
                  {[
                    { value: 'in', label: 'Inches' },
                    { value: 'cm', label: 'Centimeters' }
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => handleInputChange('dimensionUnit', unit.value)}
                      className={`ashraf-dimension-unit__btn px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                        formData.dimensionUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      id={`ashraf-dimension-unit-${unit.value}`}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-package-length">Length *</Label>
                  <div className="relative">
                    <Input
                      id="ashraf-package-length"
                      type="number"
                      placeholder="12"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      className="ashraf-form__input pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-package-width">Width *</Label>
                  <div className="relative">
                    <Input
                      id="ashraf-package-width"
                      type="number"
                      placeholder="8"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      className="ashraf-form__input pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-package-height">Height *</Label>
                  <div className="relative">
                    <Input
                      id="ashraf-package-height"
                      type="number"
                      placeholder="6"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="ashraf-form__input pr-12"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Package Preview */}
              {formData.length && formData.width && formData.height && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-700 text-sm">
                    <Package className="h-4 w-4" />
                    <span>Package Preview: {formData.length} × {formData.width} × {formData.height} {formData.dimensionUnit}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Weight */}
          <Card className="ashraf-card ashraf-card--weight">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-green-600" />
                <span>Package Weight</span>
              </CardTitle>
              <CardDescription>
                Accurate weight is essential for shipping cost calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weight Unit Selector */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Weight Unit</Label>
                <div className="flex space-x-3">
                  {[
                    { value: 'lbs', label: 'Pounds (lbs)' },
                    { value: 'kg', label: 'Kilograms (kg)' }
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => handleInputChange('weightUnit', unit.value)}
                      className={`ashraf-weight-unit__btn px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                        formData.weightUnit === unit.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      id={`ashraf-weight-unit-${unit.value}`}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <Label htmlFor="ashraf-package-weight">Package Weight *</Label>
                <div className="relative max-w-xs">
                  <Input
                    id="ashraf-package-weight"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="ashraf-form__input pr-16"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {formData.weightUnit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Handling */}
          <Card className="ashraf-card ashraf-card--special-handling">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Special Handling</span>
              </CardTitle>
              <CardDescription>
                Select any special handling requirements for your package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Special Handling Options */}
              <div className="space-y-3">
                {[
                  {
                    key: 'fragile',
                    label: 'Fragile Item',
                    desc: 'Package contains breakable items requiring careful handling',
                    icon: AlertTriangle,
                    color: 'orange'
                  },
                  {
                    key: 'valuable',
                    label: 'High Value Item',
                    desc: 'Package contains valuable items (over $100)',
                    icon: DollarSign,
                    color: 'yellow'
                  },
                  {
                    key: 'insurance',
                    label: 'Additional Insurance',
                    desc: 'Add extra insurance coverage for this shipment',
                    icon: Shield,
                    color: 'blue'
                  }
                ].map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={`ashraf-special-${option.key}`}
                        checked={formData[option.key as keyof ShipmentData] as boolean}
                        onChange={(e) => handleInputChange(option.key, e.target.checked)}
                        className="ashraf-form__checkbox mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`h-4 w-4 text-${option.color}-600`} />
                          <label 
                            htmlFor={`ashraf-special-${option.key}`}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Package Summary */}
          {isFormValid() && (
            <Card className="ashraf-card ashraf-card--summary border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Package className="h-5 w-5" />
                  <span>Package Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-800">Dimensions:</span>
                    <span className="ml-2 text-green-700">
                      {formData.length} × {formData.width} × {formData.height} {formData.dimensionUnit}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Weight:</span>
                    <span className="ml-2 text-green-700">
                      {formData.weight} {formData.weightUnit}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Package Type:</span>
                    <span className="ml-2 text-green-700 capitalize">
                      {formData.packageType}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Service:</span>
                    <span className="ml-2 text-green-700 capitalize">
                      {formData.serviceType}
                    </span>
                  </div>
                  {(formData.fragile || formData.valuable || formData.insurance) && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-800">Special Handling:</span>
                      <span className="ml-2 text-green-700">
                        {[
                          formData.fragile && 'Fragile',
                          formData.valuable && 'High Value',
                          formData.insurance && 'Additional Insurance'
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToShipmentDetails}
              className="ashraf-action-btn ashraf-action-btn--back"
              id="ashraf-back-shipment-details-btn"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shipment Details
            </Button>
            
            <Button
              onClick={handleContinueToQuote}
              disabled={isLoading || !isFormValid()}
              className="ashraf-action-btn ashraf-action-btn--continue"
              id="ashraf-continue-quote-btn"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  Get Shipping Quote
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}