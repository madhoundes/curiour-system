/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  RegisterRequest, 
  RegisterResponse, 
  LoginRequest, 
  LoginResponse,
  User,
  ApiSuccessResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  PasswordResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  EmailVerificationResponse
} from './types';

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<ApiSuccessResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiSuccessResponse<LoginResponse>> {
    try {
      // Prepare OAuth2PasswordRequestForm data
      const formData = {
        username: credentials.username, // Email is sent as username
        password: credentials.password,
        grant_type: credentials.grant_type || 'password',
        scope: credentials.scope || '',
        client_id: credentials.client_id || null,
        client_secret: credentials.client_secret || null
      };

      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        formData,
        { 
          requiresAuth: false,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Store the token if login is successful
      if (response.data.access_token) {
        apiClient.setAuthToken(response.data.access_token);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always remove token locally
      apiClient.removeAuthToken();
    }
  }

  /**
   * Verify authentication token
   */
  async verifyToken(): Promise<ApiSuccessResponse<User>> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
      return response;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Remove invalid token
      apiClient.removeAuthToken();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiSuccessResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      
      // Update stored token
      if (response.data.access_token) {
        apiClient.setAuthToken(response.data.access_token);
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Remove invalid token
      apiClient.removeAuthToken();
      throw error;
    }
  }

  /**
   * Request password reset (forgot password)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiSuccessResponse<PasswordResponse>> {
    try {
      const response = await apiClient.post<PasswordResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiSuccessResponse<PasswordResponse>> {
    try {
      const response = await apiClient.post<PasswordResponse>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        data,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiSuccessResponse<PasswordResponse>> {
    try {
      const response = await apiClient.post<PasswordResponse>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        null,
        { 
          requiresAuth: true,
          params: {
            current_password: data.current_password,
            new_password: data.new_password
          }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiSuccessResponse<EmailVerificationResponse>> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        data,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(data: ResendVerificationRequest): Promise<ApiSuccessResponse<EmailVerificationResponse>> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        data,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<ApiSuccessResponse<User>> {
    try {
      const response = await apiClient.get<User>(
        API_ENDPOINTS.AUTH.ME,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;