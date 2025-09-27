/**
 * Locations Service
 * Handles all location-related API operations including drop-off locations,
 * location search, and nearby location queries
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  DropoffLocation,
  GetDropoffLocationsParams,
  SearchLocationsParams,
  DropoffLocationsResponse,
  NearbyLocationsParams,
} from './types';

export class LocationsService {
  /**
   * Get list of drop-off locations with optional filtering
   */
  async getDropoffLocations(params?: GetDropoffLocationsParams): Promise<DropoffLocationsResponse> {
    try {
      const response = await apiClient.get<DropoffLocationsResponse>(
        API_ENDPOINTS.LOCATIONS.DROPOFF_LOCATIONS,
        { params }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to get drop-off locations');
    }
  }

  /**
   * Search for locations by query string
   */
  async searchLocations(params: SearchLocationsParams): Promise<DropoffLocationsResponse> {
    try {
      if (!params.query || params.query.trim() === '') {
        throw new Error('Search query is required');
      }

      const response = await apiClient.get<DropoffLocationsResponse>(
        API_ENDPOINTS.LOCATIONS.SEARCH_LOCATIONS,
        { params }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to search locations');
    }
  }

  /**
   * Get a specific location by ID
   */
  async getLocation(locationId: string): Promise<DropoffLocation> {
    try {
      if (!locationId || locationId.trim() === '') {
        throw new Error('Location ID is required');
      }

      const url = API_ENDPOINTS.LOCATIONS.GET_LOCATION.replace(':location_id', locationId);
      const response = await apiClient.get<DropoffLocation>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Location not found');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to get location');
    }
  }

  /**
   * Get nearby locations based on coordinates
   */
  async getNearbyLocations(params: NearbyLocationsParams): Promise<DropoffLocationsResponse> {
    try {
      if (!params.latitude || !params.longitude) {
        throw new Error('Latitude and longitude are required');
      }

      // Validate coordinate ranges
      if (params.latitude < -90 || params.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (params.longitude < -180 || params.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      const response = await apiClient.get<DropoffLocationsResponse>(
        API_ENDPOINTS.LOCATIONS.NEARBY_LOCATIONS,
        { params }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to get nearby locations');
    }
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied by user'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred while retrieving location'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }
}

// Create and export a singleton instance
export const locationsService = new LocationsService();