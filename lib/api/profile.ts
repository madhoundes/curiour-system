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

/**
 * Module-level cache for the current user's profile.
 *
 * The profile is fetched from many places in the merchant flow (header,
 * dashboard banner, create-shipment, quote-preview, purchase-label, ...).
 * Without dedupe each callsite produces its own network round-trip even
 * though the data never changes for the duration of a session.
 *
 * `cachedProfile` holds the resolved value; `inFlightRequest` holds the
 * shared Promise so concurrent callers all observe the same single fetch.
 * Both are cleared on logout, on auth failure, and re-populated by
 * successful `updateProfile` calls.
 */
let cachedProfile: UserProfile | null = null;
let inFlightRequest: Promise<UserProfile> | null = null;

export class ProfileService {
  /**
   * Get current user's profile.
   *
   * Results are cached in-memory for the lifetime of the page; concurrent
   * callers share a single in-flight request. Pass `{ force: true }` to
   * bypass the cache and refetch (e.g. after an out-of-band profile change).
   *
   * @returns Promise<UserProfile>
   * @throws Error if authentication fails or profile not found
   */
  async getProfile(options?: { force?: boolean }): Promise<UserProfile> {
    if (!options?.force) {
      if (cachedProfile) {
        return cachedProfile;
      }
      if (inFlightRequest) {
        return inFlightRequest;
      }
    }

    const request = (async () => {
      try {
        // Check if user is authenticated before making the request
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            throw {
              error: 'API Error',
              message: 'Authentication required',
              status: 401,
              details: 'Not authenticated'
            };
          }
        }

        const response = await apiClient.get<UserProfile>(
          API_ENDPOINTS.USERS.PROFILE
        );

        // The API returns the profile data directly, not wrapped in a data property
        cachedProfile = response.data;
        return response.data;
      } catch (error: any) {
        console.error('Get profile failed:', error);

        // Drop any cached profile on failure so we don't keep returning
        // stale data; the next call will retry the network request.
        cachedProfile = null;

        // Handle ApiErrorResponse structure (from apiClient)
        const status = error.status || error.response?.status;

        if (status === 401 || status === 403) {
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          throw {
            error: error.error || 'API Error',
            message: error.message || 'Authentication required',
            status: status,
            details: error.details || 'Not authenticated'
          };
        }

        throw error;
      } finally {
        // Always release the shared promise slot so the next call can either
        // serve from `cachedProfile` (success) or trigger a fresh fetch (failure).
        inFlightRequest = null;
      }
    })();

    inFlightRequest = request;
    return request;
  }

  /**
   * Clear the in-memory profile cache.
   *
   * Should be called on logout, on token refresh failure, or any time the
   * authenticated user identity may have changed. Safe to call even when
   * nothing is cached.
   */
  invalidateProfileCache(): void {
    cachedProfile = null;
    inFlightRequest = null;
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

      const result = response.data.data;

      // Keep the in-memory cache aligned with the just-saved profile so
      // subsequent `getProfile()` calls reflect the change without a refetch.
      if (result?.profile) {
        cachedProfile = result.profile;
      } else {
        cachedProfile = null;
      }

      return result;
    } catch (error: any) {
      console.error('Update profile failed:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid data provided');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      
      if (error.response?.status === 422) {
        console.log('Validation error details:', error.response.data);
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