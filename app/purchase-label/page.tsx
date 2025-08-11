"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

interface OrderData {
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
  selectedQuote: {
    id: string;
    name: string;
    description: string;
    price: number;
    deliveryTime: string;
    features: string[];
  };
}

export default function PurchaseLabelPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  // Load order data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('orderData');
    if (savedData) {
      setOrderData(JSON.parse(savedData));
    } else {
      router.push('/create-shipment');
    }
  }, [router]);

  // Pre-fill payment fields with realistic dummy data for testing
  useEffect(() => {
    // Standard test card number (Visa test card)
    setCardNumber("4111 1111 1111 1111");
    
    // Expiry date safely in the future (2 years from now)
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = String(futureDate.getFullYear()).slice(-2);
    setExpiryDate(`${month}/${year}`);
    
    // Standard 3-digit CVV
    setCvv("123");
    
    // Generic cardholder name
    setCardholderName("John Smith");
    
    // Sample billing address
    setBillingAddress({
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001"
    });
  }, []);

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces every 4 digits
    const cleaned = value.replace(/\s+/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (value: string) => {
    // Format expiry date as MM/YY
    const cleaned = value.replace(/\D+/g, '');
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      setExpiryDate(formatted);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleBackToQuote = () => {
    router.push('/quote-preview');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      // Generate tracking number
      const newTrackingNumber = `PCG${Date.now().toString().slice(-10)}`;
      setTrackingNumber(newTrackingNumber);
      
      // Clear form data from localStorage after successful payment
      localStorage.removeItem('shipmentFormData');
      localStorage.removeItem('orderData');
    }, 3000);
  };

  const handleDownloadLabel = () => {
    // Simulate label download
    console.log('Downloading label for tracking number:', trackingNumber);
    // In real app, this would trigger PDF generation and download
  };

  const handlePrintLabel = () => {
    // Simulate label printing
    console.log('Printing label for tracking number:', trackingNumber);
    // In real app, this would trigger print dialog
    window.print();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const calculateTotalCost = () => {
    if (!orderData) return 0;
    
    let total = orderData.selectedQuote.price;
    
    // Add special handling fees
    if (orderData.fragile) total += 3.00;
    if (orderData.valuable) total += 5.00;
    if (orderData.insurance) total += 8.00;
    
    return total;
  };

  const isFormValid = () => {
    return cardNumber.length >= 16 && 
           expiryDate.length === 5 && 
           cvv.length >= 3 && 
           cardholderName.trim() !== "";
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <Icon name="CheckCircle" size={48} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600">Your shipping label has been generated</p>
          </div>

          <Card className="parcego-card parcego-card--confirmation">
            <CardHeader>
              <CardTitle>Order Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Package" size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Tracking Number</p>
                    <p className="text-2xl font-mono font-bold text-blue-700">{trackingNumber}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{orderData.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">{orderData.recipientCity}, {orderData.recipientState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{orderData.selectedQuote.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Time:</span>
                  <span className="font-medium">{orderData.selectedQuote.deliveryTime}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Paid:</span>
                  <span className="text-green-600">${calculateTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="parcego-card parcego-card--label-actions">
            <CardHeader>
              <CardTitle>Label Actions</CardTitle>
              <CardDescription>
                Download or print your shipping label (4x6 inches)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push(`/label/preview?tracking=${encodeURIComponent(trackingNumber || "PCG-TEST-000001")}`)}
                variant="outline"
                className="w-full"
                id="parcego-label-open-preview-btn"
                aria-label="Open label 4x6 preview"
              >
                <Icon name="ScanBarcode" size={16} className="mr-2" />
                Open Label Preview (4x6)
              </Button>

              <div className="flex space-x-4">
                <Button
                  onClick={handleDownloadLabel}
                  className="parcego-action-btn parcego-action-btn--download flex-1"
                  id="parcego-download-label-btn"
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Download Label (PDF)
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrintLabel}
                  className="parcego-action-btn parcego-action-btn--print flex-1"
                  id="parcego-print-label-btn"
                >
                  <Icon name="Printer" size={16} className="mr-2" />
                  Print Label
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Print the shipping label on 4x6 inch label paper</li>
                  <li>Attach the label securely to your package</li>
                  <li>Drop off at any Parcego partner location</li>
                </ol>
              </div>

              <Button
                onClick={() => router.push('/find-dropoff')}
                variant="outline"
                className="parcego-action-btn parcego-action-btn--find-dropoff w-full"
                id="parcego-find-dropoff-from-success-btn"
              >
                <Icon name="MapPin" size={16} className="mr-2" />
                Find Drop-off Locations
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button
              onClick={handleGoToDashboard}
              className="parcego-action-btn parcego-action-btn--dashboard"
              id="parcego-go-dashboard-btn"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToQuote}
                id="parcego-purchase-back-btn"
                className="parcego-nav__back-btn"
              >
                              <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Quote
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Complete Purchase</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Icon name="Shield" size={16} className="text-green-600" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Payment Information */}
            <Card className="parcego-card parcego-card--payment">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="CreditCard" size={20} className="text-blue-600" />
                  <span>Payment Information</span>
                </CardTitle>
                <CardDescription>
                  Enter your card details for secure payment
                </CardDescription>
              </CardHeader>
              
              {/* Test Data Banner */}
              <div className="mx-6 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="font-medium">🧪 Test Mode Active</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  All payment fields are pre-filled with test data for easy testing. 
                  These values are placeholders only and will not trigger real charges.
                </p>
              </div>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-card-number">Card Number *</Label>
                  <Input
                    id="parcego-card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                    className="parcego-form__input font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-expiry-date">Expiry Date *</Label>
                    <Input
                      id="parcego-expiry-date"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      maxLength={5}
                      className="parcego-form__input font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-cvv">CVV *</Label>
                    <Input
                      id="parcego-cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className="parcego-form__input font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parcego-cardholder-name">Cardholder Name *</Label>
                  <Input
                    id="parcego-cardholder-name"
                    type="text"
                    placeholder="John Smith"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="parcego-card parcego-card--billing">
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>
                  Optional billing address for this transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parcego-billing-address">Address</Label>
                  <Input
                    id="parcego-billing-address"
                    placeholder="123 Main Street"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({...billingAddress, address: e.target.value})}
                    className="parcego-form__input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parcego-billing-city">City</Label>
                    <Input
                      id="parcego-billing-city"
                      placeholder="New York"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                      className="parcego-form__input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-billing-state">State</Label>
                    <Input
                      id="parcego-billing-state"
                      placeholder="NY"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
                      className="parcego-form__input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parcego-billing-zip">ZIP Code</Label>
                    <Input
                      id="parcego-billing-zip"
                      placeholder="10001"
                      value={billingAddress.zip}
                      onChange={(e) => setBillingAddress({...billingAddress, zip: e.target.value})}
                      className="parcego-form__input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="parcego-card parcego-card--order-summary sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Service</span>
                    <span className="font-medium">{orderData.selectedQuote.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Cost</span>
                    <span>${orderData.selectedQuote.price.toFixed(2)}</span>
                  </div>
                  
                  {orderData.fragile && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fragile Handling</span>
                      <span>$3.00</span>
                    </div>
                  )}
                  
                  {orderData.valuable && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">High Value</span>
                      <span>$5.00</span>
                    </div>
                  )}
                  
                  {orderData.insurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Insurance</span>
                      <span>$8.00</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-blue-600">${calculateTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProcessPayment}
                  disabled={isProcessing || !isFormValid()}
                  className="parcego-action-btn parcego-action-btn--purchase w-full"
                  id="parcego-process-payment-btn"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon name="Shield" size={16} className="mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <div className="space-y-2 text-xs text-gray-500 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Icon name="Shield" size={12} className="text-green-600" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <p>Your payment information is safe and secure</p>
                  
                  {/* Test Environment Note */}
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    <p className="text-xs font-medium">🧪 Test Environment</p>
                    <p className="text-xs">Click &quot;Complete Purchase&quot; to simulate payment flow</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}