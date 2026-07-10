"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizardBack } from "@/lib/wizard";
import { useShipment, type ShipmentFormData } from "@/lib/shipment-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { createStepperSteps, Stepper } from "@/components/ui/stepper";
import { profileService } from "@/lib/api/profile";
import { shippingService } from "@/lib/api/shipping";
import { buildCreateShipmentRequest } from "@/lib/shipment/build-shipment-request";
import { quotesService } from "@/lib/api/quotes";
import { resolvePackageSize, getDeliverySpeedLabel } from "@/lib/zone-pricing";
import type { BillingRecord, QuoteOptionItem, UserProfile } from "@/lib/api/types";

interface ShipmentData {
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientLatitude?: number;
  recipientLongitude?: number;
  packageType: string;
  serviceType: string;
  deliverySpeed?: 'next_day' | 'standard_2_3' | 'legacy';
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

// Storage keys used to reconcile the in-progress draft shipment between
// /quote-preview and /purchase-label, and across page reloads.
const PENDING_SHIPMENT_ID_KEY = 'parcego_pending_shipment_id';
const PENDING_SHIPMENT_FINGERPRINT_KEY = 'parcego_pending_shipment_fingerprint';

// Compute a lightweight fingerprint of the inputs that affect pricing so we
// can detect when the cached draft no longer matches the current form data.
const computeShipmentFingerprint = (
  data: ShipmentData,
  sender: UserProfile,
): string =>
  [
    data.packageType,
    data.weight,
    data.weightUnit,
    data.length,
    data.width,
    data.height,
    data.dimensionUnit,
    (data.recipientPostalCode || '').trim().toUpperCase().replace(/\s+/g, ''),
    (data.recipientCity || '').trim().toLowerCase(),
    (data.recipientAddress || '').trim().toLowerCase(),
    data.deliverySpeed || 'legacy',
    (sender.postal_code || '').trim().toUpperCase().replace(/\s+/g, ''),
    (sender.city || '').trim().toLowerCase(),
  ].join('|');

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

function QuotePreviewPageContent() {
  const router = useRouter();
  const wizardBack = useWizardBack();
  const { updateMultipleFields } = useShipment();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ShipmentData | null>(null);
  const [senderData, setSenderData] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [shipmentInfo, setShipmentInfo] = useState<{ id: number; trackingCode?: string } | null>(null);
  const [billing, setBilling] = useState<BillingRecord | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOptionItem[]>([]);
  const [inSpecialZone, setInSpecialZone] = useState(false);
  const [selectedDeliverySpeed, setSelectedDeliverySpeed] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  // Guard against React 18 strict-mode double effect invocation creating two
  // shipments back-to-back.
  const isPreparingRef = useRef(false);

  // Load form data and redirect to /create-shipment if it isn't cached
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const { loadShipmentFormData } = await import('@/lib/shipment-cache-utils');
        const data = await loadShipmentFormData();
        if (data) {
          setFormData(data);
        } else {
          router.push('/create-shipment');
        }
      } catch (error) {
        console.error('Failed to load form data:', error);
        router.push('/create-shipment');
      }
    };

    loadFormData();
  }, [router]);

  // Load the authenticated user's profile (used as the sender). The profile
  // service caches the response so the duplicate call inside ShipmentSummary
  // is effectively free.
  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((profile) => {
        if (cancelled) return;
        setSenderData(profile);
        setProfileError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load sender profile:', err);
        if (err instanceof Error && err.message.includes('Authentication')) {
          setProfileError('Please log in to access your profile information.');
        } else {
          setProfileError('Failed to load profile information. Please try refreshing the page.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formData || !senderData) return;

    let cancelled = false;
    const loadOptions = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      setQuoteOptions([]);
      setBilling(null);
      setShipmentInfo(null);
      setPrepareError(null);
      setSelectedDeliverySpeed(null);

      try {
        const weightKg =
          formData.weightUnit === 'kg'
            ? parseFloat(formData.weight)
            : parseFloat(formData.weight) * 0.453592;

        const response = await quotesService.getOptions({
          package_size: resolvePackageSize(formData),
          weight: weightKg,
          destination_street_address: formData.recipientAddress,
          destination_city: formData.recipientCity,
          destination_province: formData.recipientProvince,
          destination_postal_code: formData.recipientPostalCode,
          destination_latitude: formData.recipientLatitude,
          destination_longitude: formData.recipientLongitude,
        });

        if (cancelled) return;

        setQuoteOptions(response.options);
        setInSpecialZone(response.in_special_zone);

        if (response.options.length === 1) {
          const speed = response.options[0].delivery_speed;
          setSelectedDeliverySpeed(speed);
          setFormData((prev) => (prev ? { ...prev, deliverySpeed: speed } : prev));
          updateMultipleFields({ deliverySpeed: speed });
        }
      } catch (err) {
        if (cancelled) return;
        setOptionsError(err instanceof Error ? err.message : 'Failed to load delivery options');
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [formData?.recipientAddress, formData?.recipientCity, formData?.recipientProvince, formData?.recipientPostalCode, formData?.weight, formData?.weightUnit, formData?.packageType, formData?.recipientLatitude, formData?.recipientLongitude, senderData, updateMultipleFields]);

  const handleSelectDeliverySpeed = useCallback((speed: string) => {
    setSelectedDeliverySpeed(speed);
    setFormData((prev) => (prev ? { ...prev, deliverySpeed: speed as ShipmentData['deliverySpeed'] } : prev));
    updateMultipleFields({ deliverySpeed: speed as ShipmentFormData['deliverySpeed'] });
    setBilling(null);
    setShipmentInfo(null);
    setPrepareError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_SHIPMENT_ID_KEY);
      localStorage.removeItem(PENDING_SHIPMENT_FINGERPRINT_KEY);
    }
  }, [updateMultipleFields]);

  // Create (or reuse) the shipment and its billing record for this flow.
  // The billing response is the source of truth for the cost breakdown.
  const prepareShipment = useCallback(async () => {
    if (!formData || !senderData) return;
    if (isPreparingRef.current) return;

    isPreparingRef.current = true;
    setIsPreparing(true);
    setPrepareError(null);

    try {
      const fingerprint = computeShipmentFingerprint(formData, senderData);

      if (typeof window !== 'undefined') {
        const cachedId = localStorage.getItem(PENDING_SHIPMENT_ID_KEY);
        const cachedFingerprint = localStorage.getItem(PENDING_SHIPMENT_FINGERPRINT_KEY);
        const cachedIdNum = cachedId ? parseInt(cachedId, 10) : NaN;

        if (
          Number.isFinite(cachedIdNum) &&
          cachedIdNum > 0 &&
          cachedFingerprint === fingerprint
        ) {
          try {
            const existing = await shippingService.getShipment(cachedIdNum);
            const status = (existing.status || '').toUpperCase();
            if (status === 'DRAFT' && existing.billing) {
              setShipmentInfo({ id: existing.id, trackingCode: existing.tracking_code });
              setBilling(existing.billing as BillingRecord);
              return;
            }
          } catch {
            // Fall through and create a fresh shipment.
          }
        }

        // Anything we cached is no longer reusable — drop it before creating.
        localStorage.removeItem(PENDING_SHIPMENT_ID_KEY);
        localStorage.removeItem(PENDING_SHIPMENT_FINGERPRINT_KEY);
      }

      const request = buildCreateShipmentRequest(formData as ShipmentFormData, senderData);
      const created = await shippingService.createShipment(request);
      const newBilling = await shippingService.createBilling({ shipment_id: created.shipment.id });

      setShipmentInfo({ id: created.shipment.id, trackingCode: created.shipment.tracking_code });
      setBilling(newBilling);

      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_SHIPMENT_ID_KEY, String(created.shipment.id));
        localStorage.setItem(PENDING_SHIPMENT_FINGERPRINT_KEY, fingerprint);
      }
    } catch (err: unknown) {
      console.error('Failed to prepare shipment/billing:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create shipment. Please try again.';
      setPrepareError(message);
    } finally {
      isPreparingRef.current = false;
      setIsPreparing(false);
    }
  }, [formData, senderData]);

  // Trigger preparation once a delivery speed is selected.
  useEffect(() => {
    if (!formData || !senderData || !selectedDeliverySpeed) return;
    if (billing || prepareError) return;
    void prepareShipment();
  }, [formData, senderData, selectedDeliverySpeed, billing, prepareError, prepareShipment]);

  const handleRetryPrepare = () => {
    setPrepareError(null);
    void prepareShipment();
  };

  const handleBackToPackageDetails = () => {
    wizardBack();
  };

  const handleContinueToPayment = () => {
    if (!shipmentInfo || !billing) return;
    setIsLoading(true);
    router.push(`/purchase-label?shipment_id=${shipmentInfo.id}`);
  };

  // Numeric pricing values, in dollars (the API service layer converts the
  // server's cent values to dollars before we receive them here).
  const baseAmount = billing ? Number(billing.subtotal) : 0;
  const taxAmount = billing ? Number(billing.tax_amount) : 0;
  const totalAmount = billing ? Number(billing.amount) : 0;

  // Loading screen until options are loaded; after that, show the picker even when
  // the merchant still needs to choose a downtown delivery speed. Only block on
  // the full-page spinner while a selected speed is being turned into billing.
  if (
    !formData ||
    optionsLoading ||
    (selectedDeliverySpeed && !billing && !prepareError && !optionsError)
  ) {
    const loadingMessage = !formData
      ? 'Loading shipment details...'
      : optionsLoading
        ? 'Checking delivery zone and loading options...'
        : isPreparing
          ? 'Creating your shipment and calculating cost...'
          : 'Preparing your quote...';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{loadingMessage}</p>
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

          {/* Profile load error (we can't price a shipment without the sender) */}
          {profileError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Profile Error</h4>
                    <p className="text-red-700 text-sm">{profileError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Service */}
          <Card className="parcego-card parcego-card--quote-options">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Truck" size={20} className="text-green-600" />
                <span>Shipping Service</span>
              </CardTitle>
              <CardDescription>
                {inSpecialZone
                  ? 'Choose your delivery speed for this downtown delivery'
                  : 'Your selected shipping service for this shipment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{optionsError}</p>
                </div>
              )}

              {prepareError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Unable to Create Shipment</h4>
                      <p className="text-red-700 text-sm mb-3">{prepareError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryPrepare}
                        disabled={isPreparing}
                        className="bg-white hover:bg-red-50 border-red-300 text-red-700"
                      >
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        {isPreparing ? 'Retrying...' : 'Retry'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {quoteOptions.length > 0 && (
                <div className="space-y-3">
                  {inSpecialZone && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      Downtown delivery zone — flat rates apply. HST is added at checkout.
                    </p>
                  )}
                  {quoteOptions.map((option) => {
                    const isSelected = selectedDeliverySpeed === option.delivery_speed;
                    const displayPrice = isSelected && billing
                      ? baseAmount
                      : option.estimated_price;

                    return (
                      <button
                        key={option.delivery_speed}
                        type="button"
                        id={`parcego-quote-option-${option.delivery_speed}`}
                        onClick={() => handleSelectDeliverySpeed(option.delivery_speed)}
                        className={`parcego-quote-option relative w-full text-left p-6 border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`${getDeliverySpeedLabel(option.delivery_speed)} — $${displayPrice.toFixed(2)} before tax`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Selected
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-blue-700 text-lg">
                              {getDeliverySpeedLabel(option.delivery_speed)}
                            </h3>
                            <p className="text-sm text-blue-600 mt-1">{option.eta}</p>
                          </div>
                          <div className="text-xl font-bold text-blue-700">
                            ${displayPrice.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown - driven entirely by the billing record. */}
          <Card className="parcego-card parcego-card--cost-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="DollarSign" size={20} className="text-purple-600" />
                <span>Cost Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billing ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base price</span>
                    <span className="font-medium">${baseAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {prepareError
                    ? 'Cost breakdown unavailable until the shipment is created.'
                    : selectedDeliverySpeed
                      ? 'Calculating cost...'
                      : 'Select a delivery speed above to calculate your quote.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end items-center pt-6 border-t border-gray-200">
            <Button
              onClick={handleContinueToPayment}
              disabled={isLoading || !billing || !shipmentInfo || isPreparing}
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

// Loading component for Suspense fallback
const QuotePreviewLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading quote preview...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
export default function QuotePreviewPage() {
  return (
    <Suspense fallback={<QuotePreviewLoadingFallback />}>
      <QuotePreviewPageContent />
    </Suspense>
  );
}
