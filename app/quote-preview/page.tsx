"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

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

interface QuoteOption {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
  features: string[];
  recommended?: boolean;
}

export default function QuotePreviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string>('standard');
  const [formData, setFormData] = useState<ShipmentData | null>(null);

  // Mock quote options based on service type and package details
  const generateQuoteOptions = (data: ShipmentData): QuoteOption[] => {
    const basePrice = 12.50;
    const weight = parseFloat(data.weight) || 1;
    const weightMultiplier = weight * 2.5;
    
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Reliable delivery for everyday shipments',
        price: basePrice + weightMultiplier,
        deliveryTime: '3-5 business days',
        features: ['Basic tracking', 'Standard handling', 'Email notifications'],
        recommended: data.serviceType === 'standard'
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Faster delivery when time matters',
        price: (basePrice + weightMultiplier) * 1.8,
        deliveryTime: '1-2 business days',
        features: ['Priority handling', 'Real-time tracking', 'SMS + Email notifications'],
        recommended: data.serviceType === 'express'
      },
      {
        id: 'overnight',
        name: 'Overnight Express',
        description: 'Next business day delivery',
        price: (basePrice + weightMultiplier) * 2.5,
        deliveryTime: 'Next business day',
        features: ['Priority handling', 'Real-time tracking', 'Signature required', 'Insurance included'],
        recommended: data.serviceType === 'overnight'
      }
    ];
  };

  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[]>([]);

  // Load form data and generate quotes
  useEffect(() => {
    const savedData = localStorage.getItem('shipmentFormData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData(data);
      const quotes = generateQuoteOptions(data);
      setQuoteOptions(quotes);
      
      // Set the recommended option as selected
      const recommended = quotes.find(q => q.recommended);
      if (recommended) {
        setSelectedQuote(recommended.id);
      }
    } else {
      router.push('/create-shipment');
    }
  }, [router]);

  const handleBackToPackageDetails = () => {
    router.push('/package-details');
  };

  const handleContinueToPayment = () => {
    setIsLoading(true);
    
    // Save selected quote info
    const selectedQuoteData = quoteOptions.find(q => q.id === selectedQuote);
    const orderData = {
      ...formData,
      selectedQuote: selectedQuoteData
    };
    
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('orderData', JSON.stringify(orderData));
      router.push('/purchase-label');
    }, 1000);
  };

  const getSelectedQuote = () => {
    return quoteOptions.find(q => q.id === selectedQuote);
  };

  const calculateTotalCost = () => {
    const quote = getSelectedQuote();
    if (!quote || !formData) return 0;
    
    let total = quote.price;
    
    // Add special handling fees
    if (formData.fragile) total += 3.00;
    if (formData.valuable) total += 5.00;
    if (formData.insurance) total += 8.00;
    
    return total;
  };

  if (!formData || quoteOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shipping quotes...</p>
        </div>
      </div>
    );
  }

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
                onClick={handleBackToPackageDetails}
                id="parcego-quote-preview-back-btn"
                className="parcego-nav__back-btn"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Package Details
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Shipping Quote</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">✓</span>
                </div>
                <span>Shipment Details</span>
              </div>
              <Icon name="ArrowRight" size={16} />
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">✓</span>
                </div>
                <span>Package Details</span>
              </div>
              <Icon name="ArrowRight" size={16} />
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">3</span>
                </div>
                <span>Quote & Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Shipment Summary */}
          <Card className="parcego-card parcego-card--shipment-summary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Package" size={20} className="text-blue-600" />
                <span>Shipment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">From:</h4>
                  <p className="text-sm text-gray-600">
                    John's Electronics Store<br />
                    123 Business St, Suite 100<br />
                    New York, NY 10001
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">To:</h4>
                  <p className="text-sm text-gray-600">
                    {formData.recipientName}<br />
                    {formData.recipientCompany && `${formData.recipientCompany}<br />`}
                    {formData.recipientAddress}<br />
                    {formData.recipientCity}, {formData.recipientState} {formData.recipientZip}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Package:</h4>
                  <p className="text-sm text-gray-600">
                    {formData.length} × {formData.width} × {formData.height} {formData.dimensionUnit}<br />
                    Weight: {formData.weight} {formData.weightUnit}<br />
                    Type: {formData.packageType}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Special Handling:</h4>
                  <p className="text-sm text-gray-600">
                    {formData.fragile || formData.valuable || formData.insurance ? (
                      [
                        formData.fragile && 'Fragile',
                        formData.valuable && 'High Value',
                        formData.insurance && 'Additional Insurance'
                      ].filter(Boolean).join(', ')
                    ) : (
                      'None'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Options */}
          <Card className="parcego-card parcego-card--quote-options">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Truck" size={20} className="text-green-600" />
                <span>Select Shipping Option</span>
              </CardTitle>
              <CardDescription>
                Choose the shipping service that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteOptions.map((quote) => (
                <div
                  key={quote.id}
                  className={`parcego-quote-option relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedQuote === quote.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${quote.recommended ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                  onClick={() => setSelectedQuote(quote.id)}
                  id={`parcego-quote-option-${quote.id}`}
                >
                  {quote.recommended && (
                    <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Recommended
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="quote-selection"
                        value={quote.id}
                        checked={selectedQuote === quote.id}
                        onChange={() => setSelectedQuote(quote.id)}
                        className="parcego-form__radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                        id={`parcego-quote-radio-${quote.id}`}
                      />
                      <div>
                        <h3 className={`font-medium ${
                          selectedQuote === quote.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {quote.name}
                        </h3>
                        <p className={`text-sm ${
                          selectedQuote === quote.id ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {quote.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{quote.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        selectedQuote === quote.id ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        ${quote.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quote.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          selectedQuote === quote.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="parcego-card parcego-card--cost-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="DollarSign" size={20} className="text-purple-600" />
                <span>Cost Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base shipping cost</span>
                  <span className="font-medium">${getSelectedQuote()?.price.toFixed(2)}</span>
                </div>
                
                {formData.fragile && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fragile handling</span>
                    <span className="font-medium">$3.00</span>
                  </div>
                )}
                
                {formData.valuable && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">High value handling</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                )}
                
                {formData.insurance && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Additional insurance</span>
                    <span className="font-medium">$8.00</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                    <span className="text-xl font-bold text-blue-600">${calculateTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToPackageDetails}
              className="parcego-action-btn parcego-action-btn--back"
              id="parcego-back-package-details-btn"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Package Details
            </Button>
            
            <Button
              onClick={handleContinueToPayment}
              disabled={isLoading}
              className="parcego-action-btn parcego-action-btn--continue"
              id="parcego-continue-payment-btn"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  Continue to Payment
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