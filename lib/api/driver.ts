/**
 * Driver Service
 * Handles all driver-related API operations including shipment search,
 * shipment details retrieval, and status updates
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  DriverShipment,
  DriverSearchShipmentsParams,
  DriverSearchShipmentsResponse,
  DriverUpdateShipmentStatusRequest,
  DriverUpdateShipmentStatusResponse,
  DriverAssignment,
  DriverAssignmentsResponse,
  DriverUploadDeliveryPhotoRequest,
  DriverUploadDeliveryPhotoResponse,
  DriverStatisticsParams,
  DriverStatisticsResponse,
} from './types';

export class DriverService {
  /**
   * Search assigned shipments by tracking code or ID
   * 
   * @param query - Search query (tracking code or shipment ID)
   * @returns Search results with matching shipments
   */
  async searchShipments(query: string): Promise<DriverSearchShipmentsResponse> {
    try {
      // Validate input
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      if (query.length > 50) {
        throw new Error('Search query must be 50 characters or less');
      }

      const params: DriverSearchShipmentsParams = {
        q: query.trim(),
      };

      const response = await apiClient.get<DriverSearchShipmentsResponse>(
        API_ENDPOINTS.DRIVER.SEARCH_SHIPMENTS,
        params
      );

      return response.data;
    } catch (error: any) {
      const status = error.status || error.response?.status;
      if (status === 401) {
        throw new Error('Authentication required');
      }
      if (status === 403) {
        throw new Error('Driver role required');
      }
      if (status === 404) {
        throw new Error('Package not found. Please check the tracking number.');
      }
      if (status === 422) {
        throw new Error('Validation error - invalid search query');
      }
      throw new Error(error.message || 'Failed to search shipments');
    }
  }

  /**
   * Get detailed shipment information by shipment ID
   * 
   * @param shipmentId - Shipment ID
   * @returns Detailed shipment information
   */
  async getShipmentById(shipmentId: number): Promise<DriverShipment> {
    try {
      // Validate input
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      const url = API_ENDPOINTS.DRIVER.GET_SHIPMENT_BY_ID.replace(
        ':shipment_id',
        shipmentId.toString()
      );

      const response = await apiClient.get<DriverShipment>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Driver role required');
      }
      if (error.response?.status === 404) {
        throw new Error('Shipment not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error - invalid shipment ID');
      }
      throw new Error(error.message || 'Failed to get shipment details');
    }
  }

  /**
   * Update shipment status
   * 
   * Drivers can move shipments through different stages like from 'in_warehouse' to 'in_transit'.
   * 
   * @param shipmentId - Shipment ID
   * @param statusData - Status update data including new status and optional notes
   * @returns Status update confirmation
   */
  async updateShipmentStatus(
    shipmentId: number,
    statusData: DriverUpdateShipmentStatusRequest
  ): Promise<DriverUpdateShipmentStatusResponse> {
    try {
      // Validate input
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      if (!statusData.status || statusData.status.trim() === '') {
        throw new Error('Status is required');
      }

      // Validate notes length if provided
      if (statusData.notes && statusData.notes.length > 1000) {
        throw new Error('Notes must be 1000 characters or less');
      }

      const url = API_ENDPOINTS.DRIVER.UPDATE_SHIPMENT_STATUS.replace(
        ':shipment_id',
        shipmentId.toString()
      );


      const response = await apiClient.put<DriverUpdateShipmentStatusResponse>(
        url,
        statusData,
        { requiresAuth: true }
      );


      return response.data;
    } catch (error: any) {
      const status = error.status || error.response?.status;
      const errorResponse = error.response?.data || error.details || {};
      
      // Handle errorData as string or object
      let errorMessage = 'An unexpected error occurred.';
      if (typeof errorResponse === 'string') {
        errorMessage = errorResponse;
      } else if (errorResponse.details) {
        errorMessage = errorResponse.details;
      } else if (errorResponse.message) {
        errorMessage = errorResponse.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Only log errors, not verbose details
      
      // Provide more specific error messages
      if (status === 403) {
        // Use the detailed error message from the API if available
        const detailsMessage = typeof errorResponse === 'string' 
          ? errorResponse 
          : (errorResponse.details || errorResponse.message || errorMessage);
        throw new Error(detailsMessage || 'Access denied. This shipment is not assigned to you.');
      }
      if (status === 404) {
        throw new Error('Shipment not found. It may have been removed or reassigned.');
      }
      if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (status === 422) {
        // Handle validation error response (can be array or object)
        let validationMessage = errorMessage;
        if (Array.isArray(errorResponse) && errorResponse.length > 0) {
          validationMessage = errorResponse[0].message || errorResponse[0].msg || errorMessage;
        } else if (typeof errorResponse === 'object' && errorResponse.detail) {
          if (Array.isArray(errorResponse.detail) && errorResponse.detail.length > 0) {
            validationMessage = errorResponse.detail[0].msg || errorResponse.detail[0].message || errorMessage;
          } else {
            validationMessage = errorResponse.detail || errorMessage;
          }
        }
        throw new Error(validationMessage || 'Invalid shipment status or data.');
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get valid status transitions for shipments
   * 
   * This is a helper method that returns the valid status values
   * that drivers can transition shipments to.
   */
  getValidStatuses(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'in_warehouse',
        label: 'In Warehouse',
        description: 'Package is at the warehouse facility',
      },
      {
        value: 'in_transit',
        label: 'In Transit',
        description: 'Package is on the way to destination',
      },
      {
        value: 'out_for_delivery',
        label: 'Out for Delivery',
        description: 'Package is out for final delivery',
      },
      {
        value: 'delivered',
        label: 'Delivered',
        description: 'Package has been delivered successfully',
      },
      {
        value: 'delivery_attempted',
        label: 'Delivery Attempted',
        description: 'Delivery was attempted but unsuccessful',
      },
      {
        value: 'undeliverable',
        label: 'Undeliverable',
        description: 'Package cannot be delivered',
      },
    ];
  }

  /**
   * Get today's assignments for the current driver
   * 
   * @returns List of assignments for today
   */
  async getTodaysAssignments(): Promise<DriverAssignmentsResponse> {
    try {
      const response = await apiClient.get<DriverAssignmentsResponse>(
        API_ENDPOINTS.DRIVER.ASSIGNMENTS_TODAY
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Driver role required');
      }
      throw new Error(error.message || 'Failed to get today\'s assignments');
    }
  }

  /**
   * Get assignments for a specific date
   * 
   * @param assignmentDate - Date in YYYY-MM-DD format
   * @returns List of assignments for the specified date
   */
  async getAssignmentsByDate(assignmentDate: string): Promise<DriverAssignmentsResponse> {
    try {
      // Validate date format (basic validation)
      if (!assignmentDate || assignmentDate.trim() === '') {
        throw new Error('Assignment date is required');
      }

      // Check if date is in valid format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(assignmentDate)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }

      const url = API_ENDPOINTS.DRIVER.ASSIGNMENTS_BY_DATE.replace(
        ':assignment_date',
        assignmentDate
      );

      const response = await apiClient.get<DriverAssignmentsResponse>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Driver role required');
      }
      if (error.response?.status === 422) {
        throw new Error('Invalid date format');
      }
      throw new Error(error.message || 'Failed to get assignments');
    }
  }

  /**
   * Upload delivery photo and mark shipment as delivered
   * 
   * @param shipmentId - Shipment ID
   * @param photoData - Photo file and optional notes
   * @returns Upload confirmation with photo URL
   */
  async uploadDeliveryPhoto(
    shipmentId: number,
    photoData: DriverUploadDeliveryPhotoRequest
  ): Promise<DriverUploadDeliveryPhotoResponse> {
    try {
      // Validate input
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      if (!photoData.photo) {
        throw new Error('Photo file is required');
      }

      // Validate photo file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (photoData.photo.size > maxSize) {
        throw new Error('Photo file size must be less than 10MB');
      }

      // Validate photo file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(photoData.photo.type)) {
        throw new Error('Photo must be a JPEG, PNG, or WebP image');
      }

      // Validate notes length if provided
      if (photoData.notes && photoData.notes.length > 1000) {
        throw new Error('Notes must be 1000 characters or less');
      }

      const url = API_ENDPOINTS.DRIVER.UPLOAD_DELIVERY_PHOTO.replace(
        ':shipment_id',
        shipmentId.toString()
      );

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', photoData.photo);
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }

      // Don't set Content-Type header - let browser set it with boundary for FormData
      const response = await apiClient.post<DriverUploadDeliveryPhotoResponse>(
        url,
        formData,
        {
          // No headers needed - browser will set Content-Type with boundary automatically
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [DRIVER] Error uploading delivery photo:', error);
      
      // Handle ApiErrorResponse structure (from apiClient)
      const status = error.status || error.response?.status;
      const errorMessage = error.message || error.response?.data?.message || error.error || 'An unexpected error occurred';
      
      if (status === 400) {
        throw new Error(errorMessage || 'Invalid file or shipment not found');
      }
      if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (status === 403) {
        throw new Error(errorMessage || 'Access denied');
      }
      if (status === 404) {
        throw new Error('Shipment not found');
      }
      if (status === 413) {
        throw new Error('File too large. Maximum size is 10MB');
      }
      if (status === 422) {
        const errorData = error.response?.data || error.details;
        const detailMessage = errorData?.detail?.[0]?.msg || errorData?.message || errorMessage;
        throw new Error(detailMessage || 'Validation error');
      }
      
      // Re-throw with original message if available
      throw new Error(errorMessage);
    }
  }

  /**
   * Helper method to format date to YYYY-MM-DD in Eastern Time
   *
   * Uses the America/Toronto time zone so the calendar date matches the
   * courier's local day (DST-aware: EST in winter, EDT in summer). Using UTC
   * here caused the date to roll over a day early in the evening.
   *
   * @param date - Date object
   * @returns Formatted date string in Eastern Time
   */
  formatDate(date: Date): string {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  /**
   * Helper method to get today's date in YYYY-MM-DD format
   * 
   * @returns Today's date as string
   */
  getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Get driver statistics
   * 
   * Get statistics for the current driver including deliveries, items in transit,
   * and assigned items in warehouse.
   * 
   * @param params - Optional date range parameters
   * @returns Driver statistics
   */
  async getDriverStatistics(params?: DriverStatisticsParams): Promise<DriverStatisticsResponse> {
    try {
      // Validate date format if provided
      if (params?.date_start) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.date_start)) {
          throw new Error('Invalid date_start format. Expected YYYY-MM-DD');
        }
      }

      if (params?.date_end) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.date_end)) {
          throw new Error('Invalid date_end format. Expected YYYY-MM-DD');
        }
      }

      const response = await apiClient.get<DriverStatisticsResponse>(
        API_ENDPOINTS.DRIVER.DRIVER_STATISTICS,
        params
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [DRIVER] Error fetching driver statistics:', error);
      
      // Handle ApiErrorResponse structure (from apiClient)
      const status = error.status || error.response?.status;
      const errorMessage = error.message || error.response?.data?.message || error.error || 'Failed to fetch driver statistics';
      
      if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (status === 403) {
        throw new Error('Driver role required');
      }
      if (status === 422) {
        const errorData = error.response?.data || error.details;
        const detailMessage = errorData?.detail?.[0]?.msg || errorData?.message || 'Validation error - invalid date parameters';
        throw new Error(detailMessage);
      }
      
      // Re-throw with original message if available
      throw new Error(errorMessage);
    }
  }
}

// Create and export a singleton instance
export const driverService = new DriverService();

