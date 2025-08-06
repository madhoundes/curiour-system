"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Icons will be rendered using React.createElement with kebab-case structure

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
  deliveryTime: new Date().toLocaleTimeString(),
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
  
  // State management
  const [deliveryData] = useState<DeliveryData>(mockDeliveryData);
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [timestamp] = useState(new Date().toLocaleString());

  // Get current location (mock)
  useEffect(() => {
    setCurrentLocation(deliveryData.gpsLocation.address);
  }, [deliveryData.gpsLocation.address]);

  // Handle photo capture/upload
  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
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
    
    if (!recipientName.trim()) {
      newErrors.push("Recipient name is required");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Upload proof
  const handleUploadProof = async () => {
    if (!validateForm()) {
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
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:check-circle',
                  style: { width: '80px', height: '80px', color: '#10b981' }
                })}
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
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:arrow-right',
                    style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
                  })}
                  Next Delivery
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={handleBackToDashboard}
                  id="parcego-proof-dashboard-btn"
                >
                  {React.createElement('span', {
                    className: 'iconify lucide-icon',
                    'data-icon': 'lucide:home',
                    style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
                  })}
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
    <div className="min-h-screen bg-gray-50" id="parcego-proof-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10" id="parcego-proof-header">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              id="parcego-proof-back-btn"
            >
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:arrow-left',
                style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
              })}
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
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:package',
                style: { width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }
              })}
              <div className="flex-1">
                <p className="text-sm font-medium">Tracking Number</p>
                <p className="text-sm text-gray-600">{deliveryData.trackingNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:user',
                style: { width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }
              })}
              <div className="flex-1">
                <p className="text-sm font-medium">Customer</p>
                <p className="text-sm text-gray-600">{deliveryData.customerName}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:map-pin',
                style: { width: '20px', height: '20px', color: '#6b7280', flexShrink: 0 }
              })}
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
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:map',
                  style: { width: '24px', height: '24px', color: '#2563eb' }
                })}
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-xs text-gray-600">{currentLocation}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:clock',
                  style: { width: '24px', height: '24px', color: '#2563eb' }
                })}
                <div className="flex-1">
                  <p className="text-sm font-medium">Timestamp</p>
                  <p className="text-xs text-gray-600">{timestamp}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Capture */}
        <Card id="parcego-proof-photo-section">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:camera',
                style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
              })}
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
                    >
                      {React.createElement('span', {
                        className: 'iconify lucide-icon',
                        'data-icon': 'lucide:x',
                        style: { width: '16px', height: '16px', color: 'white' }
                      })}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              className="w-full h-12"
              variant={photos.length > 0 ? "outline" : "default"}
              onClick={handlePhotoCapture}
              id="parcego-proof-capture-btn"
            >
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:camera',
                style: { width: '24px', height: '24px', marginRight: '8px', color: 'currentColor' }
              })}
              {photos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
            </Button>
          </CardContent>
        </Card>

        {/* Digital Signature */}
        <Card id="parcego-proof-signature-section">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:pen-tool',
                style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
              })}
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
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSignature}
                className="flex-1"
                id="parcego-proof-clear-signature-btn"
              >
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:eraser',
                  style: { width: '16px', height: '16px', marginRight: '8px', color: 'currentColor' }
                })}
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Name */}
        <Card id="parcego-proof-recipient-section">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recipient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient-name">
                  Recipient Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient-name"
                  placeholder="Enter recipient name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="mt-1 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Notes */}
        <Card id="parcego-proof-notes-section">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              {React.createElement('span', {
                className: 'iconify lucide-icon',
                'data-icon': 'lucide:file-text',
                style: { width: '20px', height: '20px', marginRight: '8px', color: 'currentColor' }
              })}
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
          <Alert variant="destructive" id="parcego-proof-errors">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <div className="sticky bottom-0 bg-white p-4 -mx-4 border-t">
          <Button 
            className="w-full h-14 text-lg font-semibold"
            onClick={handleUploadProof}
            disabled={isUploading}
            id="parcego-proof-upload-btn"
          >
            {isUploading ? (
              <>
                {React.createElement('span', {
                  className: 'iconify lucide-icon animate-spin',
                  'data-icon': 'lucide:loader-2',
                  style: { width: '24px', height: '24px', marginRight: '8px', color: 'currentColor' }
                })}
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                {React.createElement('span', {
                  className: 'iconify lucide-icon',
                  'data-icon': 'lucide:upload',
                  style: { width: '28px', height: '28px', marginRight: '8px', color: 'currentColor' }
                })}
                Upload Proof of Delivery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}