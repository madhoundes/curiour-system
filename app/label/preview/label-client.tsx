"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  LabelSuccessModal,
  LabelSuccessModalContent,
} from "@/components/ui/label-success-modal";
import LabelGenerationSuccessContent from "@/components/ui/label-generation-success-content";

// This page implements the Payment Success Dialog style for label preview:
// - Payment Success Dialog layout and styling
// - Label details display
// - Print and Download buttons only
// - Maintains print functionality for 4x6 labels

const DEFAULT_TRACKING = "PCG-TEST-000001";

const generateBarsFromTracking = (trackingNumber: string): number[] => {
  const seed = Array.from(trackingNumber).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  // Deterministic pattern of bar widths 1-3px for a simple mock barcode
  return Array.from({ length: 64 }).map((_, i) => {
    const n = (seed * (i + 17)) % 5;
    return [1, 1, 2, 2, 3][n];
  });
};

const LabelPreviewPageContent: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const trackingParam = params.get("tracking") || DEFAULT_TRACKING;
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const barWidths = useMemo(() => generateBarsFromTracking(trackingParam), [trackingParam]);

  // Open modal on page load
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  // Mock order data for the label canvas (still needed for print functionality)
  const mockOrderData = {
    recipientName: "Sarah Johnson",
    recipientCompany: "ABC Corp",
    recipientAddress: "456 Customer Ave, Apt 2B",
    recipientCity: "Toronto",
    recipientProvince: "ON",
    recipientPostalCode: "M5V3A8",
    serviceType: "standard",
    selectedQuote: {
      deliveryTime: "3-5 business days",
    }
  };

  const handleClose = () => {
    // Close the modal and navigate back to previous page or order details
    setIsModalOpen(false);
    // Go back to previous page instead of forcing dashboard redirect
    router.back();
  };



  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print-specific CSS to ensure 4x6 label printing still works */}
      <style jsx>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          
          /* Hide everything except the label canvas during print */
          body > * {
            display: none !important;
          }
          
          #parcego-label-canvas {
            display: block !important;
            width: 4in !important;
            height: 6in !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            /* Reduce overall font size by ~10% */
            font-size: 10.8pt !important;
            line-height: 1.2 !important;
            padding: 0.1in !important;
            box-sizing: border-box !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            overflow: hidden !important;
          }
          
          /* Show label canvas and its contents during print */
          #parcego-label-canvas,
          #parcego-label-canvas * {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Logo print styles */
          #parcego-label-canvas img[alt="Parcego Logo"] {
            /* Reduce header logo by ~15% */
            width: 133px !important;
            height: 28px !important;
            display: block !important;
          }

          /* Reduce watermark logo proportionally */
          #parcego-watermark-logo {
            width: 261px !important;
            height: 54px !important;
          }

          /* Halve the tracking/serial font size */
          #parcego-tracking-serial {
            font-size: 50% !important;
          }

          /* Hide inline meta lines in print; replaced by consolidated box */
          #parcego-meta-inline { display: none !important; }

          /* Consolidated package info box */
          #parcego-package-box {
            position: absolute !important;
            right: 0.15in !important;
            bottom: 0.25in !important;
            width: 1.8in !important;
            border: 1px solid #000 !important;
            border-radius: 3px !important;
            padding: 6px !important;
            background: #fff !important;
            display: block !important;
          }
          #parcego-package-box .row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 4px !important;
            font-size: 95% !important;
          }
          #parcego-package-box .label { font-weight: 600 !important; opacity: 0.7 !important; }
          #parcego-package-box .value { font-weight: 500 !important; }
          
          /* Barcode print styles */
          #parcego-label-barcode .bg-black {
            background-color: black !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* General print optimizations */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Modal for Label Generation Success */}
      <LabelSuccessModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <LabelSuccessModalContent>
          <LabelGenerationSuccessContent 
            trackingNumber={trackingParam}
            onClose={handleClose}
          />
        </LabelSuccessModalContent>
      </LabelSuccessModal>

      {/* Hidden 4x6 Label Canvas for Printing */}
      <div className="hidden print:block">
        <div
          id="parcego-label-canvas"
          className="relative bg-white text-black"
          style={{ width: "4in", height: "6in" }}
        >
          {/* Large Watermark Logo */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.03 }}
            aria-hidden="true"
          >
            <Image 
              src="/Logo/Horizontal-logo.png"
              alt="Parcego Logo Watermark"
              id="parcego-watermark-logo"
              width={307}
              height={64}
              style={{ 
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact'
              }}
            />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3">
            <Image 
              src="/Logo/Horizontal-logo.png"
              alt="Parcego Logo"
              width={157}
              height={33}
              className="flex-shrink-0"
              style={{ 
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact'
              }}
            />
            <div id="parcego-tracking-serial" className="text-sm font-mono">
              {trackingParam}
            </div>
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
            <div aria-label="Barcode" className="flex items-end gap-[2px] h-14" id="parcego-label-barcode">
              {barWidths.map((w, i) => (
                <div 
                  key={`parcego-label-bar-${i}`} 
                  className="bg-black h-full" 
                  style={{ 
                    width: w, 
                    minWidth: w,
                    backgroundColor: 'black',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }} 
                />
              ))}
            </div>
            <div className="mt-1 text-center text-sm font-mono tracking-wider">{trackingParam}</div>
          </div>

          {/* QR + meta */}
          <div className="px-3 mt-4 grid grid-cols-[1fr_56px] gap-2 items-start">
            <div className="space-y-1">
              <div id="parcego-meta-inline" className="text-xs">Weight: 2.5 lb • Dim: 12x8x6 in</div>
              <div className="text-xs">Ref: WEB-ORDER-12345</div>
              <div className="text-xs">Carrier: Parcego</div>
            </div>
            <div 
              aria-label="QR Code Placeholder" 
              className="aspect-square w-14 border-2 border-black bg-white grid place-items-center text-center"
              style={{
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            >
              <div className="text-xs font-medium text-black">
                QR Code
              </div>
            </div>
          </div>

          {/* Consolidated package details box (print-visible, screen-hidden) */}
          <div id="parcego-package-box" className="hidden">
            <div className="row"><span className="label">Weight</span><span className="value">2.5 lb</span></div>
            <div className="row"><span className="label">Dimensions</span><span className="value">12×8×6 in</span></div>
            <div className="row"><span className="label">Type</span><span className="value">Box</span></div>
          </div>

          {/* Footer notes */}
          <div className="absolute bottom-2 left-3 right-3 text-xs text-black/70">
            Ship by: {new Date().toLocaleDateString()} • Non-hazardous • No signature required
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const LabelPreviewLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading label preview...</p>
    </div>
  </div>
);

// Main page component with Suspense boundary
const LabelPreviewPage: React.FC = () => {
  return (
    <Suspense fallback={<LabelPreviewLoadingFallback />}>
      <LabelPreviewPageContent />
    </Suspense>
  );
};

export default LabelPreviewPage;
