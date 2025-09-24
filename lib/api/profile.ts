/**
 * Profile Service
 * Handles user profile API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from './types';

export class ProfileService {
  /**
   * Get current user's profile
   * @returns Promise<UserProfile>
   * @throws Error if authentication fails or profile not found
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<UserProfile>>(
        API_ENDPOINTS.USERS.PROFILE
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Get profile failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  /**
   * Update current user's profile
   * @param profileData Profile data to update
   * @returns Promise<UpdateProfileResponse>
   * @throws Error if authentication fails or validation errors occur
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<UpdateProfileResponse>>(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        profileData
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Update profile failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid data provided');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Validate email format
   * @param email Email to validate
   * @returns boolean
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic North American format)
   * @param phoneNumber Phone number to validate
   * @returns boolean
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic North American phone number format: +1-XXX-XXX-XXXX or similar variations
    const phoneRegex = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phoneNumber.trim());
  }

  /**
   * Validate postal code format (Canadian postal code)
   * @param postalCode Postal code to validate
   * @returns boolean
   */
  isValidPostalCode(postalCode: string): boolean {
    // Canadian postal code format: A1A 1A1 or A1A1A1
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalCodeRegex.test(postalCode.trim());
  }

  /**
   * Validate timezone format
   * @param timezone Timezone to validate
   * @returns boolean
   */
  isValidTimezone(timezone: string): boolean {
    // Basic timezone validation - check if it's a valid IANA timezone format
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get list of common Canadian provinces
   * @returns Array of province names
   */
  getCanadianProvinces(): string[] {
    return [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Northwest Territories',
      'Nova Scotia',
      'Nunavut',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Yukon'
    ];
  }

  /**
   * Get list of common date formats
   * @returns Array of date format strings
   */
  getDateFormats(): string[] {
    return [
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'DD-MM-YYYY',
      'MM-DD-YYYY'
    ];
  }
}

// Export singleton instance
export const profileService = new ProfileService();