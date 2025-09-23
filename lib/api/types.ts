/**
 * API Types
 * TypeScript interfaces for API requests and responses
 */

// Common API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Authentication Types
export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  role: 'user' | 'admin' | 'courier';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string; // OAuth2PasswordRequestForm expects 'username' field (treated as email)
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: RegisterResponse;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  role: 'user' | 'admin' | 'courier';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

// Password-related Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordResponse {
  message: string;
}

// Email Verification Types
export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
}

// Admin Types
export interface AdminCreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  role: 'user' | 'driver' | 'admin';
  password: string;
}

export interface AdminCreateUserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  role: 'user' | 'driver' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminListUsersParams {
  skip?: number;
  limit?: number;
}

export interface AdminUpdateUserRoleParams {
  user_id: number;
  new_role: 'user' | 'driver' | 'admin';
}

// Request/Response wrapper types
export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  details?: ApiError | ValidationError[];
}