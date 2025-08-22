"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, Clock, Package, ArrowLeft } from "lucide-react";
import { useWizardBack } from "@/lib/wizard";

interface DropoffLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
  type: string;
  services: string[];
}

export default function DropoffConfirmationPage() {
  const router = useRouter();
  const wizardBack = useWizardBack();
  const [selectedLocation, setSelectedLocation] = useState<DropoffLocation | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationComplete, setConfirmationComplete] = useState(false);
  const [isShipmentFlow, setIsShipmentFlow] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mock tracking number (deferred to client to avoid SSR hydration mismatch)
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  // Ensure client-side rendering to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load selected location from localStorage
  useEffect(() => {
    if (!isClient) return;

    // Generate after mount to keep SSR/CSR markup identical
    const generateTracking = () => {
      const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const ts = Date.now().toString().slice(-6);
      return `PCG${ts}${suffix}`;
    };
    if (!trackingNumber) {
      setTrackingNumber(generateTracking());
    }

    // Check for both types of saved locations
    const savedShipmentLocation = localStorage.getItem('selectedShipmentDropoffLocation');
    const savedGeneralLocation = localStorage.getItem('selectedDropoffLocation');
    
    if (savedShipmentLocation) {
      setSelectedLocation(JSON.parse(savedShipmentLocation));
      // This is from shipment flow
      setIsShipmentFlow(true);
    } else if (savedGeneralLocation) {
      setSelectedLocation(JSON.parse(savedGeneralLocation));
      // This is from general finder
      setIsShipmentFlow(false);
    } else {
      // If no location selected, redirect back to finder
      router.push('/find-dropoff');
    }
  }, [router, trackingNumber, isClient]);

  const handleBackToFinder = () => {
    if (isShipmentFlow) {
      // Go back to shipment dropoff page
      router.push('/shipment-dropoff');
    } else {
      // Go back to general finder
      wizardBack();
    }
  };

  const handleConfirmDropoff = () => {
    setIsConfirming(true);
    
    // Simulate confirmation process
    setTimeout(() => {
      setIsConfirming(false);
      setConfirmationComplete(true);
      
      // Clean up localStorage based on flow type
      if (isShipmentFlow) {
        localStorage.removeItem('selectedShipmentDropoffLocation');
      } else {
        localStorage.removeItem('selectedDropoffLocation');
      }
    }, 2000);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleTrackPackage = () => {
    // In real app, this would navigate to tracking page with the tracking number
    router.push(`/track-package?tracking=${trackingNumber}`);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      fedex: "bg-purple-100 text-purple-800",
      ups: "bg-yellow-100 text-yellow-800", 
      usps: "bg-blue-100 text-blue-800",
      amazon: "bg-orange-100 text-orange-800",
      independent: "bg-green-100 text-green-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (confirmationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Success Header */}
        <div className="bg-green-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-3">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Drop-off Location Confirmed!</h1>
              <p className="text-green-100 mt-2">Your package is ready to be dropped off at the selected location.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            
            {/* Confirmation Details */}
            <Card className="parcego-card parcego-card--success-confirmation">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package size={20} className="text-green-600" />
                  <span>Drop-off Confirmed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tracking Number</h4>
                    <div className="bg-gray-50 p-3 rounded-lg font-mono text-lg">
                      {trackingNumber}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Drop-off Location</h4>
                    <p className="text-gray-600">{selectedLocation.name}</p>
                    <p className="text-sm text-gray-500">{selectedLocation.address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Estimated Drop-off</h4>
                    <p className="text-gray-600">Within 24 hours</p>
                    <p className="text-sm text-gray-500">Please drop off your package soon</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Step</h4>
                    <p className="text-gray-600">Drop off your labeled package</p>
                    <p className="text-sm text-gray-500">Make sure the label is securely attached</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="parcego-card parcego-card--instructions">
              <CardHeader>
                <CardTitle>Drop-off Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Before you go:</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <span>Ensure your shipping label is printed and securely attached to the package</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <span>Check the location hours: {selectedLocation.hours} (weekdays)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <span>Bring a valid ID if required by the drop-off location</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <span>Get a receipt from the drop-off location as proof of delivery</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleTrackPackage}
                className="parcego-action-btn parcego-action-btn--track"
                id="parcego-track-package-btn"
              >
                <Package size={16} className="mr-2" />
                Track Your Package
              </Button>
              <Button
                variant="outline"
                onClick={handleGoToDashboard}
                className="parcego-action-btn parcego-action-btn--dashboard"
                id="parcego-go-dashboard-btn"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToFinder}
                disabled={isConfirming}
                id="parcego-dropoff-confirmation-back-btn"
                className="parcego-nav__back-btn"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Locations
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Confirm Drop-off Location</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* Selected Location Details */}
          <Card className="parcego-card parcego-card--selected-location">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin size={20} className="text-blue-600" />
                <span>Selected Drop-off Location</span>
              </CardTitle>
              <CardDescription>
                Review your selected location details before confirming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Location Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedLocation.name}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedLocation.type)}`}>
                        {selectedLocation.type.toUpperCase()}
                      </span>
                      {/* Assuming isOpen is not directly available in DropoffLocation interface,
                          but we can add a placeholder or assume it's always true for now */}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Open Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin size={20} className="mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">{selectedLocation.address}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          {selectedLocation.distance} away
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock size={20} className="mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Hours</p>
                        <p className="text-gray-600">
                          <span className="block">Weekdays: {selectedLocation.hours}</span>
                          <span className="block">Weekends: {selectedLocation.hours}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Clock size={20} className="mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Rating</p>
                        <p className="text-gray-600">N/A</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Package size={20} className="mt-0.5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLocation.services.map((service, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Information */}
          <Card className="parcego-card parcego-card--shipment-info">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package size={20} className="text-green-600" />
                <span>Your Shipment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Tracking Number:</span>
                      <span className="ml-2 text-gray-700 font-mono">{trackingNumber || "Generating..."}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Service:</span>
                    <span className="ml-2 text-gray-700">Standard Shipping</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>
                    <span className="ml-2 text-orange-600 font-medium">Ready for Drop-off</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          {/* Assuming isOpen is not directly available in DropoffLocation interface,
              but we can add a placeholder or assume it's always true for now */}
          {/* <Card className="parcego-card parcego-card--warning border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="mt-0.5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Location Currently Closed</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This location is currently closed. Please check the hours and plan your drop-off accordingly.
                    You can still confirm this location for future drop-off.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBackToFinder}
              disabled={isConfirming}
              className="parcego-action-btn parcego-action-btn--back order-2 sm:order-1"
              id="parcego-back-to-finder-btn"
            >
              <ArrowLeft size={16} className="mr-2" />
              Choose Different Location
            </Button>

            <div className="flex space-x-3 order-1 sm:order-2">
              <Button
                variant="outline"
                className="parcego-action-btn parcego-action-btn--directions"
                id="parcego-get-directions-btn"
              >
                {/* Navigation icon is not imported, using a placeholder or removing */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-navigation mr-2"><path d="m3 11 19-9-9 19-2-6-6-2 19-9"/></svg>
                Get Directions
              </Button>
              
              <Button
                onClick={handleConfirmDropoff}
                disabled={isConfirming}
                className="parcego-action-btn parcego-action-btn--confirm"
                id="parcego-confirm-dropoff-btn"
              >
                {isConfirming ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Confirming...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirm Drop-off Location
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}