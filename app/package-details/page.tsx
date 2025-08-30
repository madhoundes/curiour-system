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

export default function PackageDetailsPage() {
  const router = useRouter();
  const wizardBack = useWizardBack();
  const { 
    formData, 
    updateFormField, 
    isFormValid, 
    getShippingLabelData,
    generateTrackingNumber 
  } = useShipment();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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

  const handlePreviewPDF = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required package details before previewing the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = getShippingLabelData();
      // Import dynamically to avoid SSR issues
      const { generateShippingLabelBlob } = await import('@/lib/pdf-generator');
      const blob = await generateShippingLabelBlob(shippingData);
      
      // Create preview URL
      const url = URL.createObjectURL(blob);
      
      // Open in new tab for preview
      window.open(url, '_blank');
      
      // Cleanup URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert('Failed to generate PDF preview. Please try again.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required package details before downloading the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = getShippingLabelData();
      // Import dynamically to avoid SSR issues
      const { generateShippingLabelBlob } = await import('@/lib/pdf-generator');
      const blob = await generateShippingLabelBlob(shippingData);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipping-label-${shippingData.trackingNumber}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsPreviewLoading(false);
    }
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
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Ruler" size={20} className="text-indigo-600" />
                <span>Package Dimensions & Weight</span>
              </CardTitle>
              <CardDescription>
                Enter the exact measurements and weight of your package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Package Weight</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-weight">Weight *</Label>
                    <Input
                      id="parcego-package-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="2.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="parcego-form__input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-weight-unit">Unit</Label>
                    <select
                      id="parcego-package-weight-unit"
                      value={formData.weightUnit}
                      onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      className="parcego-form__select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="g">Grams (g)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dimensions Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Package Dimensions</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-length">Length *</Label>
                    <Input
                      id="parcego-package-length"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="12"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      className="parcego-form__input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-width">Width *</Label>
                    <Input
                      id="parcego-package-width"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="8"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      className="parcego-form__input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-height">Height *</Label>
                    <Input
                      id="parcego-package-height"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="6"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="parcego-form__input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-package-dimension-unit">Unit</Label>
                    <select
                      id="parcego-package-dimension-unit"
                      value={formData.dimensionUnit}
                      onChange={(e) => handleInputChange('dimensionUnit', e.target.value)}
                      className="parcego-form__select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="in">Inches (in)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="ft">Feet (ft)</option>
                      <option value="m">Meters (m)</option>
                    </select>
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

          {/* PDF Preview & Download Section */}
          <Card className="parcego-card parcego-card--pdf-preview">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-orange-600" />
                <span>Updated Shipping Label Preview</span>
              </CardTitle>
              <CardDescription>
                Preview and download your shipping label PDF with complete package details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Package Details Added
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Your package details have been added to the shipping label. You can now preview 
                  the complete label with dimensions, weight, and handling instructions.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handlePreviewPDF}
                  disabled={isPreviewLoading || !isFormValid()}
                  className="parcego-pdf-preview-btn"
                  id="parcego-preview-pdf-btn"
                >
                  {isPreviewLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="Eye" size={16} className="mr-2" />
                      Preview PDF
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isPreviewLoading || !isFormValid()}
                  className="parcego-pdf-download-btn"
                  id="parcego-download-pdf-btn"
                >
                  {isPreviewLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="Download" size={16} className="mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
              
              {isFormValid() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Package Details Complete - Ready for PDF Generation
                    </span>
                  </div>
                </div>
              )}
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
