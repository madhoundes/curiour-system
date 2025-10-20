/**
 * Shipping Service
 * Handles all shipping-related API operations including shipment creation,
 * billing, payment processing, and label generation
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  CreateShipmentRequest,
  CreateShipmentResponse,
  CreateBillingRequest,
  BillingRecord,
  CreateCheckoutSessionResponse,
  GetSessionStatusParams,
  SessionStatusResponse,
  GenerateLabelResponse,
  DetailedShipment,
  ShipmentsListResponse,
  UpdateShipmentStatusRequest,
  ShipmentStatusChange,
  ShippingErrorResponse,
  ApiResponse,
  StatusDurationResponse,
  ShipmentByStatusDurationItem,
  ShipmentsByStatusDurationParams,
  InitializeStatusTrackingResponse,
  ShipmentStatus,
  GetBillingRecordsParams,
  BillingRecordsListResponse,
  GenerateBillingReportRequest,
  GenerateBillingReportResponse,
} from './types';

export class ShippingService {
  /**
   * Get list of user shipments with optional pagination
   */
  async getShipments(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<DetailedShipment[]> {
    try {
      const response = await apiClient.get<ShipmentsListResponse>(
        API_ENDPOINTS.SHIPMENTS.LIST,
        { params }
      );

      // Return just the shipments array from the paginated response
      return response.data.shipments;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to get shipments');
    }
  }

  /**
   * Get the status of a checkout session
   */
  async getSessionStatus(session_id: string): Promise<SessionStatusResponse> {
    try {
      if (!session_id || session_id.trim() === '') {
        throw new Error('Session ID is required');
      }

      const response = await apiClient.get<SessionStatusResponse>(
        API_ENDPOINTS.BILLING.SESSION_STATUS,
        { params: { session_id } }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Session ID required');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error');
      }
      throw error;
    }
  }

  /**
   * Search user shipments by tracking code or ID
   */
  async searchShipments(query: string, params?: {
    skip?: number;
    limit?: number;
  }): Promise<DetailedShipment[]> {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const searchParams = {
        q: query.trim(),
        ...params
      };

      const response = await apiClient.get<DetailedShipment[]>(
        API_ENDPOINTS.SHIPMENTS.SEARCH,
        { params: searchParams }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(error.message || 'Failed to search shipments');
    }
  }

  /**
   * Create a new shipment with sender/receiver addresses and package details
   */
  async createShipment(data: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    try {
      // Client-side validation
      this.validateShipmentData(data);

      const response = await apiClient.post<CreateShipmentResponse>(
        API_ENDPOINTS.SHIPMENTS.CREATE,
        data
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data as ShippingErrorResponse;
        
        // Handle specific service area errors
        if (errorData.detail?.error === 'SENDER_SERVICE_AREA_NOT_SUPPORTED') {
          throw new Error(`Service Area Not Supported: We do not currently service the sender's area (${errorData.detail.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
        }
        
        if (errorData.detail?.error === 'RECEIVER_SERVICE_AREA_NOT_SUPPORTED') {
          throw new Error(`Service Area Not Supported: We do not currently service the receiver's area (${errorData.detail.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
        }
        
        throw new Error(errorData.detail.message || 'Invalid shipment data');
      }
      
      // Handle 422 validation errors specifically
      if (error.response?.status === 422) {
        console.error('🔍 422 Validation Error in createShipment:');
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Log each validation error if details array exists
        if (error.response.data?.details) {
          console.error('📋 Validation Details:');
          error.response.data.details.forEach((detail: any, index: number) => {
            console.error(`❌ Validation Error ${index + 1}:`, detail);
          });
        }
        
        // Create a structured error object that preserves the validation details
        const validationError = new Error('Validation Error');
        (validationError as any).status = 422;
        (validationError as any).details = error.response.data?.details || [];
        (validationError as any).response = error.response;
        throw validationError;
      }
      
      throw error;
    }
  }

  /**
   * Get detailed information about a specific shipment
   */
  async getShipment(shipmentId: number): Promise<DetailedShipment> {
    try {
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      const url = API_ENDPOINTS.SHIPMENTS.GET.replace(':id', shipmentId.toString());
      const response = await apiClient.get<DetailedShipment>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Shipment not found');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      throw error;
    }
  }

  /**
   * Update the status of a shipment
   */
  async updateShipmentStatus(
    shipmentId: number, 
    statusData: UpdateShipmentStatusRequest
  ): Promise<ShipmentStatusChange> {
    try {
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      this.validateStatusUpdateData(statusData);

      const url = API_ENDPOINTS.SHIPMENTS.UPDATE_STATUS.replace(':id', shipmentId.toString());
      const response = await apiClient.put<ShipmentStatusChange>(url, statusData);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        throw new Error(errorData.detail?.[0]?.msg || 'Invalid status update data');
      }
      throw error;
    }
  }

  /**
   * Get the complete status change history for a shipment
   */
  async getShipmentStatusHistory(
    shipmentId: number, 
    limit?: number
  ): Promise<ShipmentStatusChange[]> {
    try {
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      let url = API_ENDPOINTS.SHIPMENTS.STATUS_HISTORY.replace(':id', shipmentId.toString());
      
      if (limit && limit > 0 && limit <= 100) {
        url += `?limit=${limit}`;
      }

      const response = await apiClient.get<ShipmentStatusChange[]>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        throw new Error(errorData.detail?.[0]?.msg || 'Invalid request parameters');
      }
      throw error;
    }
  }

  /**
   * Create a billing record with automatically calculated pricing
   */
  async createBilling(data: CreateBillingRequest): Promise<BillingRecord> {
    try {
      if (!data.shipment_id || data.shipment_id <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      const response = await apiClient.post<BillingRecord>(
        API_ENDPOINTS.BILLING.CREATE,
        data
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Shipment not found');
      }
      throw error;
    }
  }

  /**
   * Create a Stripe checkout session for payment processing
   */
  async createCheckoutSession(billing_id: number): Promise<CreateCheckoutSessionResponse> {
    try {
      if (!billing_id || billing_id <= 0) {
        throw new Error('Valid billing ID is required');
      }

      const response = await apiClient.post<CreateCheckoutSessionResponse>(
        API_ENDPOINTS.BILLING.CREATE_CHECKOUT_SESSION,
        {}, // Empty request body
        { params: { billing_id } } // Pass billing_id as query parameter
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Billing not found or invalid status');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error');
      }
      throw error;
    }
  }

  /**
   * Get paginated list of user's billing records with optional status filtering
   */
  async getBillingRecords(params?: GetBillingRecordsParams): Promise<BillingRecordsListResponse> {
    try {
      const response = await apiClient.get<BillingRecordsListResponse>(
        API_ENDPOINTS.BILLING.LIST,
        { params }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 422) {
        throw new Error('Invalid parameters provided');
      }
      throw new Error(error.message || 'Failed to get billing records');
    }
  }

  /**
   * Generate monthly or yearly billing report in PDF format
   */
  async generateBillingReport(data: GenerateBillingReportRequest): Promise<GenerateBillingReportResponse> {
    try {
      if (!data.report_type || !data.year) {
        throw new Error('Report type and year are required');
      }

      if (data.report_type === 'monthly' && !data.month) {
        throw new Error('Month is required for monthly reports');
      }

      if (data.year < 2020 || data.year > new Date().getFullYear()) {
        throw new Error('Invalid year provided');
      }

      if (data.month && (data.month < 1 || data.month > 12)) {
        throw new Error('Invalid month provided (must be 1-12)');
      }

      const response = await apiClient.post<GenerateBillingReportResponse>(
        API_ENDPOINTS.BILLING.GENERATE_REPORT,
        data
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid report parameters');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error in report parameters');
      }
      throw new Error(error.message || 'Failed to generate billing report');
    }
  }

  /**
   * Generate and download shipment label (only for paid shipments)
   * Supports optional label format parameter
   */
  async generateLabel(shipmentId: number, labelFormat: string = 'standard'): Promise<GenerateLabelResponse> {
    try {
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      const url = API_ENDPOINTS.LABELS.DOWNLOAD.replace(':shipment_id', shipmentId.toString());
      const response = await apiClient.get<GenerateLabelResponse>(url, {
        params: { label_format: labelFormat }
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 402) {
        throw new Error('Payment required - shipment must be paid before generating label');
      }
      if (error.response?.status === 404) {
        throw new Error('Shipment not found or not owned by user');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error - invalid parameters');
      }
      if (error.response?.status === 500) {
        throw new Error('Failed to generate label - server error');
      }
      throw error;
    }
  }

  /**
   * Complete shipping flow: create shipment, billing, and checkout session
   */
  async createShippingFlow(shipmentData: CreateShipmentRequest): Promise<{
    shipment: CreateShipmentResponse;
    billing: BillingRecord;
    checkoutSession: CreateCheckoutSessionResponse;
  }> {
    try {
      console.log('🚀 Starting shipping flow with data:', JSON.stringify(shipmentData, null, 2));
      
      // Step 1: Create shipment
      console.log('📦 Step 1: Creating shipment...');
      const shipment = await this.createShipment(shipmentData);
      console.log('✅ Step 1 completed: Shipment created with ID:', shipment.shipment.id);

      // Step 2: Create billing
      console.log('💰 Step 2: Creating billing record...');
      const billing = await this.createBilling({
        shipment_id: shipment.shipment.id
      });
      console.log('✅ Step 2 completed: Billing created with ID:', billing.id);

      // Step 3: Create checkout session
      console.log('💳 Step 3: Creating checkout session...');
      const checkoutSession = await this.createCheckoutSession(billing.id);
      console.log('✅ Step 3 completed: Checkout session created');

      console.log('🎉 Shipping flow completed successfully');
      return {
        shipment,
        billing,
        checkoutSession
      };
    } catch (error) {
      console.error('❌ Shipping flow failed at step:', error);
      
      // Enhanced error logging for validation errors
      if ((error as any)?.response?.status === 422) {
        console.error('🔍 422 Validation Error Details:');
        console.error('Status:', (error as any)?.response?.status);
        console.error('Data:', (error as any)?.response?.data);
        console.error('Details array:', (error as any)?.response?.data?.details);
        
        // Log each validation error individually
        if ((error as any)?.response?.data?.details) {
          (error as any).response.data.details.forEach((detail: any, index: number) => {
            console.error(`❌ Validation Error ${index + 1}:`, detail);
          });
        }
      }
      
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        response: (error as any)?.response?.data || 'No response data',
        status: (error as any)?.response?.status || 'No status code'
      });
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Service Area Not Supported')) {
          throw new Error(error.message); // Pass through service area errors as-is
        } else if (error.message.includes('Authentication')) {
          throw new Error(`Shipping flow failed: Authentication required - ${error.message}`);
        } else if (error.message.includes('validation')) {
          throw new Error(`Shipping flow failed: Data validation error - ${error.message}`);
        } else if (error.message.includes('Network')) {
          throw new Error(`Shipping flow failed: Network error - ${error.message}`);
        } else {
          throw new Error(`Shipping flow failed: ${error.message}`);
        }
      }
      
      throw new Error(`Shipping flow failed: Unknown error`);
    }
  }

  // Validation helpers
  private validateShipmentData(data: CreateShipmentRequest): void {
    // Validate sender address
    this.validateAddress(data.sender_address, 'Sender');
    
    // Validate receiver address
    this.validateAddress(data.receiver_address, 'Receiver');
    
    // Validate package
    this.validatePackage(data.package);
  }

  private validateAddress(address: any, type: string): void {
    const required = ['contact_name', 'street_address', 'city', 'province', 'postal_code', 'country', 'phone_number', 'email'];
    
    for (const field of required) {
      if (!address[field] || address[field].trim() === '') {
        throw new Error(`${type} address: ${field} is required`);
      }
    }

    // Validate email format
    if (!this.isValidEmail(address.email)) {
      throw new Error(`${type} address: Invalid email format`);
    }

    // Validate postal code format (basic Canadian format)
    if (!this.isValidPostalCode(address.postal_code)) {
      throw new Error(`${type} address: Invalid postal code format`);
    }
  }

  private validatePackage(pkg: any): void {
    const required = ['package_type', 'weight', 'length', 'width', 'height', 'contents_description'];
    
    for (const field of required) {
      if (pkg[field] === undefined || pkg[field] === null || pkg[field] === '') {
        throw new Error(`Package: ${field} is required`);
      }
    }

    // Validate numeric fields
    const numericFields = ['weight', 'length', 'width', 'height'];
    for (const field of numericFields) {
      if (isNaN(Number(pkg[field])) || Number(pkg[field]) <= 0) {
        throw new Error(`Package: ${field} must be a positive number`);
      }
    }

    // Validate package type
    const validTypes = ['box', 'envelope', 'tube', 'pallet'];
    if (!validTypes.includes(pkg.package_type)) {
      throw new Error(`Package: package_type must be one of: ${validTypes.join(', ')}`);
    }
  }

  private validateStatusUpdateData(data: UpdateShipmentStatusRequest): void {
    // Validate required fields
    if (!data.status || data.status.trim() === '') {
      throw new Error('Status is required');
    }

    if (!data.change_reason || data.change_reason.trim() === '') {
      throw new Error('Change reason is required');
    }

    // Validate status value
    const validStatuses = ['DRAFT', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(data.status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate change reason length
    if (data.change_reason.length > 500) {
      throw new Error('Change reason must be 500 characters or less');
    }

    // Validate notes length if provided
    if (data.notes && data.notes.length > 1000) {
      throw new Error('Notes must be 1000 characters or less');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPostalCode(postalCode: string): boolean {
    // Canadian postal code format: A1A 1A1 or A1A1A1
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalRegex.test(postalCode.trim());
  }

  /**
   * Get supported Canadian provinces
   */
  getCanadianProvinces(): Array<{ code: string; name: string }> {
    return [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' },
    ];
  }

  /**
   * Get supported package types
   */
  getPackageTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'box', label: 'Box', description: 'Standard cardboard box' },
      { value: 'envelope', label: 'Envelope', description: 'Document envelope or padded mailer' },
      { value: 'tube', label: 'Tube', description: 'Cylindrical container for posters/documents' },
      { value: 'pallet', label: 'Pallet', description: 'Large freight on pallet' },
    ];
  }

  /**
   * Get time spent in a specific status for a shipment
   */
  async getShipmentStatusDuration(
    shipmentId: number, 
    status: ShipmentStatus
  ): Promise<StatusDurationResponse> {
    try {
      if (!shipmentId || shipmentId <= 0) {
        throw new Error('Valid shipment ID is required');
      }

      if (!status || status.trim() === '') {
        throw new Error('Status is required');
      }

      // Validate status value
      const validStatuses: ShipmentStatus[] = [
        'DRAFT', 'PENDING_PAYMENT', 'PAID', 'LABEL_GENERATED', 
        'PICKED_UP', 'IN_WAREHOUSE', 'IN_TRANSIT', 'DELIVERED', 
        'UNDELIVERED', 'CANCELLED'
      ];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      const url = API_ENDPOINTS.SHIPMENTS.STATUS_DURATION
        .replace(':id', shipmentId.toString())
        .replace(':status', status);
      
      const response = await apiClient.get<StatusDurationResponse>(url);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Shipment not found or status not found');
      }
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        throw new Error(errorData.detail?.[0]?.msg || 'Invalid request parameters');
      }
      throw error;
    }
  }

  /**
   * Get shipments that have been in a specific status for a certain duration
   */
  async getShipmentsByStatusDuration(
    params: ShipmentsByStatusDurationParams
  ): Promise<ShipmentByStatusDurationItem[]> {
    try {
      if (!params.status || params.status.trim() === '') {
        throw new Error('Status is required');
      }

      // Validate status value
      const validStatuses: ShipmentStatus[] = [
        'DRAFT', 'PENDING_PAYMENT', 'PAID', 'LABEL_GENERATED', 
        'PICKED_UP', 'IN_WAREHOUSE', 'IN_TRANSIT', 'DELIVERED', 
        'UNDELIVERED', 'CANCELLED'
      ];
      
      if (!validStatuses.includes(params.status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate duration parameters
      if (params.min_duration_hours !== undefined && params.min_duration_hours !== null && params.min_duration_hours < 0) {
        throw new Error('Minimum duration hours must be 0 or greater');
      }

      if (params.max_duration_hours !== undefined && params.max_duration_hours !== null && params.max_duration_hours < 0) {
        throw new Error('Maximum duration hours must be 0 or greater');
      }

      // Validate limit parameter
      if (params.limit !== undefined && (params.limit < 1 || params.limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }

      const url = API_ENDPOINTS.SHIPMENTS.BY_STATUS_DURATION.replace(':status', params.status);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.min_duration_hours !== undefined && params.min_duration_hours !== null) {
        queryParams.append('min_duration_hours', params.min_duration_hours.toString());
      }
      if (params.max_duration_hours !== undefined && params.max_duration_hours !== null) {
        queryParams.append('max_duration_hours', params.max_duration_hours.toString());
      }
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }

      const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
      const response = await apiClient.get<ShipmentByStatusDurationItem[]>(fullUrl);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        throw new Error(errorData.detail?.[0]?.msg || 'Invalid request parameters');
      }
      throw error;
    }
  }

  /**
   * Initialize status tracking for existing shipments (admin only)
   */
  async initializeStatusTracking(): Promise<InitializeStatusTrackingResponse> {
    try {
      const response = await apiClient.post<InitializeStatusTrackingResponse>(
        API_ENDPOINTS.SHIPMENTS.INITIALIZE_STATUS_TRACKING
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Admin access required');
      }
      throw error;
    }
  }
}

// Create and export a singleton instance
export const shippingService = new ShippingService();