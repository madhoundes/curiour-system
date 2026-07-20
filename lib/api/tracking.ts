/**
 * Tracking Service
 * Handles public tracking operations (no authentication required)
 * 
 * These endpoints allow customers to track shipments without authentication.
 * Perfect for public-facing tracking pages and customer notifications.
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
   * GET /track/{tracking_code}
   * 
   * Get complete shipment status and history using tracking code.
   * This endpoint does not require authentication and can be used by customers
   * to track their packages.
   * 
   * Returns:
   * - tracking_code: The shipment tracking code
   * - current_status: Current shipment status (DRAFT, IN_TRANSIT, DELIVERED, etc.)
   * - status_history: Array of status changes with timestamps and notes
   * - sender_company: Sender company name
   * - receiver_company: Receiver company name
   * - receiver_city: Destination city
   * - receiver_province: Destination province/state
   * - estimated_delivery_date: Expected delivery date (ISO string)
   * - actual_delivery_date: Actual delivery date if delivered (ISO string)
   * - delivery_photos: Array of delivery photo URLs
   * - created_at: Shipment creation timestamp (ISO string)
   * - last_updated: Last update timestamp (ISO string)
   * 
   * @param trackingCode - Tracking code (e.g., "ASH-20250910-ABC123" or "PCG123456789")
   * @returns Complete tracking information including status history
   * 
   * @throws {Error} If tracking code is not provided or empty
   * @throws {Error} If tracking code not found (404)
   * @throws {Error} If invalid tracking code format (422)
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
      
      // Extract error details - handle ApiErrorResponse from API client
      let status: number | undefined;
      let message: string | undefined;
      let details: string | undefined;
      
      if (error && typeof error === 'object') {
        // Check if it's an ApiErrorResponse (has error, message, and status properties)
        if ('status' in error && 'message' in error) {
          status = error.status as number;
          message = error.message as string;
          
          // Extract details - can be string, array, or undefined
          if (error.details) {
            if (typeof error.details === 'string') {
              details = error.details;
            } else if (Array.isArray(error.details) && error.details.length > 0) {
              // If it's an array, take the first message
              details = error.details[0]?.message || error.details[0]?.msg || String(error.details[0]);
            } else {
              details = String(error.details);
            }
          }
          
          // Use details if available (more specific error message)
          const errorMessage = details || message;
          
          if (status === 404) {
            throw new Error(details || 'Tracking code not found. Please verify the tracking number and try again.');
          }
          if (status === 422) {
            throw new Error(details || 'Invalid tracking code format. Use a 6+ character code (e.g. OKGK8R).');
          }
          
          // Return the details or message from the API response
          throw new Error(errorMessage || 'Failed to track shipment. Please try again.');
        }
        
        // Check for nested response (for backwards compatibility)
        if (error.response?.status) {
          status = error.response.status;
          const responseData = error.response.data;
          
          if (responseData?.details) {
            if (typeof responseData.details === 'string') {
              details = responseData.details;
            } else if (Array.isArray(responseData.details) && responseData.details.length > 0) {
              details = responseData.details[0]?.message || responseData.details[0]?.msg || String(responseData.details[0]);
            } else {
              details = String(responseData.details);
            }
          } else if (responseData?.detail) {
            details = typeof responseData.detail === 'string' ? responseData.detail : String(responseData.detail);
          }
          
          if (status === 404) {
            throw new Error(details || 'Tracking code not found. Please verify the tracking number and try again.');
          }
          if (status === 422) {
            throw new Error(details || 'Invalid tracking code format. Use a 6+ character code (e.g. OKGK8R).');
          }
        }
      }
      
      // Fallback: try to extract message or details from any error structure
      const finalMessage = error?.message || error?.details || error?.error?.message || 'Failed to track shipment. Please try again.';
      throw new Error(finalMessage);
    }
  }

  /**
   * Get current status only (lightweight public endpoint, no authentication required)
   * 
   * GET /track/status/{tracking_code}
   * 
   * Get just the current status of a shipment without full history.
   * This is a lightweight endpoint optimized for quick status checks.
   * 
   * Returns:
   * - tracking_code: The shipment tracking code
   * - current_status: Current shipment status (DRAFT, IN_TRANSIT, DELIVERED, etc.)
   * - last_updated: Last update timestamp (ISO string)
   * 
   * @param trackingCode - Tracking code (e.g., "ASH-20250910-ABC123" or "PCG123456789")
   * @returns Current shipment status (lightweight response)
   * 
   * @throws {Error} If tracking code is not provided or empty
   * @throws {Error} If tracking code not found (404)
   * @throws {Error} If invalid tracking code format (422)
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
      console.error('Get shipment status error:', error);
      
      // Handle ApiErrorResponse from API client
      if (error && typeof error === 'object') {
        // Check if it's an ApiErrorResponse (has error, message, and status properties)
        if ('status' in error && 'message' in error) {
          const status = error.status as number;
          const message = error.message as string;
          const details = error.details as string | undefined;
          
          // Use details if available (more specific error message)
          const errorMessage = details || message;
          
          if (status === 404) {
            throw new Error(details || 'Tracking code not found. Please verify the tracking number and try again.');
          }
          if (status === 422) {
            throw new Error(details || 'Invalid tracking code format. Use a 6+ character code (e.g. OKGK8R).');
          }
          
          // Return the details or message from the API response
          throw new Error(errorMessage || 'Failed to get shipment status. Please try again.');
        }
        
        // Check for nested response (for backwards compatibility)
        if (error.response?.status) {
          const status = error.response.status;
          const responseData = error.response.data;
          const details = responseData?.details || responseData?.detail;
          
          if (status === 404) {
            throw new Error(details || 'Tracking code not found. Please verify the tracking number and try again.');
          }
          if (status === 422) {
            throw new Error(details || 'Invalid tracking code format. Use a 6+ character code (e.g. OKGK8R).');
          }
        }
      }
      
      // Fallback to error message or generic error
      throw new Error(error.message || error.details || 'Failed to get shipment status. Please try again.');
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


