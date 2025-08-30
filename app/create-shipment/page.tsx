"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { useShipment } from "@/lib/shipment-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { generateShippingLabelBlob } from "@/lib/pdf-generator";
import { Badge } from "@/components/ui/badge";

// Mock merchant data - in real app this would come from auth context
const mockMerchantData = {
  businessName: "John's Electronics Store",
  contactName: "John Merchant",
  address: "123 Business St, Suite 100",
  city: "Toronto",
  province: "ON",
  postalCode: "M5V3A8",
  phone: "(555) 123-4567",
  email: "john@electronicsstore.com"
};

// Enhanced Shipment Summary Component with Reorder Info
const ShipmentSummary = () => {
  const { formData, generateTrackingNumber, updateMultipleFields } = useShipment();
  const searchParams = useSearchParams();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderSource, setReorderSource] = useState<string | null>(null);
  
  // State to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle reorder data from URL parameters
  useEffect(() => {
    const fromShipment = searchParams.get('from');
    if (fromShipment) {
      setIsReorderMode(true);
      setReorderSource(fromShipment);
      
      // Pre-fill form with reorder data
      const reorderData: any = {};
      
      if (searchParams.get('recipient')) {
        reorderData.recipientName = searchParams.get('recipient');
      }
      if (searchParams.get('address')) {
        reorderData.recipientAddress = searchParams.get('address');
      }
      if (searchParams.get('city')) {
        reorderData.recipientCity = searchParams.get('city');
      }
      if (searchParams.get('province')) {
        reorderData.recipientProvince = searchParams.get('province');
      }
      if (searchParams.get('postalCode')) {
        reorderData.recipientPostalCode = searchParams.get('postalCode');
      }
      if (searchParams.get('service')) {
        reorderData.serviceType = searchParams.get('service')?.toLowerCase() || 'standard';
      }
      if (searchParams.get('weight')) {
        reorderData.weight = searchParams.get('weight');
      }
      if (searchParams.get('notes')) {
        reorderData.specialInstructions = searchParams.get('notes');
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
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [isClient]);

  // Memoize the completion status check to prevent unnecessary re-renders
  const isRecipientComplete = useMemo(() => {
    return !!(
      formData.recipientName && 
      formData.recipientAddress && 
      formData.recipientCity && 
      formData.recipientProvince && 
      formData.recipientPostalCode && 
      formData.recipientPhone
    );
  }, [
    formData.recipientName,
    formData.recipientAddress,
    formData.recipientCity,
    formData.recipientProvince,
    formData.recipientPostalCode,
    formData.recipientPhone
  ]);

  return (
    <Card className="parcego-card parcego-card--summary border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Icon name="Eye" size={20} className="text-blue-600" />
          <span>Live Shipment Summary</span>
          {isReorderMode && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">
              <Icon name="Repeat" size={14} className="mr-1" />
              Reorder Mode
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-blue-700">
          {isReorderMode 
            ? `Reordering from shipment ${reorderSource} - details pre-filled for faster ordering`
            : "Preview your shipment details in real-time as you type"
          }
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
                  We've pre-filled the recipient details and package information from your previous shipment. 
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

        {/* Recipient Completion Status */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold text-blue-600">
              Recipient Information
            </Label>
            <div className="flex items-center space-x-2">
              {isRecipientComplete ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Icon name="CheckCircle" size={14} className="mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <Icon name="AlertCircle" size={14} className="mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientName ? "Check" : "X"} 
                size={12} 
                className={formData.recipientName ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientName ? "text-green-700" : "text-red-700"}>
                Name
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientAddress ? "Check" : "X"} 
                size={12} 
                className={formData.recipientAddress ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientAddress ? "text-green-700" : "text-red-700"}>
                Address
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientCity ? "Check" : "X"} 
                size={12} 
                className={formData.recipientCity ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientCity ? "text-green-700" : "text-red-700"}>
                City
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientProvince ? "Check" : "X"} 
                size={12} 
                className={formData.recipientProvince ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientProvince ? "text-green-700" : "text-red-700"}>
                Province
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientPostalCode ? "Check" : "X"} 
                size={12} 
                className={formData.recipientPostalCode ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientPostalCode ? "text-green-700" : "text-red-700"}>
                Postal Code
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name={formData.recipientPhone ? "Check" : "X"} 
                size={12} 
                className={formData.recipientPhone ? "text-green-500" : "text-red-500"} 
              />
              <span className={formData.recipientPhone ? "text-green-700" : "text-red-700"}>
                Phone
              </span>
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
                {formData.length}" × {formData.width}" × {formData.height}"
              </span>
            </div>
          </div>
          
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

export default function CreateShipmentPage() {
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

  const handleContinueToPackageDetails = () => {
    setIsLoading(true);
    
    // Simulate validation and processing
    setTimeout(() => {
      setIsLoading(false);
      router.push('/package-details');
    }, 1000);
  };

  const handleBackToDashboard = () => {
    wizardBack();
  };

  const handlePreviewPDF = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields before previewing the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = getShippingLabelData();
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
      alert('Please fill in all required fields before downloading the PDF.');
      return;
    }

    setIsPreviewLoading(true);
    try {
      const shippingData = getShippingLabelData();
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

  const handlePreviewAndPrint = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields before printing the PDF.');
      return;
    }

    console.log('Preview & Print Label clicked - starting process...');
    setIsPreviewLoading(true);

    try {
      console.log('Generating PDF for preview and print...');
      const shippingData = getShippingLabelData();
      const { generateShippingLabelBlob } = await import('@/lib/pdf-generator');
      const pdfBlob = await generateShippingLabelBlob(shippingData);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty or invalid');
      }

      console.log('PDF blob generated successfully, size:', pdfBlob.size);
      
      // Create object URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log('PDF object URL created:', pdfUrl);
      
      // Method 1: Try direct browser print using iframe (preferred)
      const printWithIframe = () => {
        return new Promise<boolean>((resolve) => {
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
          iframe.src = pdfUrl;
          
          let hasLoaded = false;
          let hasPrinted = false;
          
          iframe.onload = () => {
            if (hasLoaded) return;
            hasLoaded = true;
            
            console.log('PDF loaded in iframe, attempting to print...');
            
            try {
              // Method 1a: Try printing through iframe's content window
              if (iframe.contentWindow) {
                setTimeout(() => {
                  try {
                    iframe.contentWindow?.print();
                    console.log('Print dialog triggered successfully');
                    hasPrinted = true;
                    
                    // Wait for print dialog to close before resolving
                    setTimeout(() => {
                      resolve(true);
                    }, 2000);
                  } catch (printError) {
                    console.warn('Iframe print failed:', printError);
                    resolve(false);
                  }
                }, 1000);
              } else {
                console.warn('Iframe contentWindow not accessible');
                resolve(false);
              }
            } catch (error) {
              console.warn('Error accessing iframe for printing:', error);
              resolve(false);
            }
          };

          iframe.onerror = () => {
            console.warn('Iframe failed to load PDF');
            resolve(false);
          };

          // Cleanup timeout - increased to allow print dialog to complete
          setTimeout(() => {
            if (!hasPrinted) {
              console.warn('Print iframe timeout');
              resolve(false);
            }
          }, 15000); // Increased from 5000 to 15000

          // Add iframe to DOM
          document.body.appendChild(iframe);
          
          // Cleanup function - increased delay to prevent premature removal
          setTimeout(() => {
            try {
              if (iframe.parentNode) {
                document.body.removeChild(iframe);
              }
            } catch (cleanupError) {
              console.warn('Cleanup error:', cleanupError);
            }
          }, 30000); // Increased from 10000 to 30000
        });
      };

      // Method 2: Fallback - Open in new tab and trigger print
      const printWithNewTab = () => {
        return new Promise<boolean>((resolve) => {
          console.log('Attempting print via new tab...');
          
          try {
            const printWindow = window.open(pdfUrl, '_blank');
            
            if (!printWindow) {
              console.warn('Popup blocked or failed to open');
              resolve(false);
              return;
            }

            // Wait for the document to load, then trigger print
            printWindow.onload = () => {
              setTimeout(() => {
                try {
                  printWindow.print();
                  console.log('Print dialog triggered via new tab');
                  
                  // Wait for print dialog to close before resolving
                  setTimeout(() => {
                    resolve(true);
                  }, 2000);
                } catch (printError) {
                  console.warn('New tab print failed:', printError);
                  resolve(false);
                }
              }, 1000);
            };

            // Fallback timeout - increased to allow print dialog to complete
            setTimeout(() => {
              try {
                printWindow.print();
                setTimeout(() => {
                  resolve(true);
                }, 2000);
              } catch (error) {
                console.warn('New tab print timeout:', error);
                resolve(false);
              }
            }, 5000); // Increased from 3000 to 5000

          } catch (error) {
            console.warn('New tab method failed:', error);
            resolve(false);
          }
        });
      };

      // Method 3: Final fallback - Download the PDF
      const downloadAsFallback = () => {
        console.log('Using download as final fallback...');
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `shipping-label-${shippingData.trackingNumber}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Automatic printing is not available in your browser. The PDF has been downloaded instead. Please open and print manually.');
        return true;
      };

      // Try methods in sequence
      console.log('Attempting iframe print method...');
      const iframePrintSuccess = await printWithIframe();
      
      if (!iframePrintSuccess) {
        console.log('Iframe print failed, trying new tab method...');
        const newTabPrintSuccess = await printWithNewTab();
        
        if (!newTabPrintSuccess) {
          console.log('New tab print failed, falling back to download...');
          downloadAsFallback();
        }
      } else {
        // If iframe print was successful, show success message
        console.log('Print dialog completed successfully');
        // Give user feedback that printing was initiated
        setTimeout(() => {
          alert('Print dialog opened successfully! If the print dialog closed quickly, please check your browser\'s print settings or try the "Preview PDF" option instead.');
        }, 1000);
      }

      // Cleanup URL after delay
      setTimeout(() => {
        try {
          URL.revokeObjectURL(pdfUrl);
        } catch (error) {
          console.warn('URL cleanup error:', error);
        }
      }, 30000);

    } catch (error) {
      console.error('Error in preview and print:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to generate or print PDF. ';
      
      if (error instanceof Error) {
        if (error.message.includes('blocked') || error.message.includes('popup')) {
          errorMessage += 'Please allow popups for this site and try again.';
        } else if (error.message.includes('permission') || error.message.includes('security')) {
          errorMessage += 'Browser security settings are preventing printing. Try downloading the PDF instead.';
        } else {
          errorMessage += 'Please try again or download the PDF manually.';
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const stepperSteps = createStepperSteps(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Create New Shipment"
          description="Fill in the details below to create your shipment"
        />

        {/* Stepper Component - Added here */}
        <div className="mb-8">
          <Stepper 
            steps={stepperSteps} 
            variant="centered"
            className="bg-white rounded-lg border border-gray-200 p-6"
          />
        </div>

        <div className="space-y-8">
          
          {/* Sender Information */}
          <Card className="parcego-card parcego-card--sender">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="User" size={20} className="text-blue-600" />
                    <span>Sender Information</span>
                  </CardTitle>
                  <CardDescription>
                    This information is automatically filled from your business profile
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/profile'}
                  className="parcego-sender-edit-btn"
                  aria-label="Edit sender information"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Info
                </Button>
              </div>
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
                  <Label htmlFor="parcego-sender-province">Province</Label>
                  <Input
                    id="parcego-sender-province"
                    value={mockMerchantData.province}
                    readOnly
                    className="parcego-form__input parcego-form__input--readonly bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-sender-postal-code">Postal Code</Label>
                  <Input
                    id="parcego-sender-postal-code"
                    value={mockMerchantData.postalCode}
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
                  <Label htmlFor="parcego-recipient-province">Province *</Label>
                  <Input
                    id="parcego-recipient-province"
                    placeholder="ON"
                    value={formData.recipientProvince}
                    onChange={(e) => handleInputChange('recipientProvince', e.target.value)}
                    className="parcego-form__input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcego-recipient-postal-code">Postal Code *</Label>
                  <Input
                    id="parcego-recipient-postal-code"
                    placeholder="M5V3A8"
                    value={formData.recipientPostalCode}
                    onChange={(e) => handleInputChange('recipientPostalCode', e.target.value)}
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

          {/* Real-time Shipment Summary - Hidden */}
          {/* <ShipmentSummary /> */}

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
                <div className="grid grid-cols-1 w-full">
                  <div className="parcego-package-type__selected p-6 border-2 border-blue-500 bg-blue-50 rounded-lg text-center text-blue-700 w-full">
                    <div className="text-2xl mb-3">📦</div>
                    <div className="font-semibold text-lg">Box</div>
                    <div className="text-sm text-blue-600 mt-1">Default Package Type</div>
                  </div>
                </div>
                <input type="hidden" name="packageType" value="box" />
              </div>

              {/* Service Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Service Type</Label>
                <div className="parcego-service-type__container">
                  <div className="parcego-service-type__selected p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-left w-full">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg width="24" height="15" viewBox="0 0 41 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="parcego-service-type__logo">
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
                        <div className="font-medium text-blue-700 text-lg">Parcego Standard</div>
                        <div className="text-sm text-blue-600 mt-1">3-5 business days</div>
                      </div>
                    </div>
                  </div>
                </div>
                <input type="hidden" name="serviceType" value="standard" />
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

          {/* PDF Preview & Download Section */}
          <Card className="parcego-card parcego-card--pdf-preview">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-orange-600" />
                <span>Shipping Label Preview</span>
              </CardTitle>
              <CardDescription>
                Preview, print, or download your shipping label PDF before continuing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Form Data Saved Locally
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Your form data is automatically saved as you type. Use "Preview & Print Label" for direct printing, 
                  "Preview PDF" to view in a new tab, or "Download PDF" to save locally.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="default"
                  onClick={handlePreviewAndPrint}
                  disabled={isPreviewLoading || !isFormValid()}
                  className="parcego-pdf-preview-print-btn bg-blue-600 hover:bg-blue-700 text-white"
                  id="parcego-preview-print-pdf-btn"
                >
                  {isPreviewLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="Printer" size={16} className="mr-2" />
                      Preview & Print Label
                    </>
                  )}
                </Button>
                
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
                      Form Complete - Ready for PDF Generation
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
              onClick={handleBackToDashboard}
              className="parcego-action-btn parcego-action-btn--cancel"
              id="parcego-cancel-shipment-btn"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleContinueToPackageDetails}
              disabled={isLoading || !isFormValid()}
              className="parcego-action-btn parcego-action-btn--continue bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              id="parcego-continue-package-details-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  Continue to Package Details
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
