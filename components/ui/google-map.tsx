"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface GoogleMapProps {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  name: string;
  className?: string;
  zoom?: number;
}

export function GoogleMap({
  address,
  city,
  province,
  postalCode,
  name,
  className = "",
  zoom = 15
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Load Google Maps script
        const script = document.createElement("script");
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        
        // For development without API key, show embedded map
        if (!apiKey) {
          setIsLoading(false);
          return;
        }

        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", initializeMap);
        script.addEventListener("error", () => {
          setError("Failed to load Google Maps");
          setIsLoading(false);
        });
        document.head.appendChild(script);

        return () => {
          script.removeEventListener("load", initializeMap);
          script.removeEventListener("error", () => {});
        };
      } catch (err) {
        setError("Error loading map");
        setIsLoading(false);
      }
    };

    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        const geocoder = new google.maps.Geocoder();
        const fullAddress = `${address}, ${city}, ${province} ${postalCode}`;

        geocoder.geocode({ address: fullAddress }, (results: GoogleMapsResult, status: GoogleMapsStatus) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;

            const map = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: zoom,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
            });

            // Add marker
            const marker = new google.maps.Marker({
              position: location,
              map: map,
              title: name,
              animation: google.maps.Animation.DROP,
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${name}</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">${address}</p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">${city}, ${province} ${postalCode}</p>
                </div>
              `,
            });

            // Show info window by default
            infoWindow.open(map, marker);

            setIsLoading(false);
          } else {
            setError("Address not found");
            setIsLoading(false);
          }
        });
      } catch (err) {
        setError("Error initializing map");
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [address, city, province, postalCode, name, zoom]);

  // If no API key, show static map with link
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    const fullAddress = `${address}, ${city}, ${province} ${postalCode}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    
    // Static map image from Google (doesn't require API key for basic usage)
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(fullAddress)}&zoom=15&size=600x400&markers=color:blue%7C${encodeURIComponent(fullAddress)}&key=`;

    return (
      <div className={`relative ${className} bg-gray-100 rounded-lg overflow-hidden`}>
        {/* Fallback: Show location info with link to Google Maps */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {address}<br />
              {city}, {province} {postalCode}
            </p>
            
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center text-red-600">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: "384px" }}
      />
    </div>
  );
}

// Type declarations for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMapsResult = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMapsStatus = any;

