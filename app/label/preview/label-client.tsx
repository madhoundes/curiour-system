"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// This page implements the label-preview.mdc rule:
// - Client-only page
// - Print-ready 4x6 label canvas
// - Mock barcode/QR and shipment meta
// - Controls hidden during print

const DEFAULT_TRACKING = "PCG-TEST-000001";

const generateBarsFromTracking = (trackingNumber: string): number[] => {
  const seed = Array.from(trackingNumber).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  // Deterministic pattern of bar widths 1-3px for a simple mock barcode
  return Array.from({ length: 64 }).map((_, i) => {
    const n = (seed * (i + 17)) % 5;
    return [1, 1, 2, 2, 3][n];
  });
};

const LabelPreviewPage: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const trackingParam = params.get("tracking") || DEFAULT_TRACKING;

  const barWidths = useMemo(() => generateBarsFromTracking(trackingParam), [trackingParam]);

  const handlePrint = () => {
    // Force a small delay to ensure DOM is ready for printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleBack = () => {
    // Go back to the purchase-label page (previous step in the flow)
    // This maintains workflow continuity and allows users to return to order details
    router.push('/purchase-label');
  };

  const handleViewTracking = () => {
    // Navigate to tracking page with the current shipment's tracking number
    router.push(`/shipments?tracking=${encodeURIComponent(trackingParam)}`);
  };



  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print-specific CSS to ensure consistency */}
      <style jsx>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12pt !important;
            line-height: 1.2 !important;
          }
          
          #parcego-label-canvas {
            width: 4in !important;
            height: 6in !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-size: 12pt !important;
            line-height: 1.2 !important;
            padding: 0.1in !important;
            box-sizing: border-box !important;
          }
          
          /* Logo print styles - ensure exact sizing and positioning */
          #parcego-label-canvas img[alt="Parcego Logo"] {
            width: 157px !important;
            height: 33px !important;
            min-width: 157px !important;
            min-height: 33px !important;
            max-width: 157px !important;
            max-height: 33px !important;
            display: block !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Watermark print styles - ensure visibility and correct sizing */
          #parcego-label-canvas > div:first-child {
            opacity: 0.03 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #parcego-label-canvas > div:first-child img {
            width: 3.2in !important;
            height: 0.67in !important;
            min-width: 3.2in !important;
            min-height: 0.67in !important;
            max-width: 3.2in !important;
            max-height: 0.67in !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Header text sizing for print */
          #parcego-label-canvas .font-semibold {
            font-size: 14pt !important;
            font-weight: 600 !important;
            line-height: 1.1 !important;
          }
          
          #parcego-label-canvas .font-mono {
            font-size: 12pt !important;
            font-family: monospace !important;
            line-height: 1.1 !important;
          }
          
          /* FROM/TO labels */
          #parcego-label-canvas .text-xs {
            font-size: 12pt !important;
            font-weight: 600 !important;
            line-height: 1.1 !important;
          }
          
          /* FROM/TO addresses */
          #parcego-label-canvas .text-sm {
            font-size: 11pt !important;
            line-height: 1.2 !important;
          }
          
          /* Service badge */
          #parcego-label-canvas .text-sm.font-bold {
            font-size: 12pt !important;
            font-weight: 600 !important;
            line-height: 1.1 !important;
          }
          
          /* QR and meta info */
          #parcego-label-canvas .text-xs {
            font-size: 9pt !important;
            line-height: 1.1 !important;
          }
          
          /* Footer notes */
          #parcego-label-canvas .text-xs {
            font-size: 8pt !important;
            line-height: 1.1 !important;
          }
          
          /* Barcode container */
          #parcego-label-barcode {
            height: 0.8in !important;
            margin-top: 0.1in !important;
          }
          
          /* QR code sizing */
          #parcego-label-qr {
            width: 0.8in !important;
            height: 0.8in !important;
            border: 2px solid black !important;
            background: white !important;
            color: black !important;
          }
          
          /* Spacing adjustments for print */
          #parcego-label-canvas .space-y-2 > * + * {
            margin-top: 0.05in !important;
          }
          
          #parcego-label-canvas .mt-3 {
            margin-top: 0.15in !important;
          }
          
          #parcego-label-canvas .mt-4 {
            margin-top: 0.2in !important;
          }
          
          #parcego-label-canvas .pt-3 {
            padding-top: 0.15in !important;
          }
          
          #parcego-label-canvas .px-3 {
            padding-left: 0.15in !important;
            padding-right: 0.15in !important;
          }
          
          #parcego-label-canvas .py-1 {
            padding-top: 0.05in !important;
            padding-bottom: 0.05in !important;
          }
          
          #parcego-label-canvas .px-2 {
            padding-left: 0.1in !important;
            padding-right: 0.1in !important;
          }
          
          /* Divider line */
          #parcego-label-canvas .h-px {
            height: 1px !important;
            background-color: black !important;
          }
          
          /* Service badge border */
          #parcego-label-canvas .border {
            border: 1px solid black !important;
          }
          
          /* Barcode bars */
          #parcego-label-barcode .bg-black {
            background-color: black !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* QR code text colors */
          #parcego-label-qr > div {
            color: black !important;
          }
          
          /* General color overrides for print */
          .bg-black {
            background-color: black !important;
          }
          
          .text-black {
            color: black !important;
          }
          
          .border-black {
            border-color: black !important;
          }
          
          .bg-black\\/60 {
            background-color: rgba(0, 0, 0, 0.6) !important;
          }
          
          .text-black\\/70 {
            color: rgba(0, 0, 0, 0.7) !important;
          }
          
          /* Ensure proper text rendering */
          * {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
          }
          
          /* Additional print optimizations */
          @page {
            size: 4in 6in;
            margin: 0;
            bleed: 0;
          }
          
          /* Ensure the label canvas fits exactly on the page */
          #parcego-label-canvas {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            orphans: 1 !important;
            widows: 1 !important;
          }
          
          /* Optimize spacing for print */
          #parcego-label-canvas > * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Controls (hidden in print) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            id="parcego-label-preview-back-btn"
            aria-label="Go back to order details"
          >
            <span aria-hidden className="mr-2 text-sm">←</span>
            Back to Order
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm text-gray-600">Label Preview (4x6 inches)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTracking}
            id="parcego-label-preview-track-btn"
            aria-label="View tracking details for this shipment"
          >
            <span aria-hidden className="mr-2 text-sm">📦</span>
            View Tracking
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            id="parcego-label-preview-print-btn"
            aria-label="Print label"
          >
            <span aria-hidden className="mr-2 text-sm">🖨️</span>
            Print
          </Button>
        </div>
      </div>

      {/* Centered preview container */}
      <div className="mx-auto max-w-5xl px-4 py-8 print:py-0 print:px-0">
        <div className="flex items-center justify-center">
          <div id="parcego-label-preview-container" className="bg-white shadow-lg ring-1 ring-gray-200 rounded-md overflow-hidden print:shadow-none print:ring-0 print:rounded-none">
            <div className="p-4 print:p-0">
              {/* The actual 4x6 canvas */}
              <div
                id="parcego-label-canvas"
                className="relative bg-white text-black border border-black print:border-0 print:bg-white"
                style={{ width: "4in", height: "6in" }}
              >
                {/* Large Watermark Logo - covers 75% of paper area with 3% opacity */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  <Image 
                    src="/Logo/Horizontal-logo.png"
                    alt="Parcego Logo Watermark"
                    width={307}
                    height={64}
                    className="print:block"
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
                    className="flex-shrink-0 print:block"
                    style={{ 
                      printColorAdjust: 'exact',
                      WebkitPrintColorAdjust: 'exact'
                    }}
                  />
                  <div className="text-sm font-mono" id="parcego-label-tracking">
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
                    <div className="text-sm leading-tight" id="parcego-label-to-address">
                      Sarah Johnson<br />
                      456 Customer Ave, Apt 2B<br />
                      Los Angeles, CA 90210
                    </div>
                  </div>
                </div>

                {/* Service badge */}
                <div className="px-3 mt-3">
                  <div className="border border-black px-2 py-1 rounded-sm">
                    <div className="text-sm font-bold tracking-wide">STANDARD</div>
                    <div className="text-xs">3-5 Business Days</div>
                  </div>
                </div>

                {/* Mock barcode - Enhanced for print compatibility */}
                <div className="px-3 mt-4">
                  <div aria-label="Barcode" className="flex items-end gap-[2px] h-14" id="parcego-label-barcode">
                    {barWidths.map((w, i) => (
                      <div 
                        key={`parcego-label-bar-${i}`} 
                        className="bg-black h-full print:bg-black" 
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
                    <div className="text-xs">Weight: 2.5 lb • Dim: 12x8x6 in</div>
                    <div className="text-xs">Ref: WEB-ORDER-12345</div>
                    <div className="text-xs">Carrier: Parcego</div>
                  </div>
                  <div 
                    aria-label="QR Code Placeholder" 
                    id="parcego-label-qr" 
                    className="aspect-square w-14 border-2 border-dashed border-gray-400 bg-gray-50 grid place-items-center text-center print:border-black print:bg-white print:text-black"
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }}
                  >
                    <div className="text-xs font-medium text-gray-600 print:text-black">
                      QR Code
                    </div>
                    <div className="text-sm text-gray-500 print:text-black">
                      Placeholder
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="absolute bottom-2 left-3 right-3 text-xs text-black/70 print:text-black/70">
                  Ship by: {new Date().toLocaleDateString()} • Non-hazardous • No signature required
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Helper (hidden when printing) */}
        <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
          Use the Print button. Ensure paper size 4x6 inches, scale 100%, and margins set to minimum.
          The printed label will have optimized font sizes for readability.
        </div>
      </div>
    </div>
  );
};

export default LabelPreviewPage;
