"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Upload,
  MapPin,
  Clock,
  User,
  FileText,
  Signature,
  AlertCircle
} from "lucide-react";

const mockDeliveryData = {
  trackingNumber: "PCG789123456",
  customerName: "Sarah Johnson",
  address: "123 Main Street, Downtown",
  deliveryTime: new Date().toLocaleTimeString(),
  packageType: "Standard"
};

export default function ProofOfDelivery() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTakePhoto = () => {
    // Mock photo capture
    const mockPhotoUrl = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
        <rect width="200" height="150" fill="#f3f4f6"/>
        <circle cx="100" cy="75" r="30" fill="#d1d5db"/>
        <text x="100" y="120" text-anchor="middle" fill="#6b7280" font-size="12">Photo ${photos.length + 1}</text>
      </svg>
    `)}`;
    setPhotos([...photos, mockPhotoUrl]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSignature = () => {
    // Mock signature capture
    setSignature("Customer signature captured");
  };

  const handleSubmitProof = async () => {
    setIsUploading(true);
    
    // Mock upload process
    setTimeout(() => {
      setIsUploading(false);
      setIsCompleted(true);
      
      // Redirect to success page after a delay
      setTimeout(() => {
        router.push('/courier/delivery-success');
      }, 2000);
    }, 3000);
  };

  const handleGoBack = () => {
    router.back();
  };

  const isFormValid = photos.length > 0 && customerName.trim() !== "";

  if (isCompleted) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        id="parcego-proof-success-container"
      >
        <Card 
          className="w-full max-w-md parcego-success-card"
          id="parcego-proof-success-card"
        >
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Delivery Complete!</h2>
            <p className="text-gray-600 mb-4">
              Proof of delivery has been uploaded successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      id="parcego-proof-delivery-container"
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b px-4 py-4"
        id="parcego-proof-header"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="parcego-header__back-btn"
            id="parcego-proof-back-btn"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 
            className="text-xl font-semibold"
            id="parcego-proof-title"
          >
            Proof of Delivery
          </h1>
        </div>
      </div>

      <div 
        className="p-4 space-y-6"
        id="parcego-proof-content"
      >
        {/* Delivery Info */}
        <Card 
          className="parcego-delivery-info-card"
          id="parcego-delivery-info"
        >
          <CardHeader>
            <CardTitle className="text-lg">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-700">Customer</Label>
              <p 
                className="text-gray-900"
                id="parcego-delivery-customer"
              >
                {mockDeliveryData.customerName}
              </p>
            </div>
            
            <div className="flex justify-between items-start">
              <Label className="text-sm font-medium text-gray-700">Address</Label>
              <p 
                className="text-gray-900 text-right max-w-48"
                id="parcego-delivery-address"
              >
                {mockDeliveryData.address}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-700">Tracking</Label>
              <Badge 
                variant="secondary"
                className="parcego-tracking-badge"
                id="parcego-delivery-tracking"
              >
                {mockDeliveryData.trackingNumber}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-700">Delivered at</Label>
              <p 
                className="text-gray-900 flex items-center"
                id="parcego-delivery-time"
              >
                <Clock className="h-4 w-4 mr-1" />
                {mockDeliveryData.deliveryTime}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photo Capture */}
        <Card 
          className="parcego-photo-capture-card"
          id="parcego-photo-capture"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Photo Evidence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photos.length === 0 && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                id="parcego-photo-placeholder"
              >
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Take a photo of the delivered package
                </p>
                <Button
                  onClick={handleTakePhoto}
                  className="parcego-action-btn parcego-action-btn--photo"
                  id="parcego-take-photo-btn"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            )}

            {photos.length > 0 && (
              <div className="space-y-4">
                <div 
                  className="grid grid-cols-2 gap-3"
                  id="parcego-photo-grid"
                >
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative parcego-photo-item"
                      id={`parcego-photo-${index}`}
                    >
                      <img
                        src={photo}
                        alt={`Delivery photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0 parcego-remove-photo-btn"
                        id={`parcego-remove-photo-${index}`}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleTakePhoto}
                  className="w-full parcego-action-btn parcego-action-btn--add-photo"
                  id="parcego-add-photo-btn"
                  disabled={photos.length >= 4}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Another Photo ({photos.length}/4)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Verification */}
        <Card 
          className="parcego-customer-verification-card"
          id="parcego-customer-verification"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label 
                htmlFor="customer-name"
                className="parcego-label"
                id="parcego-customer-name-label"
              >
                Received by (Full Name) *
              </Label>
              <Input
                id="customer-name"
                placeholder="Enter recipient's full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="parcego-input parcego-input--customer-name"
              />
            </div>

            <div>
              <Label 
                htmlFor="signature"
                className="parcego-label"
                id="parcego-signature-label"
              >
                Digital Signature
              </Label>
              {!signature ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                  id="parcego-signature-placeholder"
                >
                  <Signature className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm mb-3">
                    Capture customer signature
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleSignature}
                    className="parcego-action-btn parcego-action-btn--signature"
                    id="parcego-capture-signature-btn"
                  >
                    <Signature className="h-4 w-4 mr-2" />
                    Capture Signature
                  </Button>
                </div>
              ) : (
                <div 
                  className="bg-gray-50 border rounded-lg p-4"
                  id="parcego-signature-captured"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{signature}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSignature("")}
                      className="parcego-action-btn parcego-action-btn--retake-signature"
                      id="parcego-retake-signature-btn"
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card 
          className="parcego-notes-card"
          id="parcego-delivery-notes"
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Additional Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional notes about the delivery (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="parcego-textarea parcego-textarea--notes"
              id="parcego-delivery-notes-input"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card 
          className="parcego-submit-card"
          id="parcego-submit-proof"
        >
          <CardContent className="p-4">
            {!isFormValid && (
              <div 
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4"
                id="parcego-form-validation"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm">
                    Please take at least one photo and enter the recipient's name
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmitProof}
              disabled={!isFormValid || isUploading}
              className="w-full h-12 parcego-action-btn parcego-action-btn--submit"
              id="parcego-submit-proof-btn"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Proof...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Delivery
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}