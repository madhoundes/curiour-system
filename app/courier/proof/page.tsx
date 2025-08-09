"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";

interface DeliveryData {
  trackingNumber: string;
  customerName: string;
  address: string;
  packageType: string;
  deliveryTime: string;
  gpsLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

const mockDeliveryData: DeliveryData = {
  trackingNumber: "PCG-2025-789456",
  customerName: "Sarah Johnson",
  address: "123 Main Street, Downtown District, NY 10001",
  packageType: "Express Delivery",
  // Filled on client via effect to avoid SSR/CSR mismatch
  deliveryTime: "",
  gpsLocation: {
    lat: 40.7128,
    lng: -74.0060,
    address: "123 Main Street, New York, NY 10001"
  }
};

export default function ProofOfDelivery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  
  // State management
  const [deliveryData] = useState<DeliveryData>(mockDeliveryData);
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [clientDeliveryTime, setClientDeliveryTime] = useState("");

  // Get current location and timestamp (mock)
  useEffect(() => {
    setCurrentLocation(deliveryData.gpsLocation.address);
    setTimestamp(new Date().toLocaleString());
    if (!clientDeliveryTime) {
      setClientDeliveryTime(new Date().toLocaleTimeString());
    }
  }, [deliveryData.gpsLocation.address, clientDeliveryTime]);

  // Handle photo capture/upload
  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };
  const handlePhotoCaptureKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePhotoCapture();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos([...photos, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (photos.length === 0) {
      newErrors.push("At least one photo is required");
    }
    
    if (!signature) {
      newErrors.push("Customer signature is required");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const isFormValid = photos.length > 0 && Boolean(signature);

  const focusFirstError = () => {
    if (photos.length === 0) {
      captureButtonRef.current?.focus();
      return;
    }
    if (!signature) {
      canvasRef.current?.focus();
    }
  };

  // Upload proof
  const handleUploadProof = async () => {
    if (!validateForm()) {
      focusFirstError();
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      setIsCompleted(true);
      clearInterval(interval);
    }, 2000);
  };

  const handleNextDelivery = () => {
    router.push("/courier");
  };

  const handleBackToDashboard = () => {
    router.push("/courier");
  };

  // Success screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4" id="parcego-proof-success-container">
        <div className="max-w-md mx-auto">
          <Card className="text-center" id="parcego-proof-success-card">
            <CardContent className="pt-12 pb-8">
              <div className="mb-6 flex justify-center">
                <Icon name="CircleCheck" size={80} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delivery Completed!</h2>
              <p className="text-gray-600 mb-2">Package #{deliveryData.trackingNumber}</p>
              <p className="text-sm text-gray-500 mb-6">
                Proof of delivery has been uploaded successfully
              </p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full h-12"
                  onClick={handleNextDelivery}
                  id="parcego-proof-next-delivery-btn"
                >
                  <Icon name="ArrowRight" size={20} className="mr-2" />
                  Next Delivery
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={handleBackToDashboard}
                  id="parcego-proof-dashboard-btn"
                >
                  <Icon name="Home" size={20} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      id="parcego-proof-container"
      aria-busy={isUploading ? "true" : undefined}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10" id="parcego-proof-header">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              id="parcego-proof-back-btn"
              aria-label="Go back"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Proof of Delivery</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Delivery Info Card */}
        <Card id="parcego-proof-delivery-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Delivery Information</span>
              <Badge className="parcego-proof__badge--express">
                {deliveryData.packageType}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <Icon name="Package" size={20} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Tracking Number</p>
                <p className="text-sm text-gray-600">{deliveryData.trackingNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="User" size={20} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-gray-600">{deliveryData.customerName}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="MapPin" size={20} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Delivery Address</p>
                <p className="text-sm text-gray-600">{deliveryData.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPS & Timestamp */}
        <Card id="parcego-proof-location-time">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Icon name="Map" size={24} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-xs text-gray-600">{currentLocation || 'Loading...'}</p>
                </div>
              </div>
              
                <div className="flex items-center space-x-3">
                <Icon name="Clock" size={24} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Timestamp</p>
                    <p className="text-xs text-gray-600">{timestamp || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">{clientDeliveryTime || '...'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Capture */}
        <Card id="parcego-proof-photo-section" aria-labelledby="parcego-proof-photo-title">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center" id="parcego-proof-photo-title">
              <Icon name="Camera" size={20} className="mr-2" />
              Package Photo
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="parcego-proof-file-input"
              aria-label="Upload or capture a package photo"
            />
            
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative group"
                    id={`parcego-proof-photo-${index}`}
                  >
                    <img 
                      src={photo} 
                      alt={`Delivery photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      onClick={() => removePhoto(index)}
                      id={`parcego-proof-remove-photo-${index}`}
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <Icon name="X" size={16} className="text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {photos.length === 0 && (
              <p id="parcego-proof-photo-error" className="text-sm text-red-600 mb-3">
                At least one photo is required
              </p>
            )}
            
            <Button 
              className="w-full h-12"
              variant={photos.length > 0 ? "outline" : "default"}
              onClick={handlePhotoCapture}
              id="parcego-proof-capture-btn"
              ref={captureButtonRef}
              onKeyDown={handlePhotoCaptureKeyDown}
              aria-describedby={photos.length === 0 ? "parcego-proof-photo-error" : undefined}
              aria-label={photos.length > 0 ? 'Add another delivery photo' : 'Take a delivery photo'}
            >
              <Icon name="Camera" size={24} className="mr-2" />
              {photos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
            </Button>
          </CardContent>
        </Card>

        {/* Digital Signature */}
        <Card id="parcego-proof-signature-section" aria-labelledby="parcego-proof-signature-title">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center" id="parcego-proof-signature-title">
              <Icon name="PenTool" size={20} className="mr-2" />
              Customer Signature
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 mb-3 bg-white">
              <canvas
                ref={canvasRef}
                width={320}
                height={150}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                id="parcego-proof-signature-canvas"
                tabIndex={0}
                aria-label="Signature pad. Use touch or mouse to sign."
                aria-required="true"
                aria-describedby={!signature ? "parcego-proof-signature-error" : undefined}
              />
            </div>
            {!signature && (
              <p id="parcego-proof-signature-error" className="text-sm text-red-600 mb-2">
                Customer signature is required
              </p>
            )}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSignature}
                className="flex-1"
                id="parcego-proof-clear-signature-btn"
                aria-label="Clear signature"
              >
                <Icon name="Eraser" size={16} className="mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Name removed: shown in Delivery Information card (customerName) */}

        {/* Delivery Notes */}
        <Card id="parcego-proof-notes-section">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Icon name="FileText" size={20} className="mr-2" />
              Delivery Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any delivery notes or special instructions..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              rows={3}
              className="resize-none"
              id="parcego-proof-notes-textarea"
            />
          </CardContent>
        </Card>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div role="alert" aria-live="assertive">
            <Alert variant="destructive" id="parcego-proof-errors">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Upload Button */}
        <div className="sticky bottom-0 bg-white p-4 -mx-4 border-t">
          <Button 
            className="w-full h-14 text-lg font-semibold"
            onClick={handleUploadProof}
            disabled={!isFormValid || isUploading}
            id="parcego-proof-upload-btn"
            aria-disabled={!isFormValid || isUploading}
          >
            {isUploading ? (
              <>
                <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                <span
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgress}
                  className="sr-only"
                >
                  Upload progress {uploadProgress}%
                </span>
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Icon name="Upload" size={28} className="mr-2" />
                Upload Proof of Delivery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}