/**
 * API Client
 * Main HTTP client for making API requests with authentication and error handling
 */

import { API_CONFIG, HTTP_STATUS } from './config';
import type { 
  ApiRequestConfig, 
  ApiSuccessResponse, 
  ApiErrorResponse,
  ApiError 
} from './types';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token in localStorage
   */
  public setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Remove authentication token from localStorage
   */
  public removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  /**
   * Build request headers
   */
  private buildHeaders(config: ApiRequestConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Add authentication header if required
    if (config.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${fullUrl}?${searchParams.toString()}`;
  }

  /**
   * Handle API errors and format them consistently
   */
  private handleError(error: any, status?: number): ApiErrorResponse {
    // Network or fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
      };
    }

    // Timeout errors
    if (error.name === 'AbortError') {
      return {
        error: 'Timeout Error',
        message: 'Request timed out. Please try again.',
        status: 408,
      };
    }

    // API validation errors (422)
    if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY && error.detail) {
      const validationErrors = error.detail.map((err: any) => ({
        field: err.loc?.[err.loc.length - 1] || 'unknown',
        message: err.msg || 'Validation error',
      }));

      return {
        error: 'Validation Error',
        message: 'Please check your input and try again.',
        status: status,
        details: validationErrors,
      };
    }

    // Other API errors
    return {
      error: error.error || 'API Error',
      message: error.message || 'An unexpected error occurred.',
      status: status || 500,
      details: error.detail,
    };
  }

  /**
   * Sleep function for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    config: ApiRequestConfig,
    attempt: number = 1
  ): Promise<ApiSuccessResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = this.buildUrl(config.url, config.params);
      const headers = this.buildHeaders(config);

      const fetchConfig: RequestInit = {
        method: config.method,
        headers,
        signal: controller.signal,
      };

      // Add body for POST, PUT, PATCH requests
      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        const contentType = headers['Content-Type'] || headers['content-type'];
        
        if (contentType === 'application/x-www-form-urlencoded') {
          // Handle form-urlencoded data for OAuth2
          const formData = new URLSearchParams();
          Object.entries(config.data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, String(value));
            }
          });
          fetchConfig.body = formData.toString();
        } else {
          // Default JSON encoding
          fetchConfig.body = JSON.stringify(config.data);
        }
      }

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      // Handle different response types
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle successful responses
      if (response.ok) {
        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
        };
      }

      // Handle 401 Unauthorized - try to refresh token if not already a refresh attempt
      if (response.status === 401 && !config.url.includes('refresh') && attempt === 1) {
        try {
          const { authService } = await import('./auth');
          await authService.refreshToken();
          
          // Retry the original request with the new token
          return this.makeRequest<T>(config, attempt + 1);
        } catch (refreshError) {
          // If refresh fails, remove invalid token and throw original error
          this.removeAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw this.handleError(responseData, response.status);
        }
      }

      // Handle error responses
      const errorResponse = this.handleError(responseData, response.status);
      
      // Retry on server errors (5xx) but not on client errors (4xx)
      if (response.status >= 500 && attempt < this.retryAttempts) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest<T>(config, attempt + 1);
      }

      throw errorResponse;

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // If it's already an ApiErrorResponse, re-throw it
      if (error && typeof error === 'object' && 'error' in error) {
        throw error;
      }

      // Handle network errors with retry
      if (attempt < this.retryAttempts && (
        error instanceof TypeError || 
        (error as Error)?.name === 'AbortError'
      )) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest<T>(config, attempt + 1);
      }

      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string, 
    params?: Record<string, any>,
    options?: Partial<ApiRequestConfig>
  ): Promise<ApiSuccessResponse<T>> {
    return this.makeRequest<T>({
      method: 'GET',
      url,
      params,
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string, 
    data?: any,
    options?: Partial<ApiRequestConfig>
  ): Promise<ApiSuccessResponse<T>> {
    return this.makeRequest<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string, 
    data?: any,
    options?: Partial<ApiRequestConfig>
  ): Promise<ApiSuccessResponse<T>> {
    return this.makeRequest<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    options?: Partial<ApiRequestConfig>
  ): Promise<ApiSuccessResponse<T>> {
    return this.makeRequest<T>({
      method: 'DELETE',
      url,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string, 
    data?: any,
    options?: Partial<ApiRequestConfig>
  ): Promise<ApiSuccessResponse<T>> {
    return this.makeRequest<T>({
      method: 'PATCH',
      url,
      data,
      ...options,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;