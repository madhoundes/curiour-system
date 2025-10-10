"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { GoogleMap } from "@/components/ui/google-map";

// Main business location data
const mainDropoffLocation = {
  id: "loc-main",
  name: "Parcego Business Hub",
  address: "3883 Quartz Road, Unit 3404",
  city: "Toronto",
  province: "ON",
  postalCode: "M4B 2Z8",
  phone: "(416) 555-SHIP",
  email: "dropoff@parcego.com",
  distance: "Central Location",
  rating: 5.0,
  hours: {
    weekday: "8:00 AM - 6:00 PM",
    weekend: "9:00 AM - 4:00 PM",
    special: "Extended hours during peak season"
  },
  isOpen: true,
  type: "parcego",
  services: ["Package Drop-off", "Express Processing", "Packaging Materials", "Customer Support", "Label Printing"],
  features: [
    "24/7 Secure Drop-off Lockers",
    "Same-day Processing",
    "Dedicated Customer Service",
    "Real-time Package Tracking",
    "Multiple Payment Options"
  ],
  description: "Our main business hub offers comprehensive courier services with state-of-the-art facilities and dedicated staff to ensure your packages are handled with care."
};

export default function FindDropoffPage() {
  const handleGetDirections = () => {
    // Open Google Maps with the business address
    const address = encodeURIComponent(`${mainDropoffLocation.address}, ${mainDropoffLocation.city}, ${mainDropoffLocation.province} ${mainDropoffLocation.postalCode}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Drop-off Location"
          description="Visit our main business hub for convenient package drop-off and comprehensive courier services"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Details */}
          <div className="space-y-6">
            {/* Main Location Card */}
            <Card className="parcego-card parcego-card--main-location">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center space-x-3">
                      <Icon name="Building" size={24} className="text-blue-600" />
                      <span className="text-xl">{mainDropoffLocation.name}</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Icon name="CheckCircle" size={16} className="mr-1" />
                        Open Now
                      </span>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {mainDropoffLocation.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Icon name="MapPin" size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600 text-sm">
                          {mainDropoffLocation.address}<br />
                          {mainDropoffLocation.city}, {mainDropoffLocation.province} {mainDropoffLocation.postalCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Icon name="Phone" size={18} className="text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600 text-sm">{mainDropoffLocation.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Icon name="Mail" size={18} className="text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600 text-sm">{mainDropoffLocation.email}</p>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Hours */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-3">
                    <Icon name="Clock" size={18} className="text-gray-500 flex-shrink-0" />
                    <span>Business Hours</span>
                  </h4>
                  <div className="space-y-3 pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Monday - Friday:</span>
                      <span className="font-medium text-gray-900 text-sm">{mainDropoffLocation.hours.weekday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Saturday - Sunday:</span>
                      <span className="font-medium text-gray-900 text-sm">{mainDropoffLocation.hours.weekend}</span>
                    </div>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm text-blue-600 font-medium">{mainDropoffLocation.hours.special}</p>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Icon name="Package" size={18} className="text-gray-500" />
                    <span>Available Services</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mainDropoffLocation.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Features */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                    <Icon name="Shield" size={18} className="text-gray-500" />
                    <span>Special Features</span>
                  </h4>
                  <div className="space-y-2">
                    {mainDropoffLocation.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleGetDirections}
                    variant="outline"
                    className="parcego-action-btn parcego-action-btn--directions border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 h-12 text-base font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="parcego-get-directions-btn"
                  >
                    <Icon name="Navigation" size={18} className="mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Map Section */}
          <div className="lg:col-span-1">
            <Card className="parcego-card parcego-card--map sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="Map" size={20} className="text-blue-600" />
                  <span>Location Map</span>
                </CardTitle>
                <CardDescription>
                  Interactive map showing our main drop-off location
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 w-full rounded-lg overflow-hidden">
                  <GoogleMap
                    address={mainDropoffLocation.address}
                    city={mainDropoffLocation.city}
                    province={mainDropoffLocation.province}
                    postalCode={mainDropoffLocation.postalCode}
                    name={mainDropoffLocation.name}
                    className="h-full w-full"
                    zoom={16}
                  />
                </div>
                
                {/* Quick Info Below Map */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Distance from you:</span>
                      <span className="font-medium text-gray-900">{mainDropoffLocation.distance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                        Open Now
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}