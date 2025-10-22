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
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Driver role required');
      }
      if (error.response?.status === 422) {
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
      console.log('🔧 [DRIVER API] updateShipmentStatus called with:', {
        shipmentId,
        statusData,
        statusDataStatus: statusData.status,
        statusDataStatusType: typeof statusData.status,
        statusDataStatusLength: statusData.status?.length
      });

      // Validate input
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      if (!statusData.status || statusData.status.trim() === '') {
        console.error('❌ [DRIVER API] Status validation failed:', {
          status: statusData.status,
          statusType: typeof statusData.status,
          statusLength: statusData.status?.length,
          statusTrimmed: statusData.status?.trim()
        });
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

      console.log('🔧 [DRIVER API] Making API call:', {
        url,
        method: 'PUT',
        shipmentId,
        statusData
      });

      const response = await apiClient.put<DriverUpdateShipmentStatusResponse>(
        url,
        statusData,
        { requiresAuth: true }
      );

      console.log('🔧 [DRIVER API] API response received:', {
        status: response.status,
        data: response.data,
        success: response.data?.success
      });

      return response.data;
    } catch (error: any) {
      console.error('🔧 [DRIVER API] Error caught in updateShipmentStatus:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        errorResponse: error.response,
        errorResponseStatus: error.response?.status,
        errorResponseData: error.response?.data,
        errorCode: error.code,
        errorName: error.name
      });

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        const errorMessage = errorData?.details || errorData?.message || 'Invalid status transition or shipment not found';
        throw new Error(errorMessage);
      }
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
        const errorData = error.response.data;
        const validationMessage = errorData.detail?.[0]?.msg || errorData.message || 'Validation error';
        throw new Error(`Validation error: ${validationMessage}`);
      }
      throw new Error(error.message || 'Failed to update shipment status');
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

      const response = await apiClient.post<DriverUploadDeliveryPhotoResponse>(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid file or shipment not found');
      }
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
        const errorData = error.response.data;
        throw new Error(errorData.detail?.[0]?.msg || 'Validation error');
      }
      throw new Error(error.message || 'Failed to upload delivery photo');
    }
  }

  /**
   * Helper method to format date to YYYY-MM-DD
   * 
   * @param date - Date object
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Driver role required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error - invalid date parameters');
      }
      throw new Error(error.message || 'Failed to get driver statistics');
    }
  }
}

// Create and export a singleton instance
export const driverService = new DriverService();

