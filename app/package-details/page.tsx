"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Stepper, createStepperSteps } from "@/components/ui/stepper";

interface ShipmentData {
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
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
  const wizardBack = useWizardBack();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ShipmentData>({
    recipientName: "",
    recipientCompany: "",
    recipientAddress: "",
    recipientCity: "",
    recipientProvince: "",
    recipientPostalCode: "",
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
    localStorage.setItem('shipmentFormData', JSON.stringify(formData));
    wizardBack();
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

  const stepperSteps = createStepperSteps(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Package Details"
          description="Review and confirm your package information"
          icon="Package"
          onBack={handleBackToShipmentDetails}
          backLabel=""
        />

        {/* Stepper Component - Added here */}
        <div className="mb-8">
          <Stepper 
            steps={stepperSteps} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        <div className="space-y-8">

          {/* Package Dimensions */}
          <Card className="parcego-card parcego-card--dimensions">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span aria-hidden>📏</span>
                <span>Package Dimensions</span>
              </CardTitle>
              <CardDescription>
                Enter the exact dimensions of your package for accurate shipping quotes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dimension Unit Selector - Moved to right side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Measurement Unit</Label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'in', label: 'Inches' },
                      { value: 'cm', label: 'Centimeters' }
                    ].map((unit) => (
                      <button
                        key={unit.value}
                        type="button"
                        onClick={() => handleInputChange('dimensionUnit', unit.value)}
                        className={`parcego-dimension-unit__btn px-4 py-2 border-2 rounded-lg transition-all duration-300 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData.dimensionUnit === unit.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        id={`parcego-dimension-unit-${unit.value}`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="parcego-package-length" className="text-sm font-medium text-gray-700">Length *</Label>
                  <div className="relative">
                    <Input
                      id="parcego-package-length"
                      type="number"
                      placeholder="12"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      className="parcego-form__input pr-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="parcego-package-width" className="text-sm font-medium text-gray-700">Width *</Label>
                  <div className="relative">
                    <Input
                      id="parcego-package-width"
                      type="number"
                      placeholder="8"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      className="parcego-form__input pr-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="parcego-package-height" className="text-sm font-medium text-gray-700">Height *</Label>
                  <div className="relative">
                    <Input
                      id="parcego-package-height"
                      type="number"
                      placeholder="6"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="parcego-form__input pr-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      {formData.dimensionUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Package Preview */}
              {formData.length && formData.width && formData.height && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300 ease-out hover:shadow-md">
                  <div className="flex items-center space-x-3 text-blue-700">
                    <Icon name="Package" size={18} />
                    <span className="font-medium">Package Preview: {formData.length} × {formData.width} × {formData.height} {formData.dimensionUnit}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Weight */}
          <Card className="parcego-card parcego-card--weight">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span aria-hidden>⚖️</span>
                <span>Package Weight</span>
              </CardTitle>
              <CardDescription>
                Accurate weight is essential for shipping cost calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight Unit Selector - Moved to right side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Weight Unit</Label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'lbs', label: 'Pounds (lbs)' },
                      { value: 'kg', label: 'Kilograms (kg)' }
                    ].map((unit) => (
                      <button
                        key={unit.value}
                        type="button"
                        onClick={() => handleInputChange('weightUnit', unit.value)}
                        className={`parcego-weight-unit__btn px-4 py-2 border-2 rounded-lg transition-all duration-300 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          formData.weightUnit === unit.value
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        id={`parcego-weight-unit-${unit.value}`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-3">
                <Label htmlFor="parcego-package-weight" className="text-sm font-medium text-gray-700">Package Weight *</Label>
                <div className="relative max-w-xs">
                  <Input
                    id="parcego-package-weight"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="parcego-form__input pr-16 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    {formData.weightUnit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Handling */}
          <Card className="parcego-card parcego-card--special-handling">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span aria-hidden>🛡️</span>
                <span>Special Handling</span>
              </CardTitle>
              <CardDescription>
                Select any special handling requirements for your package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Special Handling Options */}
              <div className="space-y-4">
                {[
                  {
                    key: 'fragile',
                    label: 'Fragile Item',
                    desc: 'Package contains breakable items requiring careful handling',
                    iconName: 'AlertTriangle',
                    color: '#ea580c'
                  },
                  {
                    key: 'insurance',
                    label: 'Additional Insurance',
                    desc: 'Add extra insurance coverage for this shipment',
                    iconName: 'Shield',
                    color: '#2563eb'
                  }
                ].map((option) => {
                  return (
                    <div key={option.key} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                      <input
                        type="checkbox"
                        id={`parcego-special-${option.key}`}
                        checked={formData[option.key as keyof ShipmentData] as boolean}
                        onChange={(e) => handleInputChange(option.key, e.target.checked)}
                        className="parcego-form__checkbox mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Icon 
                            name={option.iconName as "AlertTriangle" | "DollarSign" | "Shield"}
                            size={18}
                            style={{ color: option.color }}
                          />
                          <label 
                            htmlFor={`parcego-special-${option.key}`}
                            className="font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-200"
                          >
                            {option.label}
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{option.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Package Summary */}
          {isFormValid() && (
            <Card className="parcego-card parcego-card--summary border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300 ease-out">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-green-800">
                  <Icon name="Package" size={20} />
                  <span>Package Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <span className="font-medium text-green-800">Dimensions:</span>
                    <span className="ml-2 text-green-700">
                      {formData.length} × {formData.width} × {formData.height} {formData.dimensionUnit}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-green-800">Weight:</span>
                    <span className="ml-2 text-green-700">
                      {formData.weight} {formData.weightUnit}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-green-800">Package Type:</span>
                    <span className="ml-2 text-green-700 capitalize">
                      {formData.packageType}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-green-800">Service:</span>
                    <span className="ml-2 text-green-700 capitalize">
                      {formData.serviceType}
                    </span>
                  </div>
                  {(formData.fragile || formData.insurance) && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-800">Special Handling:</span>
                      <span className="ml-2 text-green-700">
                        {[
                          formData.fragile && 'Fragile',
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
          <div className="flex justify-end items-center pt-8 border-t border-gray-200">
            <Button
              onClick={handleContinueToQuote}
              disabled={isLoading || !isFormValid()}
              className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id="parcego-continue-quote-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  Get Shipping Quote
                  <Icon name="ArrowRight" size={18} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
