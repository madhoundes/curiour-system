"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShipment } from "@/lib/shipment-context";
import { shippingService } from "@/lib/api/shipping";
import { profileService } from "@/lib/api/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { CreateShipmentRequest, UserProfile } from "@/lib/api/types";
import { StripePaymentForm } from "@/components/ui/stripe-payment-form";


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
  const { formData } = useShipment();
  
  // Enhanced state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const [createdShipment, setCreatedShipment] = useState<any>(null);
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  // Generate tracking number (deferred to client to avoid SSR hydration mismatch)
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [senderData, setSenderData] = useState<UserProfile | null>(null);
  
  // Order data from quote-preview
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // Stripe payment state
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  
  // Billing data from shipping flow
  const [billingData, setBillingData] = useState<any>(null);

  useEffect(() => {
    if (!trackingNumber) {
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      setTrackingNumber(`PCG${timestamp}${random}`);
    }
  }, []);

  // Load order data from localStorage
  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      try {
        const parsedOrderData = JSON.parse(savedOrderData);
        setOrderData(parsedOrderData);
        console.log('Order data loaded:', parsedOrderData);
      } catch (error) {
        console.error('Failed to parse order data:', error);
        setShipmentError('Failed to load order information. Please go back and try again.');
      }
    } else {
      setShipmentError('No order data found. Please go back to quote preview and try again.');
    }
  }, []);

  // Calculate total cost including additional services
  const calculateTotalCost = (): number => {
    if (!orderData) return 0;
    
    // Use billing data if available (from shipping flow), otherwise fall back to orderData
    const basePrice = billingData ? parseFloat(billingData.subtotal) : orderData.selectedQuote.price;
    
    let total = basePrice;
    
    // Only add additional fees if we're using orderData (legacy flow)
    // The billing data already includes all fees
    if (!billingData) {
      if (orderData.fragile) total += 3.00;
      if (orderData.valuable) total += 5.00;
      if (orderData.insurance) total += 8.00;
    } else {
      // If we have billing data, use the total amount directly
      total = parseFloat(billingData.amount);
    }
    
    return total;
  };

  // Load sender profile data
  useEffect(() => {
    const loadSenderData = async () => {
      try {
        const profile = await profileService.getProfile();
        setSenderData(profile);
        console.log('Profile loaded successfully:', profile);
      } catch (error) {
        console.error('Failed to load sender profile:', error);
        
        // Set error state instead of fallback data
        if (error instanceof Error && error.message.includes('Authentication')) {
          setShipmentError('Please log in to access your profile information.');
        } else {
          setShipmentError('Failed to load profile information. Please try refreshing the page.');
        }
        
        // Don't set fallback data - require real profile data
        setSenderData(null);
      }
    };
    loadSenderData();
  }, []);
  

  
  // Helper function to create shipment request from form data
  const createShipmentRequest = (): CreateShipmentRequest => {
    if (!formData || !senderData) {
      throw new Error('Missing shipment data or sender information');
    }

    // Validate required sender fields
    const requiredSenderFields = ['email', 'phone_number', 'street_address', 'city', 'province', 'postal_code'];
    for (const field of requiredSenderFields) {
      if (!senderData[field as keyof UserProfile] || String(senderData[field as keyof UserProfile]).trim() === '') {
        throw new Error(`Sender ${field.replace('_', ' ')} is required but missing from your profile`);
      }
    }

    // Validate required recipient fields
    const requiredRecipientFields = [
      { field: 'recipientName', label: 'recipient name' },
      { field: 'recipientAddress', label: 'recipient address' },
      { field: 'recipientCity', label: 'recipient city' },
      { field: 'recipientProvince', label: 'recipient province' },
      { field: 'recipientPostalCode', label: 'recipient postal code' },
      { field: 'recipientPhone', label: 'recipient phone' },
      { field: 'recipientEmail', label: 'recipient email' }
    ];

    for (const { field, label } of requiredRecipientFields) {
      if (!formData[field as keyof typeof formData] || String(formData[field as keyof typeof formData]).trim() === '') {
        throw new Error(`${label} is required but missing`);
      }
    }

    // Validate package dimensions
    const dimensions = ['weight', 'length', 'width', 'height'];
    for (const dim of dimensions) {
      const value = parseFloat(formData[dim as keyof typeof formData] as string);
      if (isNaN(value) || value <= 0) {
        throw new Error(`Package ${dim} must be a valid positive number`);
      }
    }

    return {
      sender_address: {
        contact_name: senderData.business_name || `${senderData.first_name} ${senderData.last_name}` || "Contact Name",
        company_name: senderData.business_name || "",
        street_address: senderData.street_address || "",
        street_address_2: senderData.street_address_2 || "N/A",
        city: senderData.city || "",
        province: senderData.province || "",
        postal_code: senderData.postal_code || "",
        country: senderData.country || "Canada",
        phone_number: senderData.phone_number || "",
        email: senderData.email || ""
      },
      receiver_address: {
        contact_name: formData.recipientName,
        company_name: formData.recipientCompany || "",
        street_address: formData.recipientAddress,
        street_address_2: "N/A",
        city: formData.recipientCity,
        province: formData.recipientProvince,
        postal_code: formData.recipientPostalCode,
        country: "Canada",
        phone_number: formData.recipientPhone,
        email: formData.recipientEmail
      },
      package: {
        package_type: formData.packageType as 'box' | 'envelope' | 'tube' | 'pallet',
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        declared_value: 0, // Default value, could be made configurable
        contents_description: formData.specialInstructions || "Package contents",
        fragile: formData.fragile,
        requires_signature: false, // Default value, could be made configurable
        special_instructions: formData.specialInstructions || ""
      },
      special_instructions: formData.specialInstructions || "",
      delivery_notes: formData.specialInstructions || "Standard delivery"
    };
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    setIsProcessing(true);
    setShipmentError(null);

    try {
      console.log('Starting payment flow...');
      
      // Log the data we're about to send
      const shipmentRequest = createShipmentRequest();
      console.log('Shipment request data:', JSON.stringify(shipmentRequest, null, 2));
      
      // Validate that all required fields are present
      console.log('Validating sender data:', senderData);
      console.log('Validating form data:', formData);
      
      if (!senderData) {
        throw new Error('Sender profile data is missing. Please refresh the page and try again.');
      }
      
      if (!formData) {
        throw new Error('Shipment form data is missing. Please go back and fill out the form again.');
      }

      // Create shipment request from context data
      const shippingFlow = await shippingService.createShippingFlow(shipmentRequest);

      console.log('Shipping flow created successfully:', shippingFlow);
      console.log('Checkout session object:', JSON.stringify(shippingFlow.checkoutSession, null, 2));
      console.log('Checkout session keys:', Object.keys(shippingFlow.checkoutSession || {}));
      console.log('Client secret value:', shippingFlow.checkoutSession?.client_secret);

      // Store billing data from shipping flow
      setBillingData(shippingFlow.billing);
      console.log('Billing data stored:', shippingFlow.billing);

      // Handle Stripe checkout session with client_secret
      if (shippingFlow.checkoutSession?.client_secret) {
        let clientSecret = shippingFlow.checkoutSession.client_secret;
        
        // Decode the URL-encoded client secret
        try {
          clientSecret = decodeURIComponent(clientSecret);
          console.log('Original client secret:', shippingFlow.checkoutSession.client_secret);
          console.log('Decoded client secret:', clientSecret);
        } catch (e) {
          console.warn('Failed to decode client secret:', e);
          clientSecret = shippingFlow.checkoutSession.client_secret;
        }
        
        // Store checkout session data with decoded client secret and show Stripe payment form
        setCheckoutSession({
          ...shippingFlow.checkoutSession,
          client_secret: clientSecret
        });
        setShowStripePayment(true);
        console.log('Showing Stripe Elements payment form with decoded client_secret');
      } else if (shippingFlow.checkoutSession?.checkout_url) {
        // Fallback: If we have a direct checkout URL, redirect to it
        console.log('Redirecting to Stripe checkout URL:', shippingFlow.checkoutSession.checkout_url);
        window.location.href = shippingFlow.checkoutSession.checkout_url;
      } else {
        throw new Error('No valid payment method received from payment processor');
      }

    } catch (error: unknown) {
      console.error('Payment flow failed:', error);
      
      const errorObj = error as Error & { response?: { status?: number; data?: any } };
      console.error('Error details:', {
        message: errorObj.message,
        stack: errorObj.stack,
        response: errorObj.response?.data
      });

      let errorMessage = 'Payment processing failed. ';
      
      if (errorObj.message?.includes('Service Area Not Supported')) {
        errorMessage = errorObj.message; // Use the specific service area error message
      } else if (errorObj.message?.includes('Authentication') || errorObj.message?.includes('401')) {
        errorMessage = 'Authentication failed. Please log in and try again.';
      } else if (errorObj.message?.includes('Invalid shipment data') || errorObj.message?.includes('validation')) {
        errorMessage = 'Invalid shipment information. Please go back and check your details.';
      } else if (errorObj.message?.includes('required')) {
        errorMessage = `Missing required information: ${errorObj.message}`;
      } else if (errorObj.message?.includes('email')) {
        errorMessage = 'Invalid email format. Please check your email addresses.';
      } else if (errorObj.message?.includes('postal')) {
        errorMessage = 'Invalid postal code format. Please check your postal codes.';
      } else if (errorObj.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again in a few minutes.';
      } else if (errorObj.message?.includes('Network')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
      } else {
        errorMessage = `Payment processing failed: ${errorObj.message || 'Unknown error'}`;
      }

      setShipmentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Generate and download PDF label using the unified shipping label service
  const handleDownloadLabel = async () => {
    if (!formData || !senderData) {
      alert('Missing shipment data. Please go back and complete the shipment form.');
      return;
    }

    try {
      // Use the unified shipping label service to create properly formatted data
      const { createShippingLabelFromOrderData } = await import('@/lib/shipping-label-service');
      
      // Create shipment and generate label using real API
      const shipmentRequest = createShipmentRequest();
      const shipmentResponse = await shippingService.createShipment(shipmentRequest);
      setCreatedShipment(shipmentResponse);
      
      // Generate label using the real API
      const labelResponse = await shippingService.generateLabel(shipmentResponse.shipment.id);
      
      if (labelResponse.label_url) {
        // Open the label in a new tab for download
        window.open(labelResponse.label_url, '_blank');
      } else {
        throw new Error('No label URL received from API');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      const errorObj = error as Error;
      let errorMessage = 'Failed to generate PDF. Please try again.';
      
      if (errorObj.message?.includes('Service Area Not Supported')) {
        errorMessage = errorObj.message;
      } else if (errorObj.message?.includes('Payment required')) {
        errorMessage = 'Payment required - shipment must be paid before generating label';
      } else if (errorObj.message?.includes('Shipment not found')) {
        errorMessage = 'Shipment not found. Please try creating a new shipment.';
      }
      
      alert(errorMessage);
    }
  };
  
  // Handle preview - generate PDF and open stable modal
  const handlePreviewAndPrint = async () => {
    console.log('Preview & Print Label clicked - generating preview...');
    
    if (isGeneratingPreview) {
      return; // Prevent double-clicks
    }

    if (!formData || !senderData) {
      alert('Missing shipment data. Please go back and complete the shipment form.');
      return;
    }
    
    try {
      setIsGeneratingPreview(true);

      // Generate label using the real API for preview
      if (!createdShipment) {
        // Create shipment first if not already created
        const shipmentRequest = createShipmentRequest();
        const shipmentResponse = await shippingService.createShipment(shipmentRequest);
        setCreatedShipment(shipmentResponse);
        
        // Generate label using the real API
        const labelResponse = await shippingService.generateLabel(shipmentResponse.shipment.id);
        
        if (labelResponse.label_url) {
          // Open the label in a new tab for preview
          window.open(labelResponse.label_url, '_blank');
        } else {
          throw new Error('No label URL received from API');
        }
      } else {
        // Use existing shipment to generate label
        const labelResponse = await shippingService.generateLabel(createdShipment.shipment.id);
        
        if (labelResponse.label_url) {
          // Open the label in a new tab for preview
          window.open(labelResponse.label_url, '_blank');
        } else {
          throw new Error('No label URL received from API');
        }
      }
    } catch (error) {
      console.error('Error in handlePreviewAndPrint:', error);
      
      const errorObj = error as Error;
      let errorMessage = 'Failed to generate label preview.';
      
      if (errorObj.message?.includes('Service Area Not Supported')) {
        errorMessage = errorObj.message;
      } else if (errorObj.message?.includes('Payment required')) {
        errorMessage = 'Payment required - shipment must be paid before generating label';
      } else if (errorObj.message?.includes('Shipment not found')) {
        errorMessage = 'Shipment not found. Please try creating a new shipment.';
      } else {
        errorMessage = `Failed to generate label preview. Error: ${errorObj.message || 'Unknown error'}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Handle preview modal close with cleanup
  const handlePreviewClose = () => {
    setShowPreview(false);
    // Clean up blob URL after a delay to allow for any in-progress operations
    setTimeout(() => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl("");
      }
    }, 1000);
  };

  // Handle print from preview modal
  const handlePrintFromPreview = () => {
    if (!pdfBlobUrl) {
      alert('PDF not ready for printing. Please try again.');
      return;
    }
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = pdfBlobUrl;
    
    iframe.onload = () => {
      setTimeout(() => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
        } catch (error) {
          console.error('Error printing:', error);
          // Fallback - open in new tab
          window.open(pdfBlobUrl, '_blank');
        }
        
        // Clean up iframe after delay
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 500);
    };
    
    document.body.appendChild(iframe);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Complete Purchase"
          description="Complete your payment to generate your shipping label"
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
          {/* Show error message if profile failed to load */}
          {shipmentError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={20} className="text-red-600" />
                  <p className="text-red-800 font-medium">{shipmentError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show loading state while profile is loading */}
          {!senderData && !shipmentError && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-blue-800 font-medium">Loading your profile information...</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Stripe Payment Section */}
            <div className="space-y-6">
              {/* Stripe Elements Payment Form */}
              {showStripePayment && checkoutSession?.client_secret ? (
                <StripePaymentForm
                  key={checkoutSession.session_id} // Add key to prevent re-render issues
                  clientSecret={checkoutSession.client_secret}
                  amount={parseFloat(checkoutSession.amount || '0') * 100} // Convert to cents
                  currency={checkoutSession.currency?.toLowerCase() || 'cad'}
                  onSuccess={() => {
                    console.log('Payment successful');
                    setShowStripePayment(false);
                    setShowConfirmation(true);
                  }}
                  onError={(error) => {
                    console.error('Payment failed:', error);
                    setShipmentError(error || 'Payment failed. Please try again.');
                    setShowStripePayment(false);
                  }}
                />
              ) : (
                /* Payment Summary Card */
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">Complete Purchase</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Proceed to Stripe payment to generate your shipping label
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
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="CreditCard" size={32} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Pay</h3>
                      <p className="text-gray-600 mb-6">
                        Click the button below to proceed with secure payment via Stripe
                      </p>
                      
                      <Button
                        id="parcego-payment-cta-btn"
                        type="button"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isProcessing || !formData || !senderData}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePayment();
                        }}
                        aria-label="Go to Stripe payment"
                      >
                        {isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Creating shipment...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Icon name="CreditCard" size={18} />
                            <span>Go to Stripe</span>
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        By completing this purchase, you agree to our terms of service.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card id="parcego-payment-summary-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
                  <CardDescription>Review your shipment details and pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Only show cost breakdown after payment processing starts or billing data is available */}
                  {(billingData || showStripePayment) && (
                    <>
                      <div className="space-y-2 text-sm">
                        {billingData ? (
                          // Show billing data from shipping flow
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="font-medium">${parseFloat(billingData.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Tax ({(parseFloat(billingData.tax_rate) * 100).toFixed(1)}%)</span>
                              <span className="font-medium">${parseFloat(billingData.tax_amount).toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          // Fallback to orderData (legacy flow)
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Base shipping cost</span>
                              <span className="font-medium">${orderData?.selectedQuote?.price?.toFixed(2) || '0.00'}</span>
                            </div>
                            
                            {orderData?.fragile && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Fragile handling</span>
                                <span className="font-medium">$3.00</span>
                              </div>
                            )}
                            
                            {orderData?.valuable && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">High value handling</span>
                                <span className="font-medium">$5.00</span>
                              </div>
                            )}
                            
                            {orderData?.insurance && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Additional insurance</span>
                                <span className="font-medium">$8.00</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-xl font-bold">${calculateTotalCost().toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {/* Error Display */}
                  {shipmentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Icon name="AlertCircle" size={16} className="text-red-600" />
                        <span className="text-sm text-red-700">{shipmentError}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl bg-white">
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
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Order Details</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Tracking Number:</span>
                  <p className="text-gray-900 font-mono text-base">{trackingNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Recipient:</span>
                  <p className="text-gray-900">{formData?.recipientName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Destination:</span>
                  <p className="text-gray-900">{formData?.recipientCity || 'N/A'}, {formData?.recipientProvince || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Service:</span>
                  <p className="text-gray-900 capitalize">{formData?.serviceType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Delivery Time:</span>
                  <p className="text-gray-900">{formData?.selectedQuote?.deliveryTime || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-800">Total Paid:</span>
                  <p className="text-gray-900 font-semibold text-base">${formData?.selectedQuote?.price || 'N/A'}</p>
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
                className="flex-1 border-blue-700 text-blue-700 hover:bg-blue-100 h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                id="parcego-payment-preview-print-btn"
                disabled={isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent"></div>
                    <span>Generating Preview...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Icon name="Printer" size={18} />
                    <span>Preview & Print Label</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Label Preview Modal */}
      <Dialog open={showPreview} onOpenChange={handlePreviewClose}>
        <DialogContent className="max-w-4xl w-full h-[90vh] bg-white p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Shipping Label Preview
                </DialogTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Review your shipping label before printing • Tracking: {trackingNumber}
                </p>
              </div>
              <Button
                onClick={handlePreviewClose}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                id="parcego-preview-close-btn"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-6 pt-4">
            {/* PDF Preview */}
            <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-inner">
              {pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-0"
                  title="Shipping Label Preview"
                  id="parcego-preview-iframe"
                  onLoad={() => console.log('PDF preview loaded successfully')}
                  onError={() => console.error('Error loading PDF preview')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-700 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={handlePrintFromPreview}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 h-10 font-medium"
                disabled={!pdfBlobUrl}
                id="parcego-preview-print-btn"
              >
                <Icon name="Printer" size={16} className="mr-2" />
                Print Label
              </Button>
              
              <Button
                onClick={handleDownloadLabel}
                variant="outline"
                className="border-green-700 text-green-700 hover:bg-green-100 px-6 py-2 h-10 font-medium"
                id="parcego-preview-download-btn"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Download PDF
              </Button>
              
              <Button
                onClick={handlePreviewClose}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2 h-10 font-medium ml-auto"
                id="parcego-preview-close-footer-btn"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}