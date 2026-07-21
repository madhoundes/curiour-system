/**
 * Quotes Service
 * Handles quote estimation API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { centsToDollarsNumber } from './money';
import {
  isMississaugaPostalCode,
  isPostalCodeInServiceArea,
  isTorontoPostalCode,
  SERVICE_AREA_LABEL_SHORT,
  serviceAreaPostalHint,
} from '@/lib/service-area';
import type {
  QuoteEstimateRequest,
  QuoteEstimateResponse,
  QuoteOptionsRequest,
  QuoteOptionsResponse,
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
        throw new Error(`The postal code "${request.destination_postal_code}" is not in our service area. Delivery is only available in ${serviceAreaPostalHint}.`);
      }

      // The estimate endpoint is intentionally public (see
      // ``quotes/routes.py``) so the unauthenticated landing-page calculator
      // can call it. Marking ``requiresAuth: false`` prevents the apiClient
      // from attaching a stale token from a previous session.
      const response = await apiClient.post<QuoteEstimateResponse>(
        API_ENDPOINTS.QUOTES.ESTIMATE,
        request,
        { requiresAuth: false }
      );

      // The server returns prices as integer cents (e.g. 5432 for $54.32);
      // convert to dollars at the boundary so the UI can use the value as-is.
      return {
        ...response.data,
        estimated_price: centsToDollarsNumber(response.data.estimated_price),
      };
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
          throw new Error(`Delivery is only supported in ${SERVICE_AREA_LABEL_SHORT}. ${message}`);
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
   * Get delivery speed options for quick quotes and the shipment wizard.
   */
  async getOptions(
    request: QuoteOptionsRequest,
    options: { requiresAuth?: boolean } = {},
  ): Promise<QuoteOptionsResponse> {
    const { requiresAuth = false } = options;

    if (!this.isValidPostalCode(request.destination_postal_code)) {
      throw new Error('Invalid postal code format. Please use format A1A 1A1');
    }

    if (!this.isPostalCodeInServiceArea(request.destination_postal_code)) {
      throw new Error(
        `The postal code "${request.destination_postal_code}" is not in our service area. Delivery is only available in ${serviceAreaPostalHint}.`,
      );
    }

    const response = await apiClient.post<QuoteOptionsResponse>(
      API_ENDPOINTS.QUOTES.OPTIONS,
      request,
      { requiresAuth },
    );

    return {
      ...response.data,
      options: response.data.options.map((option) => ({
        ...option,
        estimated_price: centsToDollarsNumber(option.estimated_price),
      })),
    };
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

  isTorontoPostalCode(postalCode: string): boolean {
    return isTorontoPostalCode(postalCode);
  }

  isMississaugaPostalCode(postalCode: string): boolean {
    return isMississaugaPostalCode(postalCode);
  }

  /**
   * Check if postal code is in a supported GTA service area
   */
  isPostalCodeInServiceArea(postalCode: string): boolean {
    return isPostalCodeInServiceArea(postalCode);
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