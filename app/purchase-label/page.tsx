"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  Download,
  Print,
  Package,
  MapPin,
  Clock
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  // Mock payment form data
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: ""
  });

  // Generated tracking number (mock)
  const [trackingNumber] = useState(() => {
    return `ASH${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  });

  // Load order data
  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      router.push('/create-shipment');
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToQuote = () => {
    router.push('/quote-preview');
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

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      // Save successful order data
      const completedOrder = {
        ...orderData,
        trackingNumber,
        orderDate: new Date().toISOString(),
        totalCost: calculateTotalCost(),
        status: 'label_created'
      };
      
      localStorage.setItem('completedOrder', JSON.stringify(completedOrder));
      localStorage.removeItem('shipmentFormData');
      localStorage.removeItem('orderData');
    }, 3000);
  };

  const handleDownloadLabel = () => {
    // Mock PDF download
    console.log('Downloading shipping label...');
    alert('Shipping label downloaded! (This is a mock implementation)');
  };

  const handlePrintLabel = () => {
    // Mock print functionality
    console.log('Printing shipping label...');
    alert('Printing shipping label... (This is a mock implementation)');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const isPaymentFormValid = () => {
    return paymentData.cardNumber.length >= 16 && 
           paymentData.expiryDate.length >= 5 && 
           paymentData.cvv.length >= 3 && 
           paymentData.cardholderName.length > 0;
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

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Success Header */}
        <div className="bg-green-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-green-100 mt-2">Your shipping label has been created and is ready for use.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            
            {/* Order Confirmation */}
            <Card className="ashraf-card ashraf-card--confirmation">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span>Order Confirmation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tracking Number</h4>
                    <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg">
                      {trackingNumber}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Total Paid</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${calculateTotalCost().toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service</h4>
                    <p className="text-gray-600">{orderData.selectedQuote.name}</p>
                    <p className="text-sm text-gray-500">{orderData.selectedQuote.deliveryTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Destination</h4>
                    <p className="text-gray-600">
                      {orderData.recipientName}<br />
                      {orderData.recipientCity}, {orderData.recipientState}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Label Actions */}
            <Card className="ashraf-card ashraf-card--label-actions">
              <CardHeader>
                <CardTitle>Your Shipping Label</CardTitle>
                <CardDescription>
                  Download or print your label and attach it to your package
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleDownloadLabel}
                    className="ashraf-action-btn ashraf-action-btn--download flex-1"
                    id="ashraf-download-label-btn"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Label
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handlePrintLabel}
                    className="ashraf-action-btn ashraf-action-btn--print flex-1"
                    id="ashraf-print-label-btn"
                  >
                    <Print className="h-4 w-4 mr-2" />
                    Print Label
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Download and print the shipping label (4x6 inches recommended)</li>
                    <li>2. Securely attach the label to your package</li>
                    <li>3. Drop off your package at any authorized location</li>
                    <li>4. Track your shipment using the tracking number above</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleGoToDashboard}
                className="ashraf-action-btn ashraf-action-btn--dashboard"
                id="ashraf-go-dashboard-btn"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
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
                onClick={handleBackToQuote}
                disabled={isProcessing}
                id="ashraf-purchase-back-btn"
                className="ashraf-nav__back-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quote
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Purchase Shipping Label</h1>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Method */}
            <Card className="ashraf-card ashraf-card--payment">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Payment Information</span>
                </CardTitle>
                <CardDescription>
                  Your payment information is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="ashraf-card-number">Card Number *</Label>
                  <Input
                    id="ashraf-card-number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      if (value.replace(/\s/g, '').length <= 16) {
                        handleInputChange('cardNumber', value);
                      }
                    }}
                    className="ashraf-form__input font-mono"
                    maxLength={19}
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ashraf-expiry-date">Expiry Date *</Label>
                    <Input
                      id="ashraf-expiry-date"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        handleInputChange('expiryDate', value);
                      }}
                      className="ashraf-form__input font-mono"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ashraf-cvv">CVV *</Label>
                    <Input
                      id="ashraf-cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          handleInputChange('cvv', value);
                        }
                      }}
                      className="ashraf-form__input font-mono"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="ashraf-cardholder-name">Cardholder Name *</Label>
                  <Input
                    id="ashraf-cardholder-name"
                    placeholder="John Smith"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="ashraf-form__input"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="ashraf-card ashraf-card--billing">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>Billing Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ashraf-billing-address">Address</Label>
                  <Input
                    id="ashraf-billing-address"
                    placeholder="123 Billing St"
                    value={paymentData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    className="ashraf-form__input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ashraf-billing-city">City</Label>
                    <Input
                      id="ashraf-billing-city"
                      placeholder="New York"
                      value={paymentData.billingCity}
                      onChange={(e) => handleInputChange('billingCity', e.target.value)}
                      className="ashraf-form__input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ashraf-billing-state">State</Label>
                    <Input
                      id="ashraf-billing-state"
                      placeholder="NY"
                      value={paymentData.billingState}
                      onChange={(e) => handleInputChange('billingState', e.target.value)}
                      className="ashraf-form__input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ashraf-billing-zip">ZIP Code</Label>
                    <Input
                      id="ashraf-billing-zip"
                      placeholder="10001"
                      value={paymentData.billingZip}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      className="ashraf-form__input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="ashraf-card ashraf-card--order-summary sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipment Details */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{orderData.selectedQuote.name}</div>
                      <div className="text-sm text-gray-600">{orderData.selectedQuote.deliveryTime}</div>
                    </div>
                    <div className="font-medium">${orderData.selectedQuote.price.toFixed(2)}</div>
                  </div>
                  
                  {orderData.fragile && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fragile handling</span>
                      <span>$3.00</span>
                    </div>
                  )}
                  
                  {orderData.valuable && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">High value handling</span>
                      <span>$5.00</span>
                    </div>
                  )}
                  
                  {orderData.insurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Additional insurance</span>
                      <span>$8.00</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">${calculateTotalCost().toFixed(2)}</span>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handleProcessPayment}
                  disabled={!isPaymentFormValid() || isProcessing}
                  className="ashraf-action-btn ashraf-action-btn--purchase w-full"
                  id="ashraf-process-payment-btn"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
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