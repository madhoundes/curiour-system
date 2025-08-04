"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  ArrowRight,
  Package,
  User,
  MapPin,
  Clock,
  Shield
} from "lucide-react";

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
    // Recipient data
    recipientName: "",
    recipientCompany: "",
    recipientAddress: "",
    recipientCity: "",
    recipientState: "",
    recipientZip: "",
    recipientPhone: "",
    recipientEmail: "",
    
    // Package basics
    packageType: "box",
    serviceType: "standard",
    specialInstructions: "",
    
    // Package details (for next step)
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
                id="ashraf-create-shipment-back-btn"
                className="ashraf-nav__back-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
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
              <ArrowRight className="h-4 w-4" />
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">2</span>
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
          
          {/* Sender Information */}
          <Card className="ashraf-card ashraf-card--sender">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Sender Information</span>
              </CardTitle>
              <CardDescription>
                This information is automatically filled from your business profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-business-name">Business Name</Label>
                  <Input
                    id="ashraf-sender-business-name"
                    value={mockMerchantData.businessName}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-contact-name">Contact Name</Label>
                  <Input
                    id="ashraf-sender-contact-name"
                    value={mockMerchantData.contactName}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ashraf-sender-address">Address</Label>
                <Input
                  id="ashraf-sender-address"
                  value={mockMerchantData.address}
                  readOnly
                  className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-city">City</Label>
                  <Input
                    id="ashraf-sender-city"
                    value={mockMerchantData.city}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-state">State</Label>
                  <Input
                    id="ashraf-sender-state"
                    value={mockMerchantData.state}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-zip">ZIP Code</Label>
                  <Input
                    id="ashraf-sender-zip"
                    value={mockMerchantData.zipCode}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-phone">Phone</Label>
                  <Input
                    id="ashraf-sender-phone"
                    value={mockMerchantData.phone}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-sender-email">Email</Label>
                  <Input
                    id="ashraf-sender-email"
                    value={mockMerchantData.email}
                    readOnly
                    className="ashraf-form__input ashraf-form__input--readonly bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card className="ashraf-card ashraf-card--recipient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Recipient Information</span>
              </CardTitle>
              <CardDescription>
                Enter the delivery destination details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-name">Recipient Name *</Label>
                  <Input
                    id="ashraf-recipient-name"
                    placeholder="John Smith"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-company">Company (Optional)</Label>
                  <Input
                    id="ashraf-recipient-company"
                    placeholder="ABC Corp"
                    value={formData.recipientCompany}
                    onChange={(e) => handleInputChange('recipientCompany', e.target.value)}
                    className="ashraf-form__input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ashraf-recipient-address">Address *</Label>
                <Input
                  id="ashraf-recipient-address"
                  placeholder="456 Customer Ave, Apt 2B"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  className="ashraf-form__input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-city">City *</Label>
                  <Input
                    id="ashraf-recipient-city"
                    placeholder="Los Angeles"
                    value={formData.recipientCity}
                    onChange={(e) => handleInputChange('recipientCity', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-state">State *</Label>
                  <Input
                    id="ashraf-recipient-state"
                    placeholder="CA"
                    value={formData.recipientState}
                    onChange={(e) => handleInputChange('recipientState', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-zip">ZIP Code *</Label>
                  <Input
                    id="ashraf-recipient-zip"
                    placeholder="90210"
                    value={formData.recipientZip}
                    onChange={(e) => handleInputChange('recipientZip', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-phone">Phone *</Label>
                  <Input
                    id="ashraf-recipient-phone"
                    placeholder="(555) 987-6543"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ashraf-recipient-email">Email (Optional)</Label>
                  <Input
                    id="ashraf-recipient-email"
                    type="email"
                    placeholder="customer@email.com"
                    value={formData.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="ashraf-form__input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package & Service Information */}
          <Card className="ashraf-card ashraf-card--package">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
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
                      className={`ashraf-package-type__btn p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                        formData.packageType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      id={`ashraf-package-type-${type.value}`}
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
                    { value: 'standard', label: 'Standard', desc: '3-5 business days', icon: Clock },
                    { value: 'express', label: 'Express', desc: '1-2 business days', icon: ArrowRight },
                    { value: 'overnight', label: 'Overnight', desc: 'Next business day', icon: Shield }
                  ].map((service) => {
                    const IconComponent = service.icon;
                    return (
                      <button
                        key={service.value}
                        type="button"
                        onClick={() => handleInputChange('serviceType', service.value)}
                        className={`ashraf-service-type__btn p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          formData.serviceType === service.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        id={`ashraf-service-type-${service.value}`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${
                            formData.serviceType === service.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
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
                <Label htmlFor="ashraf-special-instructions">Special Instructions (Optional)</Label>
                <textarea
                  id="ashraf-special-instructions"
                  rows={3}
                  placeholder="Any special handling instructions or delivery notes..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="ashraf-form__textarea w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="ashraf-action-btn ashraf-action-btn--cancel"
              id="ashraf-cancel-shipment-btn"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleContinueToPackageDetails}
              disabled={isLoading || !formData.recipientName || !formData.recipientAddress || !formData.recipientCity || !formData.recipientState || !formData.recipientZip || !formData.recipientPhone}
              className="ashraf-action-btn ashraf-action-btn--continue"
              id="ashraf-continue-package-details-btn"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  Continue to Package Details
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