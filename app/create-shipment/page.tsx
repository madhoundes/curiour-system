"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

// Mock merchant data - in real app this would come from auth context
const mockMerchantData = {
  businessName: "John's Electronics Store",
  contactName: "John Merchant",
  address: "123 Business St, Suite 100",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  phone: "(555) 123-4567",
  email: "john@electronicsstore.com"
};

export default function CreateShipmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Recipient data (prefilled for quick testing)
    recipientName: "Sarah Johnson",
    recipientCompany: "ABC Corp",
    recipientAddress: "456 Customer Ave, Apt 2B",
    recipientCity: "Los Angeles",
    recipientState: "CA",
    recipientZip: "90210",
    recipientPhone: "(555) 987-6543",
    recipientEmail: "customer@email.com",
    
    // Package basics
    packageType: "box",
    serviceType: "standard",
    specialInstructions: "Handle with care – demo run",
    
    // Package details (prefilled so next step is enabled immediately)
    weight: "2.5",
    weightUnit: "lbs",
    length: "12",
    width: "8",
    height: "6",
    dimensionUnit: "in",
    fragile: false,
    valuable: false,
    insurance: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinueToPackageDetails = () => {
    setIsLoading(true);
    
    // Simulate validation and processing
    setTimeout(() => {
      setIsLoading(false);
      // Store form data in localStorage for next step (in real app, use state management)
      localStorage.setItem('shipmentFormData', JSON.stringify(formData));
      router.push('/package-details');
    }, 1000);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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
                onClick={handleBackToDashboard}
                id="parcego-create-shipment-back-btn"
                className="parcego-nav__back-btn"
              >
                <span aria-hidden className="mr-2 text-sm">←</span>
                Back to Dashboard
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Shipment</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">1</span>
                </div>
                <span>Shipment Details</span>
              </div>
              <span aria-hidden className="text-sm">→</span>
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">2</span>
                </div>
                <span>Package Details</span>
              </div>
              <span aria-hidden className="text-sm">→</span>
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
          
          {/* Sender Information */}
          <Card className="parcego-card parcego-card--sender">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="User" size={20} className="text-blue-600" />
                <span>Sender Information</span>
              </CardTitle>
              <CardDescription>
                This information is automatically filled from your business profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-business-name">Business Name</Label>
                  <Input
                    id="parcego-sender-business-name"
                    value={mockMerchantData.businessName}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-contact-name">Contact Name</Label>
                  <Input
                    id="parcego-sender-contact-name"
                    value={mockMerchantData.contactName}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parcego-sender-address">Address</Label>
                <Input
                  id="parcego-sender-address"
                  value={mockMerchantData.address}
                  readOnly
                  className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-city">City</Label>
                  <Input
                    id="parcego-sender-city"
                    value={mockMerchantData.city}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-state">State</Label>
                  <Input
                    id="parcego-sender-state"
                    value={mockMerchantData.state}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-zip">ZIP Code</Label>
                  <Input
                    id="parcego-sender-zip"
                    value={mockMerchantData.zipCode}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-phone">Phone</Label>
                  <Input
                    id="parcego-sender-phone"
                    value={mockMerchantData.phone}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-email">Email</Label>
                  <Input
                    id="parcego-sender-email"
                    value={mockMerchantData.email}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card className="parcego-card parcego-card--recipient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="MapPin" size={20} className="text-green-600" />
                <span>Recipient Information</span>
              </CardTitle>
              <CardDescription>
                Enter the delivery destination details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-name">Recipient Name *</Label>
                  <Input
                    id="parcego-recipient-name"
                    placeholder="John Smith"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-company">Company (Optional)</Label>
                  <Input
                    id="parcego-recipient-company"
                    placeholder="ABC Corp"
                    value={formData.recipientCompany}
                    onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                    className="parcego-form__input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parcego-recipient-address">Address *</Label>
                <Input
                  id="parcego-recipient-address"
                  placeholder="456 Customer Ave, Apt 2B"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  className="parcego-form__input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-city">City *</Label>
                  <Input
                    id="parcego-recipient-city"
                    placeholder="Los Angeles"
                    value={formData.recipientCity}
                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-state">State *</Label>
                  <Input
                    id="parcego-recipient-state"
                    placeholder="CA"
                    value={formData.recipientState}
                    onChange={(e) => handleInputChange('recipientState', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-zip">ZIP Code *</Label>
                  <Input
                    id="parcego-recipient-zip"
                    placeholder="90210"
                    value={formData.recipientZip}
                    onChange={(e) => handleInputChange('recipientZip', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-phone">Phone *</Label>
                  <Input
                    id="parcego-recipient-phone"
                    placeholder="(555) 987-6543"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-email">Email (Optional)</Label>
                  <Input
                    id="parcego-recipient-email"
                    type="email"
                    placeholder="customer@email.com"
                    value={formData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="parcego-form__input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package & Service Information */}
          <Card className="parcego-card parcego-card--package">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-purple-600" />
                <span>Package & Service Information</span>
              </CardTitle>
              <CardDescription>
                Basic package details and service preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Package Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'box', label: 'Box', icon: '📦' },
                    { value: 'envelope', label: 'Envelope', icon: '📨' },
                    { value: 'pallet', label: 'Pallet', icon: '🚛' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('packageType', type.value)}
                      className={`parcego-package-type__btn p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                        formData.packageType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      id={`parcego-package-type-${type.value}`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Service Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'standard', label: 'Standard', desc: '3-5 business days', iconName: 'Truck' },
                    { value: 'express', label: 'Express', desc: '1-2 business days', iconName: 'Truck' },
                    { value: 'overnight', label: 'Overnight', desc: 'Next business day', iconName: 'Shield' }
                  ].map((service) => {
                    return (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() => handleInputChange('serviceType', service.value)}
                        className={`parcego-service-type__btn p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          formData.serviceType === service.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        id={`parcego-service-type-${service.value}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon 
                            name={service.iconName as "Truck" | "Shield"}
                            size={20}
                            className={formData.serviceType === service.value ? 'text-blue-600' : 'text-gray-400'}
                          />
                          <div>
                            <div className={`font-medium ${
                              formData.serviceType === service.value ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {service.label}
                            </div>
                            <div className={`text-sm ${
                              formData.serviceType === service.value ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {service.desc}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="parcego-special-instructions">Special Instructions (Optional)</Label>
                <textarea
                  id="parcego-special-instructions"
                  rows={3}
                  placeholder="Any special handling instructions or delivery notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="parcego-form__textarea w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="parcego-action-btn parcego-action-btn--cancel"
              id="parcego-cancel-shipment-btn"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleContinueToPackageDetails}
              disabled={isLoading || !formData.recipientName || !formData.recipientAddress || !formData.recipientCity || !formData.recipientState || !formData.recipientZip || !formData.recipientPhone}
              className="parcego-action-btn parcego-action-btn--continue"
              id="parcego-continue-package-details-btn"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  Continue to Package Details
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}