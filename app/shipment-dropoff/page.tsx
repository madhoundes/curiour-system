"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { locationsService } from "@/lib/api/locations";
import type { DropoffLocation } from "@/lib/api/types";

export default function ShipmentDropoffPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [locations, setLocations] = useState<DropoffLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<DropoffLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Load drop-off locations on component mount
  useEffect(() => {
    loadDropoffLocations();
  }, []);

  // Load locations from API
  const loadDropoffLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await locationsService.getDropoffLocations({
        limit: 50
      });
      
      setLocations(response.locations);
      setFilteredLocations(response.locations);
    } catch (err: any) {
      console.error('Failed to load drop-off locations:', err);
      setError(err.message || 'Failed to load drop-off locations');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await locationsService.getCurrentLocation();
      setUserLocation(location);
      
      // Load nearby locations
      const response = await locationsService.getNearbyLocations({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 25, // 25km radius
        limit: 50
      });
      
      setLocations(response.locations);
      setFilteredLocations(response.locations);
    } catch (err: any) {
      console.error('Failed to get current location:', err);
      setError(err.message || 'Failed to get your location');
    } finally {
      setGettingLocation(false);
    }
  };

  // Search locations using API
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFilteredLocations(locations);
      return;
    }

    try {
      const response = await locationsService.searchLocations({
        query: query.trim(),
        limit: 50
      });
      
      setFilteredLocations(response.locations);
    } catch (err: any) {
      console.error('Search failed:', err);
      // Fallback to local filtering if API search fails
      const filtered = locations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [locations]);

  // Filter locations based on search and filter criteria
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      // Use API search for non-empty queries
      searchLocations(query);
    } else {
      // Apply local filters for empty search
      filterLocations("", selectedFilter);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    filterLocations(searchQuery, filter);
  };

  const filterLocations = (query: string, filter: string) => {
    let filtered = query.trim() ? filteredLocations : locations;

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
    // Store selected location for the shipment flow
    localStorage.setItem('selectedShipmentDropoffLocation', JSON.stringify(location));
    // Route to the next step in shipment creation (drop-off confirmation)
    router.push('/dropoff-confirmation');
  };

  const handleBackToPurchase = () => {
    // Go back to the purchase label page
    router.push('/purchase-label');
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
                onClick={handleBackToPurchase}
                id="parcego-shipment-dropoff-back-btn"
                className="parcego-nav__back-btn"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Purchase
              </Button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900 -mt-4">Select Drop-off Location</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant={showMap ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                id="parcego-shipment-toggle-map-btn"
                className="parcego-dropoff__toggle-btn"
              >
                <Icon name="Map" size={16} className="mr-2" />
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                id="parcego-shipment-location-btn"
                className="parcego-dropoff__location-btn"
              >
                <Icon name={gettingLocation ? "Loader2" : "MapPin"} size={16} className={`mr-2 ${gettingLocation ? 'animate-spin' : ''}`} />
                {gettingLocation ? "Getting Location..." : "Use My Location"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <Card className="parcego-card parcego-card--error bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-900">Error Loading Locations</h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadDropoffLocations}
                      className="mt-2"
                    >
                      <Icon name="RefreshCw" size={16} className="mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipment Context Banner */}
          <Card className="parcego-card parcego-card--shipment-context bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Icon name="Package" size={20} className="text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Shipment in Progress</h3>
                  <p className="text-sm text-blue-700">
                    Select a drop-off location to complete your shipment. Your package will be ready for pickup.
                    {userLocation && (
                      <span className="block mt-1 font-medium">
                        Showing locations near your current position
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card className="parcego-card parcego-card--search">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="space-y-2">
                  <Label htmlFor="parcego-shipment-location-search">Search for drop-off locations</Label>
                  <div className="relative">
                    <Icon 
                      name="Search" 
                      size={16} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <Input
                      id="parcego-shipment-location-search"
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
                        id={`parcego-shipment-filter-${filter.value}`}
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
                  {loading ? "Loading locations..." : `${filteredLocations.length} locations found`}
                </h2>
                <p className="text-sm text-gray-600">
                  {userLocation ? "Sorted by distance from your location" : "Sorted by distance"}
                </p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index} className="parcego-card animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="h-10 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredLocations.length === 0 ? (
                <Card className="parcego-card parcego-card--no-results">
                  <CardContent className="p-8 text-center">
                    <Icon name="MapPin" size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? "Try adjusting your search or filters to find drop-off locations."
                        : "No drop-off locations are available in your area."
                      }
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setFilteredLocations(locations);
                        }}
                      >
                        Clear Search
                      </Button>
                    )}
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
                                    {location.distance && (
                                      <span className="text-blue-600 font-medium">
                                        ({typeof location.distance === 'number' 
                                          ? locationsService.formatDistance(location.distance)
                                          : location.distance
                                        })
                                      </span>
                                    )}
                                  </div>
                                  
                                  {location.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Icon name="Phone" size={16} />
                                      <span>{location.phone}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2">
                                    <Icon name="Clock" size={16} />
                                    <span>
                                      {location.hours ? (
                                        typeof location.hours === 'string' 
                                          ? location.hours
                                          : `Weekdays: ${location.hours.weekday} | Weekends: ${location.hours.weekend}`
                                      ) : (
                                        "Hours not available"
                                      )}
                                    </span>
                                  </div>

                                  {location.rating && (
                                    <div className="flex items-center space-x-2">
                                      <Icon name="Star" size={16} className="text-yellow-500" />
                                      <span>{location.rating} rating</span>
                                    </div>
                                  )}

                                  {location.estimatedTime && (
                                    <div className="flex items-center space-x-2">
                                      <Icon name="Timer" size={16} className="text-orange-500" />
                                      <span className="font-medium">Estimated drop-off time: {location.estimatedTime}</span>
                                    </div>
                                  )}
                                </div>

                                {location.services && location.services.length > 0 && (
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
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              onClick={() => handleSelectLocation(location)}
                              className="parcego-action-btn parcego-action-btn--select"
                              id={`parcego-shipment-select-location-${location.id}`}
                            >
                              Select for Shipment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="parcego-action-btn parcego-action-btn--directions"
                              id={`parcego-shipment-directions-${location.id}`}
                              onClick={() => {
                                if (location.latitude && location.longitude) {
                                  const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
                                  window.open(url, '_blank');
                                } else {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
                                  window.open(url, '_blank');
                                }
                              }}
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
                        <p className="text-sm font-medium">Click &quot;Show Map&quot; to view locations</p>
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
