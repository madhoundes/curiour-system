"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { useShipment } from "@/lib/shipment-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { quotesService } from "@/lib/api/quotes";
import { profileService } from "@/lib/api/profile";
import type { QuoteEstimateRequest, QuoteEstimateResponse, UserProfile } from "@/lib/api/types";

interface ShipmentData {
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

// Enhanced Shipment Summary Component with Reorder Info and Shipping Label Preview
const ShipmentSummary = ({ formData }: { formData: ShipmentData }) => {
  const { generateTrackingNumber, updateMultipleFields, getShippingLabelData, isFormValid } = useShipment();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for sender data
  const [senderData, setSenderData] = useState<UserProfile | null>(null);
  const [senderError, setSenderError] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderSource, setReorderSource] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // State to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load sender data on component mount
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
          setSenderError('Please log in to access your profile information.');
        } else {
          setSenderError('Failed to load profile information. Please try refreshing the page.');
        }
        
        // Don't set fallback data - require real profile data
        setSenderData(null);
      }
    };
    loadSenderData();
  }, []);

  // Handle reorder data from URL parameters
  useEffect(() => {
    const fromShipment = searchParams.get('from');
    if (fromShipment) {
      setIsReorderMode(true);
      setReorderSource(fromShipment);
      
      // Pre-fill form with reorder data
      const reorderData: Record<string, string> = {};
      
      if (searchParams.get('recipient')) {
        reorderData.recipientName = searchParams.get('recipient') || '';
      }
      if (searchParams.get('address')) {
        reorderData.recipientAddress = searchParams.get('address') || '';
      }
      if (searchParams.get('city')) {
        reorderData.recipientCity = searchParams.get('city') || '';
      }
      if (searchParams.get('province')) {
        reorderData.recipientProvince = searchParams.get('province') || '';
      }
      if (searchParams.get('postalCode')) {
        reorderData.recipientPostalCode = searchParams.get('postalCode') || '';
      }
      if (searchParams.get('service')) {
        reorderData.serviceType = searchParams.get('service')?.toLowerCase() || 'standard';
      }
      if (searchParams.get('weight')) {
        reorderData.weight = searchParams.get('weight') || '';
      }
      if (searchParams.get('notes')) {
        reorderData.specialInstructions = searchParams.get('notes') || '';
      }
      
      // Update form with reorder data
      if (Object.keys(reorderData).length > 0) {
        updateMultipleFields(reorderData);
      }
    }
  }, [searchParams, updateMultipleFields]);
  
  // Memoize tracking number to prevent regeneration on every render
  const trackingNumber = useMemo(() => {
    // During SSR or before hydration, return a stable fallback
    if (!isClient) {
      return 'ASH-0000000000-XXXXXX';
    }
    return generateTrackingNumber();
  }, [generateTrackingNumber, isClient]);
  
  // Memoize current date to prevent recalculation on every render
  const currentDate = useMemo(() => {
    // During SSR, return a stable date
    if (!isClient) {
      return 'Loading...';
    }
    return new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [isClient]);

  // Calculate completion percentage (commented out as not currently used)
  // const completionPercentage = useMemo(() => {
  //   const requiredFields = [
  //     'recipientName',
  //     'recipientAddress',
  //     'recipientCity',
  //     'recipientProvince',
  //     'recipientPostalCode',
  //     'recipientPhone',
  //     'recipientEmail'
  //   ];
  //   
  //   const completedFields = requiredFields.filter(field => {
  //     const value = formData[field as keyof typeof formData];
  //     return value && value.toString().trim() !== '';
  //   }).length;
  //   
  //   return Math.round((completedFields / requiredFields.length) * 100);
  // }, [formData]);

  const handlePreviewPDF = async () => {
    if (!isFormValid()) {
      alert('Please ensure all required shipment details are complete before previewing the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = await getShippingLabelData();
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
      alert('Please ensure all required shipment details are complete before downloading the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = await getShippingLabelData();
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

  return (
    <Card className="parcego-card parcego-card--summary border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Icon name="Package" size={20} />
          <span>Shipment Summary</span>
        </CardTitle>
        <CardDescription className="text-blue-600">
          Review your complete shipment details and shipping label
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reorder Info Banner */}
        {isReorderMode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">Reorder from Previous Shipment</h4>
                <p className="text-green-700 text-sm mb-2">
                  We&apos;ve pre-filled the recipient details and package information from your previous shipment. 
                  You can modify any fields as needed.
                </p>
                <div className="text-xs text-green-600">
                  <strong>Source:</strong> {reorderSource} • <strong>Recipient:</strong> {formData.recipientName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracking & Date Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Tracking Number
            </Label>
            <p className="text-lg font-mono font-bold text-blue-800" suppressHydrationWarning>
              {trackingNumber}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Date
            </Label>
            <p className="text-lg font-semibold text-blue-800" suppressHydrationWarning>
              {currentDate}
            </p>
          </div>
        </div>

        {/* From & To Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-blue-200">
          {/* From Section */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              FROM
            </Label>
            <div className="space-y-1">
              {senderError ? (
                <p className="text-xs text-red-600">{senderError}</p>
              ) : senderData ? (
                <>
                  <p className="font-medium text-gray-900 text-sm">
                    {`${senderData.first_name} ${senderData.last_name}`}
                  </p>
                  {senderData.business_name && (
                    <p className="text-xs text-gray-600">{senderData.business_name}</p>
                  )}
                  <p className="text-xs text-gray-600">{senderData.street_address}</p>
                  <p className="text-xs text-gray-600">
                    {senderData.city}, {senderData.province} {senderData.postal_code}
                  </p>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                  <p className="text-xs text-gray-600">Loading sender information...</p>
                </div>
              )}
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              TO
            </Label>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 text-sm">{formData.recipientName}</p>
              {formData.recipientCompany && (
                <p className="text-xs text-gray-600">{formData.recipientCompany}</p>
              )}
              <p className="text-xs text-gray-600">{formData.recipientAddress}</p>
              <p className="text-xs text-gray-600">
                {formData.recipientCity}, {formData.recipientProvince} {formData.recipientPostalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Package Details Summary */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <Label className="text-sm font-semibold text-blue-600 mb-2 block">
            Package Details
          </Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Weight:</span>{" "}
              <span className="font-medium">{formData.weight} {formData.weightUnit}</span>
            </div>
            <div>
              <span className="text-gray-600">Service:</span>{" "}
              <span className="font-medium capitalize">{formData.serviceType}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>{" "}
              <span className="font-medium capitalize">{formData.packageType}</span>
            </div>
            <div>
              <span className="text-gray-600">Dimensions:</span>{" "}
              <span className="font-medium">
                {formData.length}&quot; × {formData.width}&quot; × {formData.height}&quot;
              </span>
            </div>
          </div>
          
          {/* Special Handling */}
          {(formData.fragile || formData.valuable || formData.insurance) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Label className="text-sm font-semibold text-gray-600 mb-1 block">Special Handling</Label>
              <div className="flex flex-wrap gap-2">
                {formData.fragile && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                    Fragile
                  </span>
                )}
                {formData.valuable && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    High Value
                  </span>
                )}
                {formData.insurance && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Insurance
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Special Instructions */}
          {formData.specialInstructions && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Special Instructions:</span>{" "}
              <span className="font-medium text-sm">{formData.specialInstructions}</span>
            </div>
          )}
        </div>



      </CardContent>
    </Card>
  );
};

export default function QuotePreviewPage() {
  const router = useRouter();
  const wizardBack = useWizardBack();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string>('standard');
  const [formData, setFormData] = useState<ShipmentData | null>(null);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[]>([]);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Map form data to API request format
  const mapFormDataToQuoteRequest = (data: ShipmentData): QuoteEstimateRequest => {
    // Map package type to API package size
    const packageSizeMap: Record<string, 'small' | 'medium' | 'large'> = {
      'envelope': 'small',
      'box': 'medium',
      'tube': 'medium',
      'pallet': 'large'
    };

    return {
      package_size: packageSizeMap[data.packageType] || 'medium',
      weight: parseFloat(data.weight) || 1,
      destination_postal_code: data.recipientPostalCode
    };
  };

  // Convert API response to quote options format
  const mapApiResponseToQuoteOptions = (apiResponse: QuoteEstimateResponse): QuoteOption[] => {
    if (!apiResponse) {
      throw new Error('Invalid API response');
    }
    
    return [
      {
        id: 'standard',
        name: 'Parcego Standard',
        description: `Reliable delivery to ${apiResponse.service_area || 'your destination'}`,
        price: apiResponse.estimated_price || 0,
        deliveryTime: '3-5 business days',
        features: ['Basic tracking', 'Standard handling', 'Email notifications'],
        recommended: true
      }
    ];
  };

  // Fetch quote from API
  const fetchQuoteEstimate = async (data: ShipmentData) => {
    try {
      setQuoteError(null);
      const request = mapFormDataToQuoteRequest(data);
      console.log('Sending quote request:', request);
      
      const response = await quotesService.getEstimate(request);
      console.log('Received quote response:', response);
      
      if (!response) {
        throw new Error('No response received from quotes API');
      }
      
      const quotes = mapApiResponseToQuoteOptions(response);
      setQuoteOptions(quotes);
      
      // Set the recommended option as selected
      const recommended = quotes.find(q => q.recommended);
      if (recommended) {
        setSelectedQuote(recommended.id);
      }
    } catch (error: any) {
      console.error('Failed to fetch quote:', error);
      setQuoteError(error.message || 'Failed to get shipping quote');
      
      // Fallback to basic quote structure on error
      const fallbackQuote: QuoteOption[] = [
        {
          id: 'standard',
          name: 'Parcego Standard',
          description: 'Reliable delivery for everyday shipments',
          price: 15.99, // Basic fallback price
          deliveryTime: '3-5 business days',
          features: ['Basic tracking', 'Standard handling', 'Email notifications'],
          recommended: true
        }
      ];
      setQuoteOptions(fallbackQuote);
      setSelectedQuote('standard');
    }
  };

  // Load form data and generate quotes
  useEffect(() => {
    const savedData = localStorage.getItem('parcego-shipment-form-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData(data);
      
      // Fetch real quote from API
      fetchQuoteEstimate(data);
    } else {
      router.push('/create-shipment');
    }
  }, [router]);

  const handleBackToPackageDetails = () => {
    wizardBack();
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

  const stepperSteps = createStepperSteps(3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Shipping Quote"
          description="Review your shipping options and costs"
          onBack={handleBackToPackageDetails}
          backLabel=""
        />

        {/* Stepper */}
        <div className="mb-8">
          <Stepper 
            steps={stepperSteps} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        <div className="space-y-8">

          {/* Enhanced Shipment Summary with Shipping Label Preview */}
          <ShipmentSummary formData={formData} />

          {/* Quote Options */}
          <Card className="parcego-card parcego-card--quote-options">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Truck" size={20} className="text-green-600" />
                <span>Shipping Service</span>
              </CardTitle>
              <CardDescription>
                Your selected shipping service for this shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error State */}
              {quoteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Quote Error</h4>
                      <p className="text-red-700 text-sm mb-2">
                        {quoteError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => formData && fetchQuoteEstimate(formData)}
                        className="bg-white hover:bg-red-50 border-red-300 text-red-700"
                      >
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Retry Quote
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {quoteOptions.length === 0 && !quoteError && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting shipping quote...</p>
                  </div>
                </div>
              )}

              {/* Quote Options Display */}
              {quoteOptions.length > 0 && quoteOptions.map((quote) => (
                <div
                  key={quote.id}
                  className="parcego-quote-option relative p-6 border-2 border-blue-500 bg-blue-50 rounded-lg"
                  id={`parcego-quote-option-${quote.id}`}
                >
                  <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Selected
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg width="32" height="20" viewBox="0 0 41 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="parcego-quote-option__logo">
                          <g clipPath="url(#clip0_35_54)">
                            <path d="M36.7788 0.29657C37.4253 0.290178 38.1103 0.279704 38.6929 0.601257C39.3833 0.917694 39.8396 1.65685 39.8716 2.40692C39.8631 7.44951 39.875 12.4932 39.8696 17.5358C39.7716 18.647 39.2814 19.7392 38.4653 20.5085C37.5629 21.4162 36.6484 22.312 35.7417 23.2155C35.0428 24.0636 33.9099 24.4037 32.8423 24.3952C30.9939 24.4144 29.1467 24.3926 27.2983 24.4001C26.5494 24.3798 25.7991 24.4373 25.0522 24.3659C24.5942 24.3318 24.1678 23.9777 24.0718 23.5251C23.9194 23.0053 24.207 22.4059 24.7065 22.197C25.2563 21.9658 25.8683 22.0931 26.4458 22.0622C26.4426 20.4429 26.4525 18.8231 26.4419 17.2038C25.9688 17.7269 25.4567 18.2118 24.9399 18.6901C23.4602 20.1944 22.0101 21.7265 20.5122 23.2116C19.8314 23.9605 18.8263 24.4108 17.811 24.3874C15.8593 24.3938 13.9054 24.4304 11.9536 24.3718C11.3049 24.3888 10.6973 23.8466 10.6929 23.1872C10.6971 21.4931 10.6834 19.7963 10.6919 18.1022C8.34069 18.1246 5.98842 18.096 3.63721 18.112C3.26217 18.1248 2.95718 17.8521 2.77393 17.5495C2.43939 16.906 2.86903 15.9601 3.63721 15.9431C6.37311 15.9409 9.11029 15.9394 11.8462 15.9362C12.3842 15.8735 12.9411 16.3484 12.9155 16.8991C12.9272 18.6143 12.9602 20.3294 12.9282 22.0446C14.4507 22.0723 15.975 22.0518 17.4976 22.0593C17.768 22.0656 18.0657 22.0379 18.2573 21.8239C19.5847 20.5189 20.8327 19.1353 22.1548 17.8249C22.9049 17.0695 23.6161 16.2751 24.3608 15.5143C23.4553 15.5026 22.5496 15.5242 21.644 15.4997C21.1838 15.4965 20.6972 15.2986 20.4575 14.8884C20.1166 14.3258 20.372 13.5162 20.9644 13.236C21.3031 13.0411 21.7015 13.0527 22.0786 13.0612C23.9633 13.0687 25.8473 13.0532 27.731 13.0671C28.3711 13.0939 28.8517 13.7241 28.7739 14.3483C28.6685 15.5148 28.7121 16.6865 28.7036 17.8561C28.6962 19.2528 28.7193 20.6508 28.6948 22.0485C29.8689 22.0698 31.0432 22.0493 32.2173 22.0632C32.2045 17.3124 32.2088 12.5601 32.2173 7.80927C25.7831 7.82738 19.3488 7.79959 12.9146 7.82196C12.9146 9.56605 12.9135 11.3103 12.9146 13.0544C9.3251 13.0373 5.73545 13.0495 2.146 13.0495C1.81684 13.0516 1.47774 12.9368 1.2583 12.6833C0.78784 12.2186 0.870102 11.3002 1.46338 10.9743C1.76058 10.7711 2.13152 10.8314 2.47021 10.8239C5.20516 10.826 7.94035 10.825 10.6753 10.8239C10.6987 9.41007 10.6213 7.9914 10.7417 6.58075C10.7567 6.22927 10.9511 5.93034 11.187 5.68329L11.7632 5.10712C12.8585 3.99551 13.9041 2.83527 15.0171 1.74091C15.9834 0.806605 17.3221 0.284588 18.6655 0.300476C24.7034 0.291953 30.7409 0.299766 36.7788 0.29657ZM37.5874 4.21259C37.2699 4.40863 37.0198 4.68735 36.7534 4.94305C35.9885 5.69522 35.2247 6.45101 34.48 7.22235C34.4704 11.8964 34.4994 16.5783 34.4771 21.2556C35.0992 20.6888 35.6702 20.0685 36.2817 19.489C36.6216 19.1459 37.0077 18.8274 37.2251 18.3864C37.5063 17.8697 37.6097 17.2738 37.6108 16.6911C37.6183 12.5317 37.5981 8.37201 37.5874 4.21259ZM5.13525 5.5993C6.06101 5.6174 6.98782 5.58226 7.91357 5.61102C8.48142 5.74633 8.83014 6.47 8.57666 7.00165C8.43709 7.35217 8.0916 7.64271 7.70166 7.62567C6.77366 7.59797 5.84548 7.63384 4.91748 7.62958C4.25708 7.63478 3.79911 6.83349 4.06201 6.24969C4.16429 5.98014 4.37893 5.76027 4.64209 5.6452C4.79648 5.57724 4.97131 5.60782 5.13525 5.5993ZM35.8687 2.58466C30.0641 2.59531 24.2591 2.58537 18.4546 2.58856C17.7686 2.55675 17.1816 2.99085 16.6958 3.42548C15.9906 4.09557 15.3537 4.83512 14.6304 5.48602C20.7267 5.51159 26.823 5.49268 32.9204 5.49481C33.8611 4.48275 34.9492 3.61484 35.8687 2.58466Z" fill="#0091F5"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_35_54">
                              <rect width="39.5" height="24.5" fill="white" transform="translate(0.75 0.25)"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-700 text-lg">
                          {quote.name}
                        </h3>
                        <p className="text-sm text-blue-600">
                          {quote.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={16} className="text-blue-400" />
                            <span className="text-sm text-blue-600">{quote.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-700">
                        ${quote.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quote.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
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
          <div className="flex justify-end items-center pt-6 border-t border-gray-200">
            <Button
              onClick={handleContinueToPayment}
              disabled={isLoading}
              className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id="parcego-continue-payment-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  Continue to Payment
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
