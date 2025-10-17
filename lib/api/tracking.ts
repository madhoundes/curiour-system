/**
 * Tracking Service
 * Handles public tracking operations (no authentication required)
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  PublicTrackingResponse,
  PublicStatusResponse,
} from './types';

export class TrackingService {
  /**
   * Track shipment by tracking code (public endpoint, no authentication required)
   * 
   * Get complete shipment status and history using tracking code.
   * This endpoint does not require authentication and can be used by customers
   * to track their packages.
   * 
   * @param trackingCode - Tracking code (e.g., "PCG123456789")
   * @returns Complete tracking information including status history
   */
  async trackShipment(trackingCode: string): Promise<PublicTrackingResponse> {
    try {
      // Validate input
      if (!trackingCode || trackingCode.trim() === '') {
        throw new Error('Tracking code is required');
      }

      // Sanitize tracking code (remove whitespace, convert to uppercase)
      const sanitizedCode = trackingCode.trim().toUpperCase();

      const url = API_ENDPOINTS.TRACKING.PUBLIC_TRACK.replace(
        ':tracking_code',
        sanitizedCode
      );

      const response = await apiClient.get<PublicTrackingResponse>(url, undefined, {
        requiresAuth: false, // Public endpoint - no authentication required
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tracking code not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Invalid tracking code format');
      }
      throw new Error(error.message || 'Failed to track shipment');
    }
  }

  /**
   * Get current status only (lightweight public endpoint, no authentication required)
   * 
   * Get just the current status of a shipment without full history.
   * This is a lightweight endpoint optimized for quick status checks.
   * 
   * @param trackingCode - Tracking code (e.g., "PCG123456789")
   * @returns Current shipment status
   */
  async getShipmentStatus(trackingCode: string): Promise<PublicStatusResponse> {
    try {
      // Validate input
      if (!trackingCode || trackingCode.trim() === '') {
        throw new Error('Tracking code is required');
      }

      // Sanitize tracking code (remove whitespace, convert to uppercase)
      const sanitizedCode = trackingCode.trim().toUpperCase();

      const url = API_ENDPOINTS.TRACKING.PUBLIC_STATUS.replace(
        ':tracking_code',
        sanitizedCode
      );

      const response = await apiClient.get<PublicStatusResponse>(url, undefined, {
        requiresAuth: false, // Public endpoint - no authentication required
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Tracking code not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Invalid tracking code format');
      }
      throw new Error(error.message || 'Failed to get shipment status');
    }
  }

  /**
   * Validate tracking code format
   * 
   * Helper method to validate tracking code format before making API calls.
   * 
   * @param trackingCode - Tracking code to validate
   * @returns True if valid, false otherwise
   */
  isValidTrackingCode(trackingCode: string): boolean {
    if (!trackingCode || trackingCode.trim() === '') {
      return false;
    }

    // Basic validation: alphanumeric, 6-50 characters
    const trackingCodeRegex = /^[A-Z0-9]{6,50}$/i;
    return trackingCodeRegex.test(trackingCode.trim());
  }

  /**
   * Format tracking code for display
   * 
   * Helper method to format tracking code consistently.
   * 
   * @param trackingCode - Tracking code to format
   * @returns Formatted tracking code (uppercase, trimmed)
   */
  formatTrackingCode(trackingCode: string): string {
    return trackingCode.trim().toUpperCase();
  }

  /**
   * Get user-friendly status label
   * 
   * Helper method to convert status codes to user-friendly labels.
   * 
   * @param status - Status code
   * @returns User-friendly status label
   */
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      DRAFT: 'Order Created',
      PENDING_PAYMENT: 'Awaiting Payment',
      PAID: 'Payment Confirmed',
      LABEL_GENERATED: 'Label Generated',
      PICKED_UP: 'Picked Up',
      IN_WAREHOUSE: 'At Warehouse',
      IN_TRANSIT: 'In Transit',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      DELIVERY_ATTEMPTED: 'Delivery Attempted',
      UNDELIVERABLE: 'Undeliverable',
      CANCELLED: 'Cancelled',
    };

    return statusLabels[status] || status;
  }

  /**
   * Get status color for UI display
   * 
   * Helper method to get appropriate color for status display.
   * 
   * @param status - Status code
   * @returns Tailwind CSS color class
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      DRAFT: 'gray',
      PENDING_PAYMENT: 'yellow',
      PAID: 'blue',
      LABEL_GENERATED: 'blue',
      PICKED_UP: 'indigo',
      IN_WAREHOUSE: 'purple',
      IN_TRANSIT: 'cyan',
      OUT_FOR_DELIVERY: 'orange',
      DELIVERED: 'green',
      DELIVERY_ATTEMPTED: 'amber',
      UNDELIVERABLE: 'red',
      CANCELLED: 'gray',
    };

    return statusColors[status] || 'gray';
  }
}

// Create and export a singleton instance
export const trackingService = new TrackingService();


