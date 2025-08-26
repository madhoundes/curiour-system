"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
// Removed unused imports - PDF generation now handled dynamically
import type { ShippingLabelData } from "@/components/pdf/polished-shipping-label";

interface OrderData {
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
  console.log('PurchaseLabelPage: Component rendering');
  const router = useRouter();
  
  // Enhanced state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  // Generate tracking number (deferred to client to avoid SSR hydration mismatch)
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  useEffect(() => {
    if (!trackingNumber) {
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      setTrackingNumber(`PCG${timestamp}${random}`);
    }
  }, [trackingNumber]);
  
  // Payment form state with high-quality dummy data
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardholderName, setCardholderName] = useState("John A. Smith");
  const [billingAddress, setBillingAddress] = useState({
    address: "123 Business Plaza, Suite 200",
    city: "Toronto",
    province: "ON",
    postalCode: "M5V 3A8"
  });
  
  // Mock order data for testing
  const mockOrderData: OrderData = {
    recipientName: "Sarah Johnson",
    recipientCompany: "ABC Corp",
    recipientAddress: "456 Customer Ave, Apt 2B",
    recipientCity: "Toronto",
    recipientProvince: "ON",
    recipientPostalCode: "M5V3A8",
    recipientPhone: "(555) 987-6543",
    recipientEmail: "customer@email.com",
    packageType: "box",
    serviceType: "standard",
    specialInstructions: "Handle with care – demo run",
    weight: "2.5",
    weightUnit: "lbs",
    length: "12",
    width: "8",
    height: "6",
    dimensionUnit: "in",
    fragile: false,
    valuable: false,
    insurance: false,
    selectedQuote: {
      id: 'standard-1',
      name: 'Standard Delivery',
      description: '3-5 business days delivery',
      price: 15.99,
      deliveryTime: '3-5 business days',
      features: ['Tracking included', 'Signature required', 'Insurance available']
    }
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
    }, 2000);
  };
  
  // Generate and download PDF label using the polished React-PDF version
  const handleDownloadLabel = async () => {
    try {
      // Prepare data for the polished shipping label
      const shippingData: ShippingLabelData = {
        trackingNumber: trackingNumber,
        sender: {
          name: "John's Electronics Store",
          address: '123 Business St, Suite 100',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
        },
        recipient: {
          name: mockOrderData.recipientName,
          company: mockOrderData.recipientCompany,
          address: mockOrderData.recipientAddress,
          city: mockOrderData.recipientCity,
          state: mockOrderData.recipientProvince,
          postalCode: mockOrderData.recipientPostalCode,
          phone: mockOrderData.recipientPhone,
          email: mockOrderData.recipientEmail,
        },
        service: {
          type: mockOrderData.serviceType.toUpperCase(),
          description: mockOrderData.selectedQuote.deliveryTime,
        },
        package: {
          weight: `${mockOrderData.weight} ${mockOrderData.weightUnit}`,
          dimensions: `${mockOrderData.length}" × ${mockOrderData.width}" × ${mockOrderData.height}" ${mockOrderData.dimensionUnit}`,
          type: mockOrderData.packageType,
        },
        shipDate: new Date().toLocaleDateString(),
        logoUrl: '/logo-horizontal.png', // Adjust path as needed
      };

      // Dynamically import and generate the polished PDF to avoid chunk loading issues
      const { generatePolishedShippingLabel } = await import('@/lib/pdf-generator');
      await generatePolishedShippingLabel(shippingData);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  // Handle preview and print label
  const handlePreviewAndPrint = () => {
    setShowPreviewModal(true);
  };
  
  // Handle print from preview modal
  const handlePrintFromPreview = () => {
    // Close modal first
    setShowPreviewModal(false);
    
    // Small delay to ensure modal is closed before printing
    setTimeout(() => {
      // Navigate to the label preview page for printing
      router.push(`/label/preview?tracking=${encodeURIComponent(trackingNumber)}`);
    }, 100);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Complete Purchase"
          description="Complete your payment to generate your shipping label"
          icon="CreditCard"
          onBack={() => router.push('/quote-preview')}
          backLabel=""
        />

        {/* Stepper */}
        <div className="mb-8">
          <Stepper 
            steps={createStepperSteps(4)} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Information Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Payment Information</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        Complete your payment to generate your shipping label
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="Shield" size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-700">Secure</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">

                  <form className="space-y-8">
                    {/* Credit Card Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Icon name="CreditCard" size={20} className="text-blue-600" />
                        <h3 className="text-lg font-medium text-gray-900">Credit Card Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="parcego-card-number" className="text-sm font-medium text-gray-700 mb-2 block">
                            Card Number
                          </Label>
                          <div className="relative">
                            <Input
                              id="parcego-card-number"
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="pl-12 pr-4 h-12 text-lg font-mono tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={19}
                              placeholder="0000 0000 0000 0000"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Icon name="CreditCard" size={20} className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="parcego-expiry-date" className="text-sm font-medium text-gray-700 mb-2 block">
                            Expiry Date
                          </Label>
                          <Input
                            id="parcego-expiry-date"
                            type="text"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="h-12 text-lg font-mono tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={5}
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="parcego-cvv" className="text-sm font-medium text-gray-700 mb-2 block">
                            CVV
                          </Label>
                          <Input
                            id="parcego-cvv"
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="h-12 text-lg font-mono tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={4}
                            placeholder="123"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor="parcego-cardholder-name" className="text-sm font-medium text-gray-700 mb-2 block">
                            Cardholder Name
                          </Label>
                          <Input
                            id="parcego-cardholder-name"
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="John A. Smith"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Billing Address Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Icon name="MapPin" size={20} className="text-green-600" />
                        <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="parcego-billing-address" className="text-sm font-medium text-gray-700 mb-2 block">
                            Street Address
                          </Label>
                          <Input
                            id="parcego-billing-address"
                            value={billingAddress.address}
                            onChange={(e) => setBillingAddress({...billingAddress, address: e.target.value})}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="123 Business Plaza, Suite 200"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="parcego-billing-city" className="text-sm font-medium text-gray-700 mb-2 block">
                            City
                          </Label>
                          <Input
                            id="parcego-billing-city"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Toronto"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="parcego-billing-province" className="text-sm font-medium text-gray-700 mb-2 block">
                            Province
                          </Label>
                          <Input
                            id="parcego-billing-province"
                            value={billingAddress.province}
                            onChange={(e) => setBillingAddress({...billingAddress, province: e.target.value})}
                            className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="ON"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="parcego-billing-postal" className="text-sm font-medium text-gray-700 mb-2 block">
                            Postal Code
                          </Label>
                          <Input
                            id="parcego-billing-postal"
                            value={billingAddress.postalCode}
                            onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                            className="h-12 font-mono tracking-wider border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="M5V 3A8"
                          />
                        </div>
                      </div>
                    </div>
                    
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="space-y-6">
              {/* Payment Summary & Submit Card (Shadcn-styled) */}
              <Card id="parcego-payment-summary-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Complete Purchase</CardTitle>
                  <CardDescription>Review your total and proceed to payment to generate your shipping label.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shipping cost</span>
                      <span className="font-medium">${mockOrderData.selectedQuote.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-xl font-bold">${mockOrderData.selectedQuote.price}</span>
                  </div>

                  <Button
                    id="parcego-payment-cta-btn"
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePayment();
                    }}
                    aria-label="Pay and generate label"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Icon name="CreditCard" size={18} />
                        <span>Complete Purchase</span>
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By completing this purchase, you agree to our terms of service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </DialogTitle>
            <p className="text-gray-600">
              Your shipping label has been generated and is ready for download
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="Check" size={40} className="text-green-700" />
              </div>
            </div>
            
            {/* Order Details */}
            <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Order Details</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Tracking Number:</span>
                  <p className="text-gray-900 font-mono text-base">{trackingNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Recipient:</span>
                  <p className="text-gray-900">{mockOrderData.recipientName}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Destination:</span>
                  <p className="text-gray-900">{mockOrderData.recipientCity}, {mockOrderData.recipientProvince}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Service:</span>
                  <p className="text-gray-900 capitalize">{mockOrderData.serviceType}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Delivery Time:</span>
                  <p className="text-gray-900">{mockOrderData.selectedQuote.deliveryTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Total Paid:</span>
                  <p className="text-gray-900 font-semibold text-base">${mockOrderData.selectedQuote.price}</p>
                </div>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">Next Steps:</h4>
              <ul className="text-sm text-blue-900 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-700 mr-2">•</span>
                  Download your shipping label
                </li>
                <li className="flex items-start">
                  <span className="text-blue-700 mr-2">•</span>
                  Print the label on 4x6 inch paper
                </li>
                <li className="flex items-start">
                  <span className="text-blue-700 mr-2">•</span>
                  Attach the label to your package
                </li>
                <li className="flex items-start">
                  <span className="text-blue-700 mr-2">•</span>
                  Drop off at any authorized location
                </li>
              </ul>
            </div>
            
            {/* Action Buttons - Only Two Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleDownloadLabel}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white h-12 text-base font-medium shadow-md"
                id="parcego-payment-download-label-btn"
              >
                <Icon name="Download" size={18} className="mr-2" />
                Download Label (PDF)
              </Button>
              
              <Button
                onClick={handlePreviewAndPrint}
                variant="outline"
                className="flex-1 border-blue-700 text-blue-700 hover:bg-blue-100 h-12 text-base font-medium"
                id="parcego-payment-preview-print-btn"
              >
                <Icon name="Printer" size={18} className="mr-2" />
                Preview & Print Label
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Label Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              Shipping Label Preview
            </DialogTitle>
            <p className="text-gray-600">
              Review your label before printing
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Label Preview */}
            <div className="flex justify-center">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
                <div 
                  className="relative bg-white text-black border border-black"
                  style={{ width: "4in", height: "6in" }}
                >
                  {/* Large Watermark Logo */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5"
                    aria-hidden="true"
                  >
                    <div className="text-6xl font-bold text-gray-200">PARCEGO</div>
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-8 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
                        PARCEGO
                      </div>
                      <span className="font-semibold text-sm">Parcego</span>
                    </div>
                    <div className="text-sm font-mono">{trackingNumber}</div>
                  </div>

                  <div className="my-2 h-px bg-black" />

                  {/* From / To blocks */}
                  <div className="px-3 space-y-2">
                    <div>
                      <div className="text-xs font-semibold">FROM</div>
                      <div className="text-sm leading-tight">
                        John&apos;s Electronics Store<br />
                        123 Business St, Suite 100<br />
                        New York, NY 10001
                      </div>
                    </div>
                    <div className="h-px bg-black/60" />
                    <div>
                      <div className="text-xs font-semibold">TO</div>
                      <div className="text-sm leading-tight">
                        {mockOrderData.recipientName}<br />
                        {mockOrderData.recipientCompany && <>{mockOrderData.recipientCompany}<br /></>}
                        {mockOrderData.recipientAddress}<br />
                        {mockOrderData.recipientCity}, {mockOrderData.recipientProvince} {mockOrderData.recipientPostalCode}
                      </div>
                    </div>
                  </div>

                  {/* Service badge */}
                  <div className="px-3 mt-3">
                    <div className="border border-black px-2 py-1 rounded-sm">
                      <div className="text-sm font-bold tracking-wide">{mockOrderData.serviceType.toUpperCase()}</div>
                      <div className="text-xs">{mockOrderData.selectedQuote.deliveryTime}</div>
                    </div>
                  </div>

                  {/* Mock barcode */}
                  <div className="px-3 mt-4">
                    <div className="flex items-end gap-[2px] h-14">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div 
                          key={i}
                          className="bg-black h-full" 
                          style={{ 
                            width: Math.random() * 3 + 1,
                            minWidth: 1
                          }} 
                        />
                      ))}
                    </div>
                    <div className="mt-1 text-center text-sm font-mono tracking-wider">{trackingNumber}</div>
                  </div>

                  {/* Package details */}
                  <div className="px-3 mt-4">
                    <div className="text-xs space-y-1">
                      <div>Weight: {mockOrderData.weight} {mockOrderData.weightUnit} • Dim: {mockOrderData.length}&quot;×{mockOrderData.width}&quot;×{mockOrderData.height}&quot; {mockOrderData.dimensionUnit}</div>
                      <div>Ref: WEB-ORDER-12345</div>
                      <div>Carrier: Parcego</div>
                    </div>
                  </div>

                  {/* Footer notes */}
                  <div className="absolute bottom-2 left-3 right-3 text-xs text-black/70">
                    Ship by: {new Date().toLocaleDateString()} • Non-hazardous • No signature required
                  </div>
                </div>
              </div>
            </div>
            
            {/* Print Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Printing Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Use 4x6 inch paper or label stock
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Set print scale to 100% (no scaling)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Set margins to minimum or 0
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Ensure the label fits completely on the page
                </li>
              </ul>
            </div>
            
            {/* Action Button - Only Print Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handlePrintFromPreview}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-medium"
                id="parcego-preview-print-btn"
              >
                <Icon name="Printer" size={20} className="mr-2" />
                Print Label
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}