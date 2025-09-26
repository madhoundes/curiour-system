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

// Quotes Types
export interface QuoteEstimateRequest {
  package_size: 'small' | 'medium' | 'large';
  weight: number;
  destination_postal_code: string;
}

export interface QuoteEstimateResponse {
  currency: string;
  destination_postal_code: string;
  estimated_price: number;
  package_size: 'small' | 'medium' | 'large';
  service_area: string;
  weight: number;
}

export interface QuoteErrorResponse {
  error: string;
  message: string;
  supported_areas?: string[];
}

// Profile Types
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  phone_number?: string;
  street_address?: string;
  street_address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  preferred_timezone?: string;
  preferred_date_format?: string;
  enable_email_updates: boolean;
  enable_sms_updates: boolean;
  role: 'user' | 'admin' | 'courier';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  street_address?: string;
  street_address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  preferred_timezone?: string;
  preferred_date_format?: string;
  enable_email_updates?: boolean;
  enable_sms_updates?: boolean;
}

export interface UpdateProfileResponse {
  message: string;
  profile: UserProfile;
}

// Shipping Types
export interface Address {
  id?: number;
  contact_name: string;
  company_name?: string;
  street_address: string;
  street_address_2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone_number: string;
  email: string;
  created_at?: string;
}

export interface Package {
  id?: number;
  package_type: 'box' | 'envelope' | 'tube' | 'pallet';
  weight: number;
  length: number;
  width: number;
  height: number;
  declared_value: number;
  contents_description: string;
  fragile: boolean;
  requires_signature: boolean;
  special_instructions?: string;
  created_at?: string;
}

export interface CreateShipmentRequest {
  sender_address: Omit<Address, 'id' | 'created_at'>;
  receiver_address: Omit<Address, 'id' | 'created_at'>;
  package: Omit<Package, 'id' | 'created_at'>;
  special_instructions?: string;
  delivery_notes?: string;
}

export interface Shipment {
  id: number;
  user_id: number;
  tracking_code: string;
  status: 'draft' | 'paid' | 'in_transit' | 'delivered' | 'cancelled';
  sender_address: Address;
  receiver_address: Address;
  package: Package;
  special_instructions?: string;
  delivery_notes?: string;
  estimated_delivery_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateShipmentResponse {
  message: string;
  shipment: Shipment;
}

export interface CreateBillingRequest {
  shipment_id: number;
}

export interface BillingRecord {
  id: number;
  shipment_id: number;
  subtotal: string;
  tax_amount: string;
  tax_rate: string;
  amount: string;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  paid_at?: string;
  billing_address_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutSessionRequest {
  // billing_id is now passed as query parameter, not in request body
}

export interface CreateCheckoutSessionResponse {
  checkout_session_id: string;
  client_secret: string;
  checkout_url: string;
}

// Session status types
export interface GetSessionStatusParams {
  session_id: string;
}

export interface SessionStatusResponse {
  [key: string]: any; // Generic response as per specification
}

// Billing records list types
export interface GetBillingRecordsParams {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
}

export interface BillingRecordsListResponse {
  items: BillingRecord[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Billing report generation types
export interface GenerateBillingReportRequest {
  report_type: 'monthly' | 'yearly';
  year: number;
  month?: number;
}

export interface GenerateBillingReportResponse {
  success: boolean;
  message: string;
  report_url: string;
  report_type: 'monthly' | 'yearly';
  year: number;
  month?: number;
  generated_at: string;
  file_size: number;
}

export interface GenerateLabelResponse {
  success: boolean;
  message: string;
  label_url: string;
  tracking_number: string;
  qr_code_data: string;
}

// Detailed shipment response with billing information
export interface DetailedShipment {
  id: number;
  user_id: number;
  tracking_code: string;
  status: string;
  sender_address: Address & { updated_at: string };
  receiver_address: Address & { updated_at: string };
  package: Package & { updated_at: string };
  billing: {
    id: number;
    subtotal: string;
    tax_amount: string;
    tax_rate: string;
    amount: string;
    currency: string;
    payment_method: string;
    payment_status: string;
    stripe_payment_intent_id?: string;
    stripe_checkout_session_id?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
  };
  special_instructions?: string;
  delivery_notes?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

// Shipment status update types
export interface UpdateShipmentStatusRequest {
  status: 'DRAFT' | 'PAID' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  change_reason: string;
  notes?: string;
}

export interface ShipmentStatusChange {
  id: number;
  shipment_id: number;
  status: 'DRAFT' | 'PAID' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  previous_status: 'DRAFT' | 'PAID' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  changed_by_user_id: number;
  changed_by_user_name: string;
  change_reason: string;
  notes?: string;
  created_at: string;
}

export interface ShippingErrorResponse {
  detail: {
    error: string;
    message: string;
    postal_code?: string;
  };
}

// Status Duration Types
export type ShipmentStatus = 
  | 'DRAFT' 
  | 'PENDING_PAYMENT' 
  | 'PAID' 
  | 'LABEL_GENERATED' 
  | 'PICKED_UP' 
  | 'IN_WAREHOUSE' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'UNDELIVERED' 
  | 'CANCELLED';

export interface StatusDurationResponse {
  status: ShipmentStatus;
  entered_at: string;
  exited_at: string | null;
  duration_seconds: number;
  duration_hours: number;
  is_current: boolean;
}

export interface ShipmentByStatusDurationItem {
  shipment_id: number;
  tracking_number: string;
  current_status: ShipmentStatus;
  duration_hours: number;
  entered_at: string;
  sender_company: string;
  receiver_company: string;
}

export interface ShipmentsByStatusDurationParams {
  status: ShipmentStatus;
  min_duration_hours?: number | null;
  max_duration_hours?: number | null;
  limit?: number;
}

export interface InitializeStatusTrackingResponse {
  [key: string]: any;
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