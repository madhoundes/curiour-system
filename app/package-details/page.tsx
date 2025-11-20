"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { useShipment } from "@/lib/shipment-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Stepper, createStepperSteps } from "@/components/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PackageDetailsPage() {
  const router = useRouter();
  const wizardBack = useWizardBack();
  const { 
    formData, 
    updateFormField, 
    isFormValid
  } = useShipment();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    updateFormField(field as keyof typeof formData, value);
  };

  const handleBackToShipmentDetails = () => {
    wizardBack();
  };

  const handleContinueToQuote = () => {
    setIsLoading(true);
    
    // Simulate validation and processing
    setTimeout(() => {
      setIsLoading(false);
      router.push('/quote-preview');
    }, 1000);
  };



  const stepperSteps = createStepperSteps(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Package Details"
          description="Enter the package specifications and handling requirements"
        />

        {/* Stepper Component */}
        <div className="mb-8">
          <Stepper 
            steps={stepperSteps} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        <div className="space-y-8">
          
          {/* Package Dimensions & Weight */}
          <Card className="parcego-card parcego-card--dimensions">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Ruler" size={20} className="text-indigo-600" />
                    <span>Package Dimensions & Weight</span>
                  </CardTitle>
                  <CardDescription>
                    Enter the exact measurements and weight of your package
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Clear all package details? This will reset weight, dimensions, and handling options.')) {
                      // Clear package weight and dimensions
                      updateFormField('weight', '');
                      updateFormField('length', '');
                      updateFormField('width', '');
                      updateFormField('height', '');
                      // Reset to defaults
                      updateFormField('weightUnit', 'lbs');
                      updateFormField('dimensionUnit', 'in');
                      updateFormField('fragile', false);
                      updateFormField('valuable', false);
                      updateFormField('insurance', false);
                      updateFormField('packageType', 'box');
                      updateFormField('serviceType', 'standard');
                      updateFormField('specialInstructions', '');
                    }
                  }}
                  className="parcego-package-clear-btn border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                  aria-label="Clear all package details"
                  title="Clear all package fields"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Clear Package
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Package Weight</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-weight" className="h-6 flex items-center  ">Weight *</Label>
                    <Input
                      id="parcego-package-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="2.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="parcego-form__input w-1/2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-weight-unit" className="h-6 flex items-center">Unit</Label>
                    <Select value={formData.weightUnit} onValueChange={(v) => handleInputChange('weightUnit', v)}>
                      <SelectTrigger id="parcego-package-weight-unit" className="w-[45%]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dimensions Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Package Dimensions</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-length" className="h-6 flex items-center">Length *</Label>
                    <Input
                      id="parcego-package-length"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="12"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      className="parcego-form__input w-1/1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-width" className="h-6 flex items-center">Width *</Label>
                    <Input
                      id="parcego-package-width"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="8"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      className="parcego-form__input w-1/1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-height" className="h-6 flex items-center">Height *</Label>
                    <Input
                      id="parcego-package-height"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="6"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="parcego-form__input w-1/1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-dimension-unit" className="h-6 flex items-center">Unit</Label>
                    <Select value={formData.dimensionUnit} onValueChange={(v) => handleInputChange('dimensionUnit', v)}>
                      <SelectTrigger id="parcego-package-dimension-unit" className="w-1/1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Inches (in)</SelectItem>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="ft">Feet (ft)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Handling Options */}
          <Card className="parcego-card parcego-card--handling">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Shield" size={20} className="text-amber-600" />
                <span>Package Handling Options</span>
              </CardTitle>
              <CardDescription>
                Select any special handling requirements for your package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Handling Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="parcego-package-fragile"
                    checked={formData.fragile}
                    onChange={(e) => handleInputChange('fragile', e.target.checked)}
                    className="parcego-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="parcego-package-fragile" className="text-sm font-medium text-gray-700">
                    Fragile - Handle with extra care
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="parcego-package-valuable"
                    checked={formData.valuable}
                    onChange={(e) => handleInputChange('valuable', e.target.checked)}
                    className="parcego-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="parcego-package-valuable" className="text-sm font-medium text-gray-700">
                    Valuable contents - Requires signature
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="parcego-package-insurance"
                    checked={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.checked)}
                    className="parcego-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="parcego-package-insurance" className="text-sm font-medium text-gray-700">
                    Additional insurance coverage
                  </Label>
                </div>
              </div>

              {/* Insurance Amount (if insurance is selected) */}
              {formData.insurance && (
                <div className="space-y-2">
                  <Label htmlFor="parcego-package-insurance-amount">Insurance Amount (CAD)</Label>
                  <Input
                    id="parcego-package-insurance-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    value={formData.insuranceAmount || ''}
                    onChange={(e) => handleInputChange('insuranceAmount', e.target.value)}
                    className="parcego-form__input"
                  />
                  <p className="text-sm text-gray-600">
                    Enter the declared value for additional insurance coverage
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Status */}
          <Card className="parcego-card parcego-card--package-status">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <span>Package Details Completed</span>
              </CardTitle>
              <CardDescription>
                Your package specifications have been recorded and will be included in the final shipping label
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Package" size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Package Information Saved
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  All package details including dimensions, weight, and handling requirements have been saved. 
                  The complete shipping label with all information will be available in the next step.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToShipmentDetails}
              className="parcego-action-btn parcego-action-btn--back"
              id="parcego-back-to-shipment-btn"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Shipment Details
            </Button>
            
            <Button
              onClick={handleContinueToQuote}
              disabled={isLoading || !isFormValid()}
              className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id="parcego-continue-to-quote-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  Continue to Quote Preview
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
