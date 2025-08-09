"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

const mockPackageData = {
  trackingNumber: "PCG789123456",
  customerName: "Sarah Johnson",
  address: "123 Main Street, Downtown",
  packageType: "Standard",
  weight: "2.5 kg",
  specialInstructions: "Call upon arrival"
};

export default function ScanPackage() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null);
  const [manualEntry, setManualEntry] = useState("");

  const handleScan = () => {
    setIsScanning(true);
    // Simulate camera scanning
    setTimeout(() => {
      setIsScanning(false);
      setScannedCode(mockPackageData.trackingNumber);
      setScanResult("success");
    }, 2000);
  };

  const handleManualEntry = () => {
    if (manualEntry === mockPackageData.trackingNumber) {
      setScannedCode(manualEntry);
      setScanResult("success");
    } else {
      setScanResult("error");
    }
  };

  const handleConfirmPickup = () => {
    // Navigate to route page after successful scan
    router.push('/courier/route');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      id="parcego-scan-package-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-scan-header"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="parcego-header__back-btn"
            id="parcego-scan-back-btn"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 
            className="text-xl font-semibold"
            id="parcego-scan-title"
          >
            Scan Package
          </h1>
        </div>
      </div>

      <div 
        className="p-4 space-y-6"
        id="parcego-scan-content"
      >
        {/* Scanner Interface */}
        <Card 
          className="parcego-scanner-card"
          id="parcego-scanner-interface"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="QrCode" size={20} />
              <span>Barcode Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning && !scanResult && (
              <div 
                className="bg-gray-100 rounded-lg p-8 text-center"
                id="parcego-scanner-placeholder"
              >
                <Icon name="Camera" size={64} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Position the package barcode within the frame
                </p>
                <Button
                  onClick={handleScan}
                  className="parcego-action-btn parcego-action-btn--scan"
                  id="parcego-start-scan-btn"
                >
                  <Icon name="Camera" size={16} className="mr-2" />
                  Start Scanning
                </Button>
              </div>
            )}

            {isScanning && (
              <div 
                className="bg-blue-50 rounded-lg p-8 text-center"
                id="parcego-scanning-active"
              >
                <div className="animate-pulse">
                  <Icon name="QrCode" size={64} className="mx-auto mb-4 text-blue-600" />
                </div>
                <p className="text-blue-600 mb-2">Scanning...</p>
                <p className="text-sm text-gray-600">
                  Hold steady and ensure the barcode is clearly visible
                </p>
              </div>
            )}

            {scanResult === "success" && (
              <div 
                className="bg-green-50 rounded-lg p-6 text-center"
                id="parcego-scan-success"
              >
                <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-green-600" />
                <p className="text-green-700 font-medium mb-2">Scan Successful!</p>
                <p className="text-sm text-gray-600 mb-4">
                  Package verified: {scannedCode}
                </p>
              </div>
            )}

            {scanResult === "error" && (
              <div 
                className="bg-red-50 rounded-lg p-6 text-center"
                id="parcego-scan-error"
              >
                <Icon name="AlertCircle" size={48} className="mx-auto mb-3 text-red-600" />
                <p className="text-red-700 font-medium mb-2">Scan Failed</p>
                <p className="text-sm text-gray-600 mb-4">
                  Package not found or invalid barcode
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScanResult(null);
                    setScannedCode("");
                    setManualEntry("");
                  }}
                  className="parcego-action-btn parcego-action-btn--retry"
                  id="parcego-retry-scan-btn"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card 
          className="parcego-manual-entry-card"
          id="parcego-manual-entry"
        >
          <CardHeader>
            <CardTitle className="text-lg">Manual Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label 
                htmlFor="manual-tracking"
                className="parcego-label"
                id="parcego-manual-tracking-label"
              >
                Tracking Number
              </Label>
              <Input
                id="manual-tracking"
                placeholder="Enter tracking number manually"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                className="parcego-input parcego-input--tracking"
              />
            </div>
            <Button
              onClick={handleManualEntry}
              variant="outline"
              className="w-full parcego-action-btn parcego-action-btn--manual"
              id="parcego-manual-submit-btn"
              disabled={!manualEntry.trim()}
            >
              Verify Package
            </Button>
          </CardContent>
        </Card>

        {/* Package Details (shown after successful scan) */}
        {scanResult === "success" && (
          <Card 
            className="parcego-package-details-card"
            id="parcego-package-details"
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="Package" size={20} />
                <span>Package Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Customer</Label>
                  <p 
                    className="text-gray-900"
                    id="parcego-package-customer"
                  >
                    {mockPackageData.customerName}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
                  <p 
                    className="text-gray-900 flex items-center"
                    id="parcego-package-address"
                  >
                    <Icon name="MapPin" size={16} className="mr-1 text-gray-500" />
                    {mockPackageData.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Package Type</Label>
                    <p 
                      className="text-gray-900"
                      id="parcego-package-type"
                    >
                      {mockPackageData.packageType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Weight</Label>
                    <p 
                      className="text-gray-900"
                      id="parcego-package-weight"
                    >
                      {mockPackageData.weight}
                    </p>
                  </div>
                </div>

                {mockPackageData.specialInstructions && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Special Instructions</Label>
                    <div 
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1"
                      id="parcego-package-instructions"
                    >
                      <p className="text-yellow-800 text-sm flex items-center">
                        <Icon name="AlertCircle" size={16} className="mr-2" />
                        {mockPackageData.specialInstructions}
                      </p>
                    </div>
                  </div>
                )}

                <div 
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                  id="parcego-pickup-status"
                >
                  <div className="flex items-center">
                    <Icon name="CheckCircle" size={20} className="mr-2 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium">Ready for Pickup</p>
                      <p className="text-green-700 text-sm">Package verified and ready for delivery</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirmPickup}
                className="w-full parcego-action-btn parcego-action-btn--confirm-pickup"
                id="parcego-confirm-pickup-btn"
              >
                <Icon name="CheckCircle" size={16} className="mr-2" />
                Confirm Pickup & Start Route
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card 
          className="parcego-help-card"
          id="parcego-scan-help"
        >
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Need help? Ensure the barcode is clean and well-lit.
              </p>
              <p className="text-xs text-gray-500">
                If scanning continues to fail, use manual entry or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}