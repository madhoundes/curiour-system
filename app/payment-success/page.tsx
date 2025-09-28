"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { shippingService } from "@/lib/api/shipping";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { ShippingLabelReady } from "@/components/ui/shipping-label-ready";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [labelData, setLabelData] = useState<any>(null);
  const [isGeneratingLabel, setIsGeneratingLabel] = useState(false);

  // Get session_id from URL parameters
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        setError('No payment session found. Please ensure you accessed this page from a valid payment link.');
        setIsLoading(false);
        return;
      }

      try {
        // Search for shipment by checkout session ID
        // Since we don't have a direct API endpoint, we'll get all shipments and find the matching one
        const shipments = await shippingService.getShipments({ limit: 100 });
        
        if (!shipments || shipments.length === 0) {
          setError('No shipments found. There may be a delay in processing. Please try refreshing in a few moments.');
          setIsLoading(false);
          return;
        }

        const matchingShipment = shipments.find(
          shipment => shipment.billing?.stripe_checkout_session_id === sessionId
        );

        if (!matchingShipment) {
          setError('Shipment not found for this payment session. If you just completed payment, please wait a few moments and refresh the page.');
          setIsLoading(false);
          return;
        }

        // Verify payment status
        if (matchingShipment.billing?.payment_status !== 'paid') {
          const paymentStatus = matchingShipment.billing?.payment_status || 'unknown';
          if (paymentStatus === 'pending') {
            setError('Payment is still being processed. Please wait a few moments and refresh the page.');
          } else if (paymentStatus === 'failed') {
            setError('Payment failed. Please try creating a new shipment and payment.');
          } else {
            setError(`Payment verification failed (status: ${paymentStatus}). Please contact support if you believe this is an error.`);
          }
          setIsLoading(false);
          return;
        }

        setShipmentData(matchingShipment);
        setIsLoading(false);
        
        // Automatically generate label after successful payment verification
        await generateLabelAutomatically(matchingShipment.id);
        
      } catch (error) {
        console.error('Error processing payment success:', error);
        
        let errorMessage = 'Failed to process payment confirmation';
        
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            errorMessage = 'Network error occurred. Please check your connection and try refreshing the page.';
          } else if (error.message.includes('Authentication') || error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please log in again and try accessing this page.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try refreshing the page.';
          } else if (error.message.includes('500')) {
            errorMessage = 'Server error occurred. Please try again in a few moments.';
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId]);

  const generateLabelAutomatically = async (shipmentId: number) => {
    setIsGeneratingLabel(true);
    try {
      const labelResponse = await shippingService.generateLabel(shipmentId, 'standard');
      
      if (labelResponse.success) {
        setLabelData(labelResponse);
      } else {
        console.error('Label generation failed:', labelResponse.message);
        // Don't show error to user for automatic generation, they can still try manually
      }
    } catch (error) {
      console.error('Error generating label automatically:', error);
      // Don't show error to user for automatic generation, they can still try manually
    } finally {
      setIsGeneratingLabel(false);
    }
  };

  const handleDownloadLabel = async () => {
    if (!shipmentData?.id) {
      alert('No shipment data available for label generation. Please try refreshing the page.');
      return;
    }

    try {
      let labelResponse = labelData;
      
      // If we don't have label data, generate it now
      if (!labelResponse) {
        setIsGeneratingLabel(true);
        labelResponse = await shippingService.generateLabel(shipmentData.id, 'standard');
        setIsGeneratingLabel(false);
        
        if (labelResponse.success) {
          setLabelData(labelResponse);
        }
      }
      
      if (labelResponse?.success && labelResponse.label_url) {
        // Open the label URL in a new tab for download
        window.open(labelResponse.label_url, '_blank');
      } else {
        throw new Error(labelResponse?.message || 'Failed to generate label');
      }
    } catch (error) {
      console.error('Error generating label:', error);
      
      let errorMessage = 'Failed to generate label. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMessage = 'Network error occurred while generating label. Please check your connection and try again.';
        } else if (error.message.includes('Authentication') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again and try generating the label.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Label generation timed out. Please try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred while generating label. Please try again in a few moments.';
        } else if (error.message.includes('shipment not found')) {
          errorMessage = 'Shipment not found. Please contact support for assistance.';
        }
      }
      
      alert(errorMessage);
      setIsGeneratingLabel(false);
    }
  };

  const handleCreateNewShipment = () => {
    router.push('/create-shipment');
  };

  const handleViewShipments = () => {
    router.push('/shipments');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processing payment confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Payment Error"
            description="There was an issue processing your payment"
            onBack={() => router.push('/purchase-label')}
            backLabel="Back to Payment"
          />
          
          <Card className="max-w-md mx-auto mt-8 border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <Icon name="XCircle" size={48} className="text-red-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-800 mb-2">Payment Processing Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => router.push('/purchase-label')}
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Payment Successful"
          description="Your payment has been processed successfully"
          onBack={() => router.push('/shipments')}
          backLabel="View Shipments"
        />

        {/* Success Content */}
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          {/* Success Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Check" size={40} className="text-green-700" />
              </div>
              
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Payment Successful! 🎉
              </h2>
              <p className="text-green-700 mb-6">
                Your shipping label {labelData ? 'has been generated and is' : 'is being generated and will be'} ready for use
              </p>

              {/* Label Generation Status */}
              {isGeneratingLabel && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 text-sm">Generating your shipping label...</span>
                  </div>
                </div>
              )}

              {/* Label Ready Status */}
              {labelData && !isGeneratingLabel && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span className="text-green-700 text-sm font-medium">Shipping label ready for download!</span>
                  </div>
                </div>
              )}

              {sessionId && (
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Session:</span> {sessionId}
                  </p>
                  {shipmentData?.tracking_code && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Tracking Code:</span> {shipmentData.tracking_code}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Label Ready Section */}
          {labelData && !isGeneratingLabel && (
            <ShippingLabelReady
              shipmentId={shipmentData?.id}
              trackingNumber={shipmentData?.tracking_code}
              shipmentData={shipmentData}
              onDownload={handleDownloadLabel}
              className="mb-6"
            />
          )}

          {/* Next Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ListTodo" size={20} />
                Next Steps
              </CardTitle>
              <CardDescription>
                What you can do now that your payment is complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  onClick={handleDownloadLabel}
                  className="w-full justify-start h-12"
                  disabled={!shipmentData?.id || isGeneratingLabel}
                >
                  {isGeneratingLabel ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Label...
                    </>
                  ) : (
                    <>
                      <Icon name="Download" size={18} className="mr-2" />
                      {labelData ? 'Download Shipping Label' : 'Generate & Download Label'}
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleViewShipments}
                  className="w-full justify-start h-12"
                >
                  <Icon name="Package" size={18} className="mr-2" />
                  View All Shipments
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleCreateNewShipment}
                  className="w-full justify-start h-12"
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Create New Shipment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Mail" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Email Confirmation</p>
                  <p className="text-gray-600">A confirmation email with your receipt and tracking details has been sent to your registered email address.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <Icon name="Truck" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Shipping Label</p>
                  <p className="text-gray-600">Print your shipping label and attach it securely to your package before drop-off or pickup.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                <Icon name="Clock" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Tracking Updates</p>
                  <p className="text-gray-600">You'll receive real-time tracking updates as your package moves through our network.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment confirmation...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}