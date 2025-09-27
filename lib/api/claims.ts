/**
 * Claims API Service
 * Handles all claims-related API calls for shipment issues
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  CreateClaimRequest,
  CreateClaimResponse,
  GetClaimsParams,
  ClaimsListResponse,
  Claim,
  UploadClaimPhotoRequest,
  UploadClaimPhotoResponse,
  GetAllClaimsAdminParams,
  UpdateClaimStatusRequest,
  UpdateClaimStatusResponse
} from './types';

export class ClaimsService {
  /**
   * Create a new claim for a shipment issue
   */
  async createClaim(claimData: CreateClaimRequest): Promise<CreateClaimResponse> {
    try {
      if (!claimData.shipment_id || claimData.shipment_id <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      if (!claimData.description || claimData.description.trim().length === 0) {
        throw new Error('Claim description is required');
      }

      if (!claimData.reason) {
        throw new Error('Claim reason is required');
      }

      const response = await apiClient.post<CreateClaimResponse>(
        API_ENDPOINTS.CLAIMS.CREATE,
        claimData
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid request data or claim already exists for shipment');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('User role required or shipment not owned by user');
      }
      if (error.response?.status === 404) {
        throw new Error('Shipment not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid data'));
      }
      throw error;
    }
  }

  /**
   * Get a paginated list of the current user's claims
   */
  async getClaims(params: GetClaimsParams = {}): Promise<ClaimsListResponse> {
    try {
      // Set default values
      const queryParams = {
        page: params.page || 1,
        per_page: Math.min(params.per_page || 10, 100), // Enforce max 100 per page
        ...(params.status && { status: params.status })
      };

      // Validate parameters
      if (queryParams.page < 1) {
        throw new Error('Page number must be at least 1');
      }

      if (queryParams.per_page < 1) {
        throw new Error('Items per page must be at least 1');
      }

      const response = await apiClient.get<ClaimsListResponse>(
        API_ENDPOINTS.CLAIMS.LIST,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('User role required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid parameters'));
      }
      throw error;
    }
  }

  /**
   * Get detailed information about a specific claim
   */
  async getClaimById(claimId: number): Promise<Claim> {
    try {
      if (!claimId || claimId <= 0) {
        throw new Error('Valid claim ID is required');
      }

      const url = API_ENDPOINTS.CLAIMS.GET.replace(':claim_id', claimId.toString());
      const response = await apiClient.get<Claim>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - you can only view your own claims');
      }
      if (error.response?.status === 404) {
        throw new Error('Claim not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid claim ID'));
      }
      throw error;
    }
  }

  /**
   * Upload a photo as evidence for a claim
   */
  async uploadClaimPhoto(claimId: number, photoData: UploadClaimPhotoRequest): Promise<UploadClaimPhotoResponse> {
    try {
      if (!claimId || claimId <= 0) {
        throw new Error('Valid claim ID is required');
      }

      if (!photoData.photo) {
        throw new Error('Photo file is required');
      }

      // Validate file type (basic client-side validation)
      if (photoData.photo instanceof File) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(photoData.photo.type)) {
          throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (photoData.photo.size > maxSize) {
          throw new Error('File size too large. Maximum size is 10MB');
        }
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', photoData.photo);
      
      if (photoData.description) {
        formData.append('description', photoData.description);
      }

      const url = API_ENDPOINTS.CLAIMS.UPLOAD_PHOTO.replace(':claim_id', claimId.toString());
      
      // Use multipart/form-data for file upload
      const response = await apiClient.post<UploadClaimPhotoResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid file or claim not found');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied - you can only upload photos to your own claims');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid file or parameters'));
      }
      throw error;
    }
  }

  /**
   * Get a paginated list of all claims across all users (admin only)
   */
  async getAllClaimsAdmin(params: GetAllClaimsAdminParams = {}): Promise<ClaimsListResponse> {
    try {
      // Set default values
      const queryParams = {
        page: params.page || 1,
        per_page: Math.min(params.per_page || 10, 100), // Enforce max 100 per page
        ...(params.status && { status: params.status }),
        ...(params.reason && { reason: params.reason }),
        ...(params.user_id && { user_id: params.user_id })
      };

      // Validate parameters
      if (queryParams.page < 1) {
        throw new Error('Page number must be at least 1');
      }

      if (queryParams.per_page < 1) {
        throw new Error('Items per page must be at least 1');
      }

      if (params.user_id && params.user_id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      const response = await apiClient.get<ClaimsListResponse>(
        API_ENDPOINTS.CLAIMS.ADMIN_LIST_ALL,
        { params: queryParams }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Admin role required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid parameters'));
      }
      throw error;
    }
  }

  /**
   * Update the status of a claim and send notification email to user (admin only)
   */
  async updateClaimStatus(claimId: number, statusData: UpdateClaimStatusRequest): Promise<UpdateClaimStatusResponse> {
    try {
      if (!claimId || claimId <= 0) {
        throw new Error('Valid claim ID is required');
      }

      if (!statusData.status) {
        throw new Error('Status is required');
      }

      // Validate status value
      const validStatuses = ['pending', 'approved', 'rejected', 'resolved'];
      if (!validStatuses.includes(statusData.status)) {
        throw new Error('Invalid status. Must be one of: pending, approved, rejected, resolved');
      }

      // Validate admin notes length if provided
      if (statusData.admin_notes && statusData.admin_notes.length > 1000) {
        throw new Error('Admin notes must be 1000 characters or less');
      }

      const url = API_ENDPOINTS.CLAIMS.UPDATE_STATUS.replace(':claim_id', claimId.toString());
      const response = await apiClient.put<UpdateClaimStatusResponse>(url, statusData);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid status or request data');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Admin role required');
      }
      if (error.response?.status === 404) {
        throw new Error('Claim not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error: ' + (error.response?.data?.detail || 'Invalid data'));
      }
      throw error;
    }
  }

  /**
   * Validate claim reason
   */
  validateClaimReason(reason: string): boolean {
    const validReasons = ['damaged', 'lost', 'delayed', 'other'];
    return validReasons.includes(reason);
  }

  /**
   * Validate claim description
   */
  validateClaimDescription(description: string): boolean {
    return !!description && description.trim().length >= 10 && description.trim().length <= 1000;
  }

  /**
   * Get claim status display text
   */
  getClaimStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'resolved': 'Resolved'
    };
    return statusMap[status] || status;
  }

  /**
   * Get claim reason display text
   */
  getClaimReasonDisplay(reason: string): string {
    const reasonMap: Record<string, string> = {
      'damaged': 'Package Damaged',
      'lost': 'Package Lost',
      'delayed': 'Delivery Delayed',
      'other': 'Other Issue'
    };
    return reasonMap[reason] || reason;
  }

  /**
   * Validate file type for photo uploads
   */
  validatePhotoFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const claimsService = new ClaimsService();