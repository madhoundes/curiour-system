/**
 * Route Optimization Service
 * Handles route optimization API operations including Google Maps route generation
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { locationsService } from './locations';
import type {
  RouteOptimizationParams,
  OptimizedRouteResponse,
} from './types';

export class RouteOptimizationService {
  /**
   * Best-effort courier GPS for route origin. Falls back to undefined
   * (backend uses warehouse) if permission is denied or geolocation fails.
   */
  async getOriginParams(): Promise<Pick<RouteOptimizationParams, 'origin_lat' | 'origin_lng'>> {
    try {
      const { latitude, longitude } = await locationsService.getCurrentLocation();
      return { origin_lat: latitude, origin_lng: longitude };
    } catch (error) {
      console.warn('⚠️ [ROUTE] Current location unavailable; using warehouse origin:', error);
      return {};
    }
  }

  /**
   * Get optimized Google Maps route URL for a driver's assignments
   * 
   * @param driverId - The driver ID
   * @param params - Optional parameters including date and origin lat/lng
   * @returns Google Maps URL string
   */
  async getGoogleMapsRoute(driverId: number, params?: RouteOptimizationParams): Promise<string> {
    try {
      // Validate input
      if (!driverId || driverId <= 0) {
        throw new Error('Valid driver ID is required');
      }

      // Validate date format if provided
      if (params?.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }
      }

      const endpoint = API_ENDPOINTS.ROUTE_OPTIMIZATION.GOOGLE_MAPS_ROUTE.replace(':driver_id', driverId.toString());
      
      const response = await apiClient.get<string>(
        endpoint,
        params
      );

      return response.data;
    } catch (error: any) {
      console.error('Route optimization service error:', error);
      throw new Error(`Failed to get optimized route: ${error.message}`);
    }
  }

  /**
   * Get optimized route with stop order for a driver's assignments
   *
   * @param driverId - The driver ID
   * @param params - Optional parameters including date and origin lat/lng
   * @returns Optimized route URL and ordered stops
   */
  async getOptimizedRoute(
    driverId: number,
    params?: RouteOptimizationParams
  ): Promise<OptimizedRouteResponse> {
    try {
      if (!driverId || driverId <= 0) {
        throw new Error('Valid driver ID is required');
      }

      if (params?.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.date)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }
      }

      const endpoint = API_ENDPOINTS.ROUTE_OPTIMIZATION.OPTIMIZED_ROUTE.replace(
        ':driver_id',
        driverId.toString()
      );

      const response = await apiClient.get<OptimizedRouteResponse>(endpoint, params);

      return response.data;
    } catch (error: any) {
      console.error('Route optimization service error:', error);
      throw new Error(`Failed to get optimized route: ${error.message}`);
    }
  }
}

// Export singleton instance
export const routeOptimizationService = new RouteOptimizationService();
