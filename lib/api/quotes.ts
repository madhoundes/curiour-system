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
      // Validate postal code format first
      if (!this.isValidPostalCode(request.destination_postal_code)) {
        throw new Error('Invalid postal code format. Please use format A1A 1A1');
      }

      // Validate postal code is in service area
      if (!this.isPostalCodeInServiceArea(request.destination_postal_code)) {
        throw new Error(`The postal code "${request.destination_postal_code}" is not in our service area. Delivery is only available in Downtown Toronto (postal codes starting with M) and Mississauga (postal codes starting with L4T-L5W).`);
      }

      const response = await apiClient.post<QuoteEstimateResponse>(
        API_ENDPOINTS.QUOTES.ESTIMATE,
        request
      );

      // The API returns quote data directly in response.data
      return response.data;
    } catch (error: any) {
      console.error('Quote estimation failed:', error);
      
      // If it's already our validation error, re-throw it
      if (error.message && (
        error.message.includes('not in our service area') ||
        error.message.includes('Invalid postal code format')
      )) {
        throw error;
      }
      
      // Handle ApiErrorResponse structure (from apiClient)
      const status = error.status || error.response?.status;
      const errorMessage = error.message || error.response?.data?.message;
      
      // Handle specific quote errors
      if (status === 400) {
        const errorData = error.response?.data || error;
        const message = errorData.message || errorMessage || 'Service area not supported';
        
        // Check if it's a service area error
        if (message.toLowerCase().includes('service area') || 
            message.toLowerCase().includes('not supported') ||
            message.toLowerCase().includes('not in our service area')) {
          throw new Error(`Delivery is only supported in Downtown Toronto and Mississauga. ${message}`);
        }
        
        throw new Error(message);
      }
      
      if (status === 401) {
        throw new Error('Authentication required');
      }
      
      if (status === 422) {
        throw new Error('Invalid request data');
      }
      
      throw new Error(errorMessage || 'Failed to get quote estimate');
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
   * Check if postal code belongs to Toronto
   * Toronto postal codes start with M (M1A to M9Z)
   */
  isTorontoPostalCode(postalCode: string): boolean {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('M')) {
      return false;
    }
    const fsa = normalized.substring(0, 3);
    const letter = fsa.charAt(0);
    const digit1 = parseInt(fsa.charAt(1));
    return letter === 'M' && digit1 >= 1 && digit1 <= 9;
  }

  /**
   * Check if postal code belongs to Mississauga
   * Mississauga postal codes start with L, specifically L4T-L5W range
   */
  isMississaugaPostalCode(postalCode: string): boolean {
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized.startsWith('L')) {
      return false;
    }
    const fsa = normalized.substring(0, 3);
    const letter = fsa.charAt(0);
    const digit1 = parseInt(fsa.charAt(1));
    const letter2 = fsa.charAt(2);
    
    if (letter !== 'L') {
      return false;
    }
    
    // L4T, L4W, L4X, L4Y, L4Z
    if (digit1 === 4) {
      const validL4FSAs = ['T', 'W', 'X', 'Y', 'Z'];
      return validL4FSAs.includes(letter2);
    }
    
    // L5A through L5W
    if (digit1 === 5) {
      const validL5FSAs = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'];
      return validL5FSAs.includes(letter2);
    }
    
    return false;
  }

  /**
   * Check if postal code is in service area (Toronto or Mississauga)
   * @param postalCode Postal code to validate
   * @returns boolean
   */
  isPostalCodeInServiceArea(postalCode: string): boolean {
    return this.isTorontoPostalCode(postalCode) || this.isMississaugaPostalCode(postalCode);
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