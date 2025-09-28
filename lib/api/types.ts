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
  } | null;
  special_instructions?: string;
  delivery_notes?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentsListResponse {
  shipments: DetailedShipment[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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

// Claims Types
export interface CreateClaimRequest {
  description: string;
  reason: 'damaged' | 'lost' | 'delayed' | 'other';
  shipment_id: number;
}

export interface Claim {
  id: number;
  billing_id: number;
  created_at: string;
  description: string;
  photos: string[];
  reason: 'damaged' | 'lost' | 'delayed' | 'other';
  shipment_id: number;
  shipment_tracking_code: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  updated_at: string;
  user_email: string;
  user_id: number;
}

export interface CreateClaimResponse {
  billing_id: number;
  created_at: string;
  description: string;
  id: number;
  photos: string[];
  reason: 'damaged' | 'lost' | 'delayed' | 'other';
  shipment_id: number;
  shipment_tracking_code: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  updated_at: string;
  user_email: string;
  user_id: number;
}

export interface GetClaimsParams {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'resolved' | null;
}

export interface ClaimsListResponse {
  claims: Claim[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Photo Upload Types
export interface UploadClaimPhotoRequest {
  photo: File | Blob;
  description?: string;
}

export interface UploadClaimPhotoResponse {
  message: string;
  photo_id: number;
  photo_url: string;
  success: boolean;
}

// Admin Claims Types
export interface GetAllClaimsAdminParams {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'resolved' | null;
  reason?: 'damaged' | 'lost' | 'delayed' | 'other' | null;
  user_id?: number | null;
}

export interface UpdateClaimStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  admin_notes?: string;
}

export interface UpdateClaimStatusResponse extends Claim {
  // Same as Claim interface but returned after status update
}

// API Request Configuration Typeswrapper types
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

// Location Types
export interface DropoffLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  hours: {
    weekday: string;
    weekend: string;
  };
  isOpen: boolean;
  type: 'fedex' | 'ups' | 'usps' | 'amazon' | 'independent' | 'parcego';
  services: string[];
  estimatedTime: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
  description?: string;
}

export interface GetDropoffLocationsParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  type?: 'fedex' | 'ups' | 'usps' | 'amazon' | 'independent' | 'parcego' | 'all';
  isOpen?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchLocationsParams {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  type?: 'fedex' | 'ups' | 'usps' | 'amazon' | 'independent' | 'parcego' | 'all';
  limit?: number;
  offset?: number;
}

export interface DropoffLocationsResponse {
  locations: DropoffLocation[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NearbyLocationsParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers, default 10
  limit?: number; // default 20
}

// Contact Types
export interface SendContactMessageRequest {
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string;
}

export interface SendContactMessageResponse {
  message: string;
  success: boolean;
  ticket_id: string;
}

export interface ContactInfoResponse {
  phone: string;
  email: string;
  address: string;
  business_hours: {
    weekdays: string;
    weekends: string;
  };
  support_hours: {
    weekdays: string;
    weekends: string;
  };
  emergency_contact?: string;
}

// Assignment Types
export interface Assignment {
  id: number;
  driver_id: number;
  driver_name: string;
  shipment_id: number;
  tracking_number: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at?: string;
  pickup_address: string;
  delivery_address: string;
  estimated_delivery: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AssignmentsResponse {
  assignments: Assignment[];
  date: string;
  total: number;
  total_drivers: number;
  total_packages: number;
}

// Assignment Statistics Types
export interface DriverStatistics {
  assigned: number;
  cancelled: number;
  completed: number;
  in_progress: number;
  total_assignments: number;
}

export interface AssignmentStatisticsResponse {
  date: string;
  driver_statistics: Record<string, DriverStatistics>;
  total_assignments: number;
  total_drivers: number;
}

// Assignment Reassignment Types
export interface ReassignAssignmentRequest {
  new_driver_id: number;
  notes: string;
}

export interface ReassignAssignmentResponse {
  assignment_id: number;
  message: string;
  new_driver_id: number;
  new_driver_name: string;
  notes: string;
  old_driver_id: number;
  old_driver_name: string;
  reassigned_at: string;
  success: boolean;
}

// Manual Assignment Types
export interface ManualAssignmentRequest {
  driver_id: number;
  notes: string;
  shipment_id: number;
}

export interface ManualAssignmentResponse {
  assigned_date: string;
  assignment_id: number;
  driver_id: number;
  driver_name: string;
  message: string;
  notes: string;
  shipment_id: number;
  success: boolean;
  tracking_code: string;
}

// Automated Assignment Types
export interface AutomatedAssignmentParams {
  assignment_date?: string;
}

// Warehouse Operations Types
export interface MoveToWarehouseResponse {
  message: string;
  moved_count: number;
  success: boolean;
}

// Statistics Types
export interface StatisticsParams {
  date_start?: string;
  date_end?: string;
}

export interface DriverStatisticsResponse {
  date_end: string;
  date_start: string;
  items_in_transit: number;
  items_in_warehouse: number;
  total_deliveries: number;
  undelivered_shipments: number;
}

export interface UserStatisticsResponse {
  date_end: string;
  date_start: string;
  delivered_shipments: number;
  in_transit_shipments: number;
  in_warehouse_shipments: number;
  undelivered_shipments: number;
  unfulfilled_shipments: number;
}

// Admin Statistics Types
export interface AdminStatisticsParams {
  date_start?: string;
  date_end?: string;
}

export interface AdminStatisticsResponse {
  cancelled_shipments: number;
  date_end: string;
  date_start: string;
  delivered_shipments: number;
  draft_shipments: number;
  in_transit_shipments: number;
  in_warehouse_shipments: number;
  paid_shipments: number;
  total_shipments: number;
  undelivered_shipments: number;
}