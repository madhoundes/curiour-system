"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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

// Mock QR Code: 5x5 grid based on tracking
const generateQrFromTracking = (trackingNumber: string): boolean[][] => {
  const seed = Array.from(trackingNumber).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const cell = (seed * (row + 3) * (col + 7)) % 13;
      return cell > 6;
    })
  );
};

const LabelPreviewPage: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const trackingParam = params.get("tracking") || DEFAULT_TRACKING;

  const barWidths = useMemo(() => generateBarsFromTracking(trackingParam), [trackingParam]);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Controls (hidden in print) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            id="parcego-label-preview-back-btn"
            aria-label="Go back"
          >
            <span aria-hidden className="mr-2 text-sm">←</span>
            Back
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm text-gray-600">Label Preview (4x6 inches)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/track-package?tracking=${encodeURIComponent(trackingParam)}`)}
            id="parcego-label-preview-track-btn"
            aria-label="Open tracking page"
          >
            <span aria-hidden className="mr-2 text-sm">📦</span>
            View Tracking
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            id="parcego-label-preview-print-btn"
            aria-label="Print label"
          >
            <span aria-hidden className="mr-2 text-sm">🖨️</span>
            Print
          </Button>
        </div>
      </div>

      {/* Centered preview container */}
      <div className="mx-auto max-w-5xl px-4 py-8 print:py-0">
        <div className="flex items-center justify-center">
          <div id="parcego-label-preview-container" className="bg-white shadow-lg ring-1 ring-gray-200 rounded-md overflow-hidden print:shadow-none print:ring-0">
            <div className="p-4 print:p-0">
              {/* The actual 4x6 canvas */}
              <div
                id="parcego-label-canvas"
                className="relative bg-white text-black border border-black print:border-0"
                style={{ width: "4in", height: "6in" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-3 pt-3">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>🚚</span>
                    <span className="font-semibold text-[11px]">Parcego</span>
                  </div>
                  <div className="text-[11px] font-mono" id="parcego-label-tracking">
                    {trackingParam}
                  </div>
                </div>

                <div className="my-2 h-px bg-black" />

                {/* From / To blocks */}
                <div className="px-3 space-y-2">
                  <div>
                    <div className="text-[9px] font-semibold">FROM</div>
                    <div className="text-[10px] leading-tight">
                      John&apos;s Electronics Store<br />
                      123 Business St, Suite 100<br />
                      New York, NY 10001
                    </div>
                  </div>
                  <div className="h-px bg-black/60" />
                  <div>
                    <div className="text-[9px] font-semibold">TO</div>
                    <div className="text-[10px] leading-tight" id="parcego-label-to-address">
                      Sarah Johnson<br />
                      456 Customer Ave, Apt 2B<br />
                      Los Angeles, CA 90210
                    </div>
                  </div>
                </div>

                {/* Service badge */}
                <div className="px-3 mt-3">
                  <div className="border border-black px-2 py-1 rounded-sm">
                    <div className="text-[11px] font-bold tracking-wide">STANDARD</div>
                    <div className="text-[9px]">3-5 Business Days</div>
                  </div>
                </div>

                {/* Mock barcode */}
                <div className="px-3 mt-4">
                  <div aria-label="Barcode" className="flex items-end gap-[2px] h-14" id="parcego-label-barcode">
                    {barWidths.map((w, i) => (
                      <div key={`parcego-label-bar-${i}`} className="bg-black h-full" style={{ width: w, minWidth: w }} />
                    ))}
                  </div>
                  <div className="mt-1 text-center text-[10px] font-mono tracking-wider">{trackingParam}</div>
                </div>

                {/* QR + meta */}
                <div className="px-3 mt-4 grid grid-cols-[1fr_56px] gap-2 items-start">
                  <div className="space-y-1">
                    <div className="text-[9px]">Weight: 2.5 lb • Dim: 12x8x6 in</div>
                    <div className="text-[9px]">Ref: WEB-ORDER-12345</div>
                    <div className="text-[9px]">Carrier: Parcego</div>
                  </div>
                  <div aria-label="QR" id="parcego-label-qr" className="aspect-square w-14 border border-black grid place-items-center text-[10px] font-mono">
                    QR
                  </div>
                </div>

                {/* Footer notes */}
                <div className="absolute bottom-2 left-3 right-3 text-[8px] text-black/70">
                  Ship by: {new Date().toLocaleDateString()} • Non-hazardous • No signature required
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Helper (hidden when printing) */}
        <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
          Use the Print button. Ensure paper size 4x6 inches and scale 100%.
        </div>
      </div>
    </div>
  );
};

export default LabelPreviewPage;
