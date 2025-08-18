"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Icon } from "@/components/ui/icon";

interface PackageData {
  trackingNumber: string;
  customerName: string;
  address: string;
  packageType: string;
  weight: string;
  destination: string;
  currentStatus: "pending" | "picked_up" | "in_transit" | "delivered";
  estimatedDelivery: string;
}



// Mock package data
const mockPackageData: PackageData = {
  trackingNumber: "PCG-2025-ABC123",
  customerName: "Sarah Johnson",
  address: "123 Main Street, Downtown District, NY 10001",
  packageType: "Express Delivery",
  weight: "2.5 kg",
  destination: "456 Oak Avenue, Brooklyn, NY 11201",
  currentStatus: "pending",
  estimatedDelivery: "Today, 4:00 PM"
};



export default function CourierScanPackagePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // ZXing controls/readers (dynamic import)
  const zxingReaderRef = useRef<unknown>(null);
  const zxingControlsRef = useRef<unknown>(null);
  
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [scannedPackage, setScannedPackage] = useState<PackageData | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [scanError, setScanError] = useState("");



  const handleBackToCourier = () => {
    if (isCameraActive) {
      stopCamera();
    }
    router.push('/courier');
  };

  const handleStartScan = async () => {
    try {
      setScanError("");
      setIsScanning(true);
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      // Dynamically load @zxing/browser to avoid SSR issues
      const ZXing = await import("@zxing/browser");

      // Create a multi-format reader (QR + 1D barcodes)
      zxingReaderRef.current = new ZXing.BrowserMultiFormatReader();

      // Try to pick a rear/environment camera when available
      const devices = await ZXing.BrowserCodeReader.listVideoInputDevices();
      let selectedDeviceId: string | undefined = undefined;
      if (devices && devices.length > 0) {
        const rear = devices.find((d: MediaDeviceInfo) => /back|rear|environment/i.test(d.label));
        selectedDeviceId = (rear || devices[devices.length - 1]).deviceId;
      }

      // Start decoding from the chosen device into our <video> element
      zxingControlsRef.current = await (zxingReaderRef.current as { decodeFromVideoDevice: (...args: unknown[]) => Promise<unknown> }).decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result: unknown, error: unknown, controls: unknown) => {
          if (result) {
            const text = typeof (result as { getText?: () => string; text?: string }).getText === "function" 
              ? (result as { getText: () => string }).getText() 
              : (result as { text: string }).text;
            handleScanSuccess(text);
            // Stop immediately after a successful detection
            try { (controls as { stop: () => void }).stop(); } catch {}
          }
          // Ignore NotFound errors which occur on frames without codes
          if (error && (error as { name?: string }).name && (error as { name: string }).name !== "NotFoundException") {
            // Non-fatal scanning error; surface as a hint without breaking the flow
            // setScanError("Scanning issue detected. Try to steady the camera or improve lighting.");
          }
        }
      );

      // Mark as active once stream is attached to video
      setIsCameraActive(true);
      setIsScanning(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Camera access denied or unavailable";
      setScanError(
        `${message}. Please allow camera permissions when prompted. If the camera does not open, check browser/site settings to enable camera access, ensure you're using HTTPS (or localhost), or use manual input below.`
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    // Stop ZXing decoding
    try {
      if (zxingControlsRef.current) {
        (zxingControlsRef.current as { stop: () => void }).stop();
      }
    } catch {}
    zxingControlsRef.current = null;
    try {
      if (zxingReaderRef.current && typeof (zxingReaderRef.current as { reset?: () => void }).reset === "function") {
        (zxingReaderRef.current as { reset: () => void }).reset();
      }
    } catch {}
    zxingReaderRef.current = null;

    // Stop any active MediaStream tracks
    const attached = (videoRef.current?.srcObject ?? null) as MediaStream | null;
    const stream = attached || mediaStreamRef.current;
    if (stream) {
      try { stream.getTracks().forEach((t) => t.stop()); } catch {}
    }
    mediaStreamRef.current = null;
    if (videoRef.current) {
      try { (videoRef.current as HTMLVideoElement).srcObject = null; } catch {}
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const handleScanSuccess = (trackingNumber: string) => {
    stopCamera();
    setScannedPackage(mockPackageData);
    setManualInput(trackingNumber);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { stopCamera(); } catch {}
    };
  }, []);

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setScanError("Please enter a tracking number");
      return;
    }
    
    setScanError("");
    setScannedPackage(mockPackageData);
  };

  const handleClearInput = () => {
    setManualInput("");
    setScanError("");
  };

  const handleStatusUpdate = (newStatus: PackageData["currentStatus"]) => {
    if (!scannedPackage) return;
    
    setIsUpdatingStatus(true);
    
    // Mock status update
    setTimeout(() => {
      setScannedPackage({
        ...scannedPackage,
        currentStatus: newStatus
      });
      setIsUpdatingStatus(false);
    }, 1500);
  };



  const getStatusColor = (status: PackageData["currentStatus"]) => {
    const statusConfig = {
      pending: "bg-yellow-100 text-yellow-800",
      picked_up: "bg-blue-100 text-blue-800",
      in_transit: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800"
    };
    return statusConfig[status];
  };

  const getStatusText = (status: PackageData["currentStatus"]) => {
    const statusText = {
      pending: "Pending Pickup",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      delivered: "Delivered"
    };
    return statusText[status];
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" id="parcego-scan-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10" id="parcego-scan-header">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackToCourier}
              id="parcego-scan-back-btn"
              className="parcego-scan__btn--back"
              aria-label="Go back to courier dashboard"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Scan Package</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Camera Viewfinder Section */}
        <Card id="parcego-scan-camera-card" className="parcego-scan__camera-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Icon name="Camera" size={20} className="mr-2" />
              Scan Barcode/QR Code
            </CardTitle>
            <CardDescription>
              Point your camera at the package barcode or QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" id="parcego-scan-viewfinder">
              {isCameraActive ? (
                <div className="parcego-scan__viewfinder parcego-scan__viewfinder--active">
                  <video
                    ref={videoRef}
                    className="w-full h-48 object-cover"
                    autoPlay
                    playsInline
                    muted
                    id="parcego-scan-video"
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="parcego-scan__overlay">
                      <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <Icon name="Scan" size={32} className="mx-auto mb-2 animate-pulse" />
                          <p className="text-sm">Scanning...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="parcego-scan__viewfinder parcego-scan__viewfinder--inactive h-48 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-gray-300">
                    <Icon name="Camera" size={48} className="mx-auto mb-3" />
                    <p className="text-sm">Tap &apos;Start Scan&apos; to activate camera</p>
                    <p className="text-xs mt-1 px-4">Allow camera access when prompted</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Instructions */}
            {!isCameraActive && !isScanning && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg" id="parcego-scan-instructions">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Camera Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Tap &apos;Start Scan&apos; to activate your device&apos;s camera</li>
                      <li>If prompted, please allow camera access</li>
                      <li>If camera doesn&apos;t open, check browser settings for camera permissions</li>
                      <li>Try refreshing the page if issues persist</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {!isCameraActive ? (
                <Button
                  className="flex-1 h-12 parcego-scan__btn--start"
                  onClick={handleStartScan}
                  disabled={isScanning}
                  id="parcego-scan-start-btn"
                >
                  {isScanning ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Icon name="Camera" size={20} className="mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="flex-1 h-12 parcego-scan__btn--stop"
                  onClick={stopCamera}
                  id="parcego-scan-stop-btn"
                >
                  <Icon name="Square" size={20} className="mr-2" />
                  Stop Scan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Input Fallback */}
        <Card id="parcego-scan-manual-card" className="parcego-scan__manual-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
                              <Icon name="Edit" size={20} className="mr-2" />
              Manual Entry
            </CardTitle>
            <CardDescription>
              Enter tracking number manually if scan doesn&apos;t work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="parcego-scan-manual-input" className="parcego-scan__label">
                  Tracking Number
                </Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="parcego-scan-manual-input"
                    className="parcego-scan__input"
                    placeholder="Enter tracking number (e.g., PCG-2025-ABC123)"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  {manualInput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearInput}
                      id="parcego-scan-clear-btn"
                      className="parcego-scan__btn--clear"
                      aria-label="Clear input"
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  )}
                </div>
              </div>
              
              <Button
                className="w-full h-10 parcego-scan__btn--submit"
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                id="parcego-scan-submit-btn"
              >
                <Icon name="Search" size={16} className="mr-2" />
                Look Up Package
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Messages with Troubleshooting */}
        {scanError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" id="parcego-scan-error-alert">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-red-800">{scanError}</p>
                {scanError.includes("Camera") && (
                  <div className="text-sm">
                    <p className="font-medium">Troubleshooting steps:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Refresh the page and try again</li>
                      <li>Check if another app is using your camera</li>
                      <li>Ensure you&apos;re using HTTPS (camera requires secure connection)</li>
                      <li>Try using the manual input below as an alternative</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Package Details Display */}
        {scannedPackage && (
          <>
            <Card id="parcego-scan-package-card" className="parcego-scan__package-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center">
                    <Icon name="Package" size={20} className="mr-2" />
                    Package Details
                  </span>
                  <Badge 
                    className={`parcego-scan__status-badge ${getStatusColor(scannedPackage.currentStatus)}`}
                    id="parcego-scan-package-status-badge"
                  >
                    {getStatusText(scannedPackage.currentStatus)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="parcego-scan__package-info">
                  <div className="flex items-start space-x-3">
                    <Icon name="Hash" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="text-sm text-gray-600">{scannedPackage.trackingNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Icon name="User" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm text-gray-600">{scannedPackage.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Icon name="MapPin" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-600">{scannedPackage.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Icon name="Clock" size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">{scannedPackage.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simplified Next Action - One Primary Button */}
            <Card id="parcego-scan-status-card" className="parcego-scan__status-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Icon name="ArrowRight" size={20} className="mr-2" />
                  Next Action
                </CardTitle>
                <CardDescription>
                  Complete the next step for this package
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scannedPackage.currentStatus !== "delivered" && (
                  <div className="space-y-3">
                    {/* Primary Action Button */}
                    {scannedPackage.currentStatus === "pending" && (
                      <Button
                        className="w-full h-14 text-lg font-semibold parcego-scan__primary-action"
                        onClick={() => handleStatusUpdate("picked_up")}
                        disabled={isUpdatingStatus}
                        id="parcego-scan-confirm-pickup-btn"
                      >
                        <Icon name="PackageCheck" size={24} className="mr-3" />
                        Confirm Pickup
                      </Button>
                    )}
                    
                    {scannedPackage.currentStatus === "picked_up" && (
                      <Button
                        className="w-full h-14 text-lg font-semibold parcego-scan__primary-action"
                        onClick={() => handleStatusUpdate("in_transit")}
                        disabled={isUpdatingStatus}
                        id="parcego-scan-start-delivery-btn"
                      >
                        <Icon name="Truck" size={24} className="mr-3" />
                        Start Delivery
                      </Button>
                    )}
                    
                    {scannedPackage.currentStatus === "in_transit" && (
                      <div className="space-y-3">
                        <Button
                          className="w-full h-14 text-lg font-semibold parcego-scan__primary-action"
                          onClick={() => router.push('/courier/proof')}
                          disabled={isUpdatingStatus}
                          id="parcego-scan-complete-delivery-btn"
                        >
                          <Icon name="Camera" size={24} className="mr-3" />
                          Complete Delivery (Proof)
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base parcego-scan__secondary-action"
                          onClick={() => router.push('/courier/route')}
                          id="parcego-scan-start-delivery-route-btn"
                        >
                          <Icon name="Route" size={20} className="mr-2" />
                          Start Delivery Route
                        </Button>
                      </div>
                    )}

                    {/* Status Updating Indicator */}
                    {isUpdatingStatus && (
                      <div className="flex items-center justify-center text-sm text-gray-600 py-2">
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Updating status...
                      </div>
                    )}

                    {/* Secondary Quick Actions - Smaller, Less Prominent */}
                    {(scannedPackage.currentStatus as PackageData["currentStatus"]) !== "delivered" && (
                      <details className="mt-4">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                          Manual Status Override
                        </summary>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {scannedPackage.currentStatus !== "picked_up" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 text-xs"
                              onClick={() => handleStatusUpdate("picked_up")}
                              disabled={isUpdatingStatus}
                              id="parcego-scan-manual-pickup-btn"
                            >
                              <Icon name="PackageCheck" size={14} className="mr-1" />
                              Pickup
                            </Button>
                          )}
                          
                          {scannedPackage.currentStatus !== "in_transit" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 text-xs"
                              onClick={() => handleStatusUpdate("in_transit")}
                              disabled={isUpdatingStatus}
                              id="parcego-scan-manual-transit-btn"
                            >
                              <Icon name="Truck" size={14} className="mr-1" />
                              In Transit
                            </Button>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {/* Delivered State - Show Completion */}
                {scannedPackage.currentStatus === "delivered" && (
                  <div className="text-center py-6">
                    <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-green-500" />
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Package Delivered</h3>
                    <p className="text-sm text-gray-600">This package has been successfully delivered</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}



        {/* Secondary Action - View Route */}
        {scannedPackage && scannedPackage.currentStatus !== "delivered" && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full h-10 parcego-scan__btn--route"
              onClick={() => router.push('/courier/route')}
              id="parcego-scan-route-btn"
            >
              <Icon name="Navigation" size={16} className="mr-2" />
              View Route & Navigation
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file input for fallback photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        id="parcego-scan-file-input"
      />
    </div>
  );
}