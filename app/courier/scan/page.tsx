"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [scannedPackage, setScannedPackage] = useState<PackageData | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scannerInstance, setScannerInstance] = useState<unknown>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  // Get current location info safely
  const getLocationInfo = () => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        return {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port,
          href: window.location.href
        };
      }
      return {
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
        href: 'http://localhost:3000'
      };
    } catch (error) {
      console.log('Location access error:', error);
      return {
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
        href: 'http://localhost:3000'
      };
    }
  };

  // Check camera permissions
  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  };

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
      
      // Check if getUserMedia is supported
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      // Check if we're on HTTPS or localhost (required for camera access)
      const { protocol, hostname } = getLocationInfo();
      if (protocol !== 'https:' && hostname !== 'localhost') {
        throw new Error("Camera access requires HTTPS or localhost");
      }

      // Check camera permissions first
      const hasPermissions = await checkCameraPermissions();
      if (!hasPermissions) {
        throw new Error("Camera access denied. Please allow camera permissions in your browser settings.");
      }

      // Dynamically import HTML5 QR Code library
      const { Html5QrcodeScanner, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      
      // Create scanner instance with mobile-optimized settings
      const scanner = new Html5QrcodeScanner(
        "scanner-container",
        {
          fps: isMobile ? 8 : 10, // Lower FPS on mobile for better performance
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          // Support both QR codes and common barcode formats
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODABAR
          ],
          aspectRatio: isMobile ? 1.0 : 1.777778 // 1:1 for mobile, 16:9 for desktop
        },
        false // verbose = false
      );

      // Store scanner instance
      setScannerInstance(scanner);
      
      // Render scanner with success and error callbacks
      scanner.render(
        (decodedText: string) => {
          // Success callback - stop scanning and process result
          handleScanSuccess(decodedText);
        },
        (errorMessage: string) => {
          // Error callback - only log non-fatal errors
          if (errorMessage !== "QR code not found") {
            console.log("Scan error:", errorMessage);
          }
        }
      );

      setIsCameraActive(true);
      setIsScanning(false);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      
      // Provide helpful error message with fallback suggestion
      if (message.includes("Camera access")) {
        setScanError(
          `${message}. Please check your browser settings and ensure camera permissions are granted. You can use the manual input below as an alternative.`
        );
      } else if (message.includes("HTTPS")) {
        setScanError(
          `${message}. Camera access requires a secure connection. Please use HTTPS or localhost. You can use the manual input below as an alternative.`
        );
      } else if (message.includes("permissions")) {
        setScanError(
          `${message}. Please refresh the page and try again, or use the manual input below as an alternative.`
        );
      } else {
        setScanError(
          `${message}. Please try refreshing the page or use the manual input below as an alternative.`
        );
      }
      
      setIsScanning(false);
    }
  };

  const stopCamera = useCallback(() => {
    try {
      if (scannerInstance && typeof scannerInstance === 'object' && scannerInstance !== null) {
        const scanner = scannerInstance as { clear: () => void };
        scanner.clear();
        setScannerInstance(null);
      }
    } catch (error) {
      console.log("Error stopping camera:", error);
    }
    
    setIsCameraActive(false);
    setIsScanning(false);
  }, [scannerInstance]);

  const handleScanSuccess = (trackingNumber: string) => {
    // Stop camera immediately after successful scan
    stopCamera();
    
    // Provide haptic feedback on mobile devices
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(200); // Short vibration for success
    }
    
    // Set the scanned package data
    setScannedPackage(mockPackageData);
    setManualInput(trackingNumber);
    
    // Clear any previous errors
    setScanError("");
    
    // Show success message
    console.log(`Successfully scanned: ${trackingNumber}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        stopCamera();
      } catch (error) {
        console.log("Cleanup error:", error);
      }
    };
  }, [stopCamera]);

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
      pending: "bg-amber-50 text-amber-800 border-amber-200",
      picked_up: "bg-blue-50 text-blue-800 border-blue-200",
      in_transit: "bg-indigo-50 text-indigo-800 border-indigo-200",
      delivered: "bg-emerald-50 text-emerald-800 border-emerald-200"
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
            <h1 className="text-lg font-semibold -mt-4">Scan Package</h1>
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
                  {/* Scanner container - HTML5 QR Code will render here */}
                  <div 
                    id="scanner-container" 
                    ref={scannerContainerRef}
                    className="w-full h-48"
                  />
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
                      <li>Point camera at barcode/QR code</li>
                      <li>Camera will automatically close after successful scan</li>
                      {isMobile && (
                        <>
                          <li className="font-medium text-blue-900">📱 Mobile Tips:</li>
                          <li className="ml-4">• Hold device steady for better scanning</li>
                          <li className="ml-4">• Ensure good lighting conditions</li>
                          <li className="ml-4">• Keep barcode/QR code within the scanning box</li>
                        </>
                      )}
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
                      {isMobile ? "Initializing Camera..." : "Starting Camera..."}
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
                      <li>Check browser settings for camera permissions</li>
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

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-800">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-orange-700 space-y-1">
              <p>Device: {isMobile ? 'Mobile' : 'Desktop'}</p>
              <p>Protocol: {getLocationInfo().protocol}</p>
              <p>Hostname: {getLocationInfo().hostname}</p>
              <p>Camera Active: {isCameraActive ? 'Yes' : 'No'}</p>
              <p>Scanning: {isScanning ? 'Yes' : 'No'}</p>
              <p>Scanner Instance: {scannerInstance ? 'Active' : 'None'}</p>
              <p>getUserMedia Support: {typeof navigator?.mediaDevices?.getUserMedia === 'function' ? 'Available' : 'Not Available'}</p>
            </CardContent>
          </Card>
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