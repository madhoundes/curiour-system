"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

// Mock drop-off location data
const mockDropoffLocations = [
  {
    id: "loc-001",
    name: "FedEx Office - Manhattan",
    address: "456 Broadway, New York, NY 10013",
    phone: "(212) 555-0123",
    distance: "0.8 miles",
    rating: 4.8,
    hours: {
      weekday: "8:00 AM - 8:00 PM",
      weekend: "9:00 AM - 6:00 PM"
    },
    isOpen: true,
    type: "fedex",
    services: ["Drop-off", "Packaging", "Printing"]
  },
  {
    id: "loc-002", 
    name: "UPS Store - SoHo",
    address: "789 Spring St, New York, NY 10012",
    phone: "(212) 555-0456",
    distance: "1.2 miles",
    rating: 4.6,
    hours: {
      weekday: "7:00 AM - 9:00 PM",
      weekend: "8:00 AM - 7:00 PM"
    },
    isOpen: true,
    type: "ups",
    services: ["Drop-off", "Packaging", "Notary"]
  },
  {
    id: "loc-003",
    name: "USPS Post Office - Village",
    address: "321 West 4th St, New York, NY 10014",
    phone: "(212) 555-0789",
    distance: "1.5 miles",
    rating: 4.3,
    hours: {
      weekday: "9:00 AM - 5:00 PM",
      weekend: "9:00 AM - 3:00 PM"
    },
    isOpen: false,
    type: "usps",
    services: ["Drop-off", "Mail Services"]
  },
  {
    id: "loc-004",
    name: "Pack & Ship Express",
    address: "654 6th Ave, New York, NY 10010",
    phone: "(212) 555-0321",
    distance: "2.1 miles",
    rating: 4.9,
    hours: {
      weekday: "8:00 AM - 7:00 PM",
      weekend: "9:00 AM - 5:00 PM"
    },
    isOpen: true,
    type: "independent",
    services: ["Drop-off", "Packaging", "Printing", "Notary"]
  },
  {
    id: "loc-005",
    name: "Amazon Hub Counter - Whole Foods",
    address: "95 E Houston St, New York, NY 10012",
    phone: "(212) 555-0654",
    distance: "2.3 miles",
    rating: 4.4,
    hours: {
      weekday: "7:00 AM - 10:00 PM",
      weekend: "7:00 AM - 10:00 PM"
    },
    isOpen: true,
    type: "amazon",
    services: ["Drop-off", "Returns"]
  }
];

interface DropoffLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  hours: {
    weekday: string;
    weekend: string;
  };
  isOpen: boolean;
  type: string;
  services: string[];
}

export default function FindDropoffPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<DropoffLocation[]>(mockDropoffLocations);

  // Filter locations based on search and filter criteria
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterLocations(query, selectedFilter);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    filterLocations(searchQuery, filter);
  };

  const filterLocations = (query: string, filter: string) => {
    let filtered = mockDropoffLocations;

    // Apply text search
    if (query) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filter
    switch (filter) {
      case "open":
        filtered = filtered.filter(location => location.isOpen);
        break;
      case "fedex":
      case "ups":
      case "usps":
      case "amazon":
      case "independent":
        filtered = filtered.filter(location => location.type === filter);
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    setFilteredLocations(filtered);
  };

  const handleSelectLocation = (location: DropoffLocation) => {
    // Store selected location for confirmation page
    localStorage.setItem('selectedDropoffLocation', JSON.stringify(location));
    router.push('/dropoff-confirmation');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                id="parcego-dropoff-finder-back-btn"
                className="parcego-nav__back-btn"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Find Drop-off Location</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant={showMap ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                id="parcego-toggle-map-btn"
                className="parcego-dropoff__toggle-btn"
              >
                <Icon name="Map" size={16} className="mr-2" />
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          {/* Search and Filters */}
          <Card className="parcego-card parcego-card--search">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="space-y-2">
                  <Label htmlFor="parcego-location-search">Search for drop-off locations</Label>
                  <div className="relative">
                    <Icon 
                      name="Search" 
                      size={16} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <Input
                      id="parcego-location-search"
                      placeholder="Enter address, zip code, or location name"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="parcego-form__input pl-10"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter by:</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All Locations" },
                      { value: "open", label: "Open Now" },
                      { value: "fedex", label: "FedEx" },
                      { value: "ups", label: "UPS" },
                      { value: "usps", label: "USPS" },
                      { value: "amazon", label: "Amazon" },
                      { value: "independent", label: "Independent" }
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={selectedFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange(filter.value)}
                        className="parcego-filter-btn"
                        id={`parcego-filter-${filter.value}`}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Locations List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredLocations.length} locations found
                </h2>
                <p className="text-sm text-gray-600">
                  Sorted by distance
                </p>
              </div>

              {filteredLocations.length === 0 ? (
                <Card className="parcego-card parcego-card--no-results">
                  <CardContent className="p-8 text-center">
                    <Icon name="MapPin" size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters to find drop-off locations.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredLocations.map((location) => (
                    <Card 
                      key={location.id}
                      className="parcego-card parcego-card--location hover:shadow-md transition-shadow duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {location.name}
                                  </h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(location.type)}`}>
                                    {location.type.toUpperCase()}
                                  </span>
                                  {location.isOpen ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Icon name="CheckCircle" size={12} className="mr-1" />
                                      Open
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <Icon name="Clock" size={12} className="mr-1" />
                                      Closed
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <Icon name="MapPin" size={16} />
                                    <span>{location.address}</span>
                                    <span className="text-blue-600 font-medium">({location.distance})</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Icon name="Phone" size={16} />
                                    <span>{location.phone}</span>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Icon name="Clock" size={16} />
                                    <span>
                                      Weekdays: {location.hours.weekday} | 
                                      Weekends: {location.hours.weekend}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Icon name="Star" size={16} className="text-yellow-500" />
                                    <span>{location.rating} rating</span>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {location.services.map((service, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
                                      >
                                        {service}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              onClick={() => handleSelectLocation(location)}
                              className="parcego-action-btn parcego-action-btn--select"
                              id={`parcego-select-location-${location.id}`}
                            >
                              Select Location
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="parcego-action-btn parcego-action-btn--directions"
                              id={`parcego-directions-${location.id}`}
                            >
                              <Icon name="Navigation" size={12} className="mr-1" />
                              Directions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="lg:col-span-1">
              <Card className="parcego-card parcego-card--map sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Map" size={20} className="text-blue-600" />
                    <span>Map View</span>
                  </CardTitle>
                  <CardDescription>
                    Interactive map showing all drop-off locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showMap ? (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-80 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Icon name="Map" size={48} className="mx-auto mb-4" />
                        <p className="text-sm">Google Maps Integration</p>
                        <p className="text-xs text-gray-400 mt-1">
                          (Placeholder for production implementation)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg h-80 flex items-center justify-center">
                      <div className="text-center text-blue-600">
                        <Icon name="Map" size={48} className="mx-auto mb-4" />
                        <p className="text-sm font-medium">Click "Show Map" to view locations</p>
                        <p className="text-xs text-blue-500 mt-1">
                          See all drop-off points on an interactive map
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}