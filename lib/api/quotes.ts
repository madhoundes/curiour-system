/**
 * Quotes Service
 * Handles quote estimation API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  QuoteEstimateRequest,
  QuoteEstimateResponse,
  QuoteErrorResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from './types';

export class QuotesService {
  /**
   * Get delivery quote estimate
   * @param request Quote request with package details
   * @returns Promise<QuoteEstimateResponse>
   * @throws Error if postal code is outside service area or validation fails
   */
  async getEstimate(request: QuoteEstimateRequest): Promise<QuoteEstimateResponse> {
    try {
      const response = await apiClient.post<QuoteEstimateResponse>(
        API_ENDPOINTS.QUOTES.ESTIMATE,
        request
      );

      // The API returns quote data directly in response.data
      return response.data;
    } catch (error: any) {
      console.error('Quote estimation failed:', error);
      
      // Handle specific quote errors
      if (error.response?.status === 400) {
        const errorData = error.response.data as QuoteErrorResponse;
        throw new Error(errorData.message || 'Service area not supported');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      
      if (error.response?.status === 422) {
        throw new Error('Invalid request data');
      }
      
      throw new Error(error.message || 'Failed to get quote estimate');
    }
  }

  /**
   * Validate package size
   * @param size Package size to validate
   * @returns boolean
   */
  isValidPackageSize(size: string): size is 'small' | 'medium' | 'large' {
    return ['small', 'medium', 'large'].includes(size);
  }

  /**
   * Validate postal code format (basic Canadian postal code validation)
   * @param postalCode Postal code to validate
   * @returns boolean
   */
  isValidPostalCode(postalCode: string): boolean {
    // Basic Canadian postal code format: A1A 1A1 or A1A1A1
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalCodeRegex.test(postalCode.trim());
  }

  /**
   * Validate weight (must be positive number)
   * @param weight Weight to validate
   * @returns boolean
   */
  isValidWeight(weight: number): boolean {
    return typeof weight === 'number' && weight > 0 && weight <= 1000; // Max 1000kg
  }
}

// Export singleton instance
export const quotesService = new QuotesService();