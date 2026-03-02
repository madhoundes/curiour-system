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
  UpdateShipmentRequest,
  UpdateShipmentResponse,
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
        params
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
        searchParams
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to search shipments.');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to search shipments.');
      }
      if (error.response?.status === 404) {
        throw new Error('No shipments found matching your search.');
      }
      if (error.response?.status === 422) {
        throw new Error('Invalid search parameters provided.');
      }
      throw new Error(error.message || 'Failed to search shipments. Please try again.');
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
      // Handle API client formatted errors (from handleError method)
      // API client throws objects with: { error, message, status, details }
      if (error.status === 400 || error.response?.status === 400) {
        // Check if error is from API client (has details property directly)
        if (error.details && typeof error.details === 'object') {
          const errorDetails = error.details;
          
          // Handle specific service area errors
          if (errorDetails.error === 'SENDER_SERVICE_AREA_NOT_SUPPORTED') {
            throw new Error(`Service Area Not Supported: We do not currently service the sender's area (${errorDetails.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
          }
          
          if (errorDetails.error === 'RECEIVER_SERVICE_AREA_NOT_SUPPORTED') {
            throw new Error(`Service Area Not Supported: We do not currently service the receiver's area (${errorDetails.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
          }
          
          // Use the detailed message from the API if available
          if (errorDetails.message) {
            throw new Error(errorDetails.message);
          }
        }
        
        // Handle axios-style errors (has response.data.detail)
        if (error.response?.data) {
          const errorData = error.response.data as ShippingErrorResponse;
          
          if (errorData.detail?.error === 'SENDER_SERVICE_AREA_NOT_SUPPORTED') {
            throw new Error(`Service Area Not Supported: We do not currently service the sender's area (${errorData.detail.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
          }
          
          if (errorData.detail?.error === 'RECEIVER_SERVICE_AREA_NOT_SUPPORTED') {
            throw new Error(`Service Area Not Supported: We do not currently service the receiver's area (${errorData.detail.postal_code || 'unknown postal code'}). Please contact support for assistance.`);
          }
          
          throw new Error(errorData.detail?.message || 'Invalid shipment data');
        }
        
        // Fallback for other 400 errors
        throw new Error(error.message || error.details?.message || 'Invalid shipment data');
      }
      
      // Handle 422 validation errors specifically
      if (error.status === 422 || error.response?.status === 422) {
        console.error('🔍 422 Validation Error in createShipment:');
        console.error('Status:', error.status || error.response?.status);
        console.error('Response data:', error.details || error.response?.data);
        
        // Log each validation error if details array exists
        const detailsArray = error.details || error.response?.data?.details;
        if (Array.isArray(detailsArray)) {
          console.error('📋 Validation Details:');
          detailsArray.forEach((detail: any, index: number) => {
            console.error(`❌ Validation Error ${index + 1}:`, detail);
          });
        }
        
        // Create a structured error object that preserves the validation details
        const validationError = new Error('Validation Error');
        (validationError as any).status = 422;
        (validationError as any).details = detailsArray || [];
        (validationError as any).response = error.response;
        throw validationError;
      }
      
      throw error;
    }
  }

  /**
   * Get detailed information about a specific shipment
   */
  /**
   * Update a shipment (only allowed for DRAFT status shipments)
   */
  async updateShipment(shipmentId: number, data: UpdateShipmentRequest): Promise<UpdateShipmentResponse> {
    try {
      const url = API_ENDPOINTS.SHIPMENTS.UPDATE.replace(':id', shipmentId.toString());
      const response = await apiClient.put<UpdateShipmentResponse>(url, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid data or service area not supported');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('Cannot update shipment (not in DRAFT status)');
      }
      if (error.response?.status === 404) {
        throw new Error('Shipment not found');
      }
      if (error.response?.status === 422) {
        throw new Error('Validation error');
      }
      throw new Error(error.message || 'Failed to update shipment');
    }
  }

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
   * Embedded checkout flow: expects client_secret from backend
   */
  async createCheckoutSession(billing_id: number): Promise<CreateCheckoutSessionResponse> {
    try {
      if (!billing_id || billing_id <= 0) {
        throw new Error('Valid billing ID is required');
      }

      const response = await apiClient.post<CreateCheckoutSessionResponse | { data?: CreateCheckoutSessionResponse }>(
        API_ENDPOINTS.BILLING.CREATE_CHECKOUT_SESSION,
        {}, // Empty request body
        { params: { billing_id } } // Pass billing_id as query parameter
      );

      const raw = response.data as Record<string, unknown>;
      // Normalize embedded checkout response
      const nested = raw?.data as Record<string, unknown> | undefined;
      const sessionId = (raw?.session_id ?? nested?.session_id ?? raw?.checkout_session_id ?? nested?.checkout_session_id) as string | undefined;
      return {
        checkout_session_id: sessionId ?? '',
        client_secret: (raw?.client_secret ?? nested?.client_secret ?? '') as string,
      };
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
        params
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
      const response = await apiClient.get<GenerateLabelResponse>(
        url,
        { label_format: labelFormat },
        { requiresAuth: true }
      );

      return response.data;
    } catch (error: any) {
      // Preserve error details if they exist (from API client)
      if (error.status === 402 || error.response?.status === 402) {
        const errorObj: any = new Error(error.details || error.message || 'Payment required - shipment must be paid before generating label');
        errorObj.status = 402;
        errorObj.details = error.details || error.response?.data?.details || 'Shipment must be paid before generating a label';
        errorObj.error = error.error || 'Payment Required';
        throw errorObj;
      }
      if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Shipment not found or not owned by user');
      }
      if (error.status === 422 || error.response?.status === 422) {
        throw new Error('Validation error - invalid parameters');
      }
      if (error.status === 500 || error.response?.status === 500) {
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
    } catch (error: any) {
      console.error('❌ Shipping flow failed at step:', error);
      
      // Enhanced error logging for validation errors
      if (error?.status === 422 || error?.response?.status === 422) {
        console.error('🔍 422 Validation Error Details:');
        console.error('Status:', error?.status || error?.response?.status);
        console.error('Data:', error?.details || error?.response?.data);
        console.error('Details array:', error?.details || error?.response?.data?.details);
        
        // Log each validation error individually
        const detailsArray = error?.details || error?.response?.data?.details;
        if (Array.isArray(detailsArray)) {
          detailsArray.forEach((detail: any, index: number) => {
            console.error(`❌ Validation Error ${index + 1}:`, detail);
          });
        }
      }
      
      console.error('❌ Error details:', {
        message: error?.message || (error instanceof Error ? error.message : 'Unknown error'),
        stack: error instanceof Error ? error.stack : error?.stack || 'No stack trace',
        response: error?.details || error?.response?.data || 'No response data',
        status: error?.status || error?.response?.status || 'No status code'
      });
      
      // Extract error message from various error formats
      let errorMessage = 'Unknown error';
      
      // Check if error is from API client (has details property with nested error info)
      if (error?.details && typeof error.details === 'object') {
        const errorDetails = error.details;
        
        // Handle service area errors
        if (errorDetails.error === 'SENDER_SERVICE_AREA_NOT_SUPPORTED' || errorDetails.error === 'RECEIVER_SERVICE_AREA_NOT_SUPPORTED') {
          errorMessage = `Service Area Not Supported: ${errorDetails.message || 'We do not currently service this area'}${errorDetails.postal_code ? ` (${errorDetails.postal_code})` : ''}. Please contact support for assistance.`;
        } else if (errorDetails.message) {
          errorMessage = errorDetails.message;
        }
      }
      // Check if error is an Error instance with a message
      else if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Check if error has a message property directly
      else if (error?.message) {
        errorMessage = error.message;
      }
      // Check axios-style error response
      else if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'object' && detail.message) {
          errorMessage = detail.message;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      // Provide more specific error messages based on the error type
      if (errorMessage.includes('Service Area Not Supported')) {
        throw new Error(errorMessage); // Pass through service area errors as-is
      } else if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
        throw new Error(`Shipping flow failed: Authentication required - ${errorMessage}`);
      } else if (errorMessage.includes('validation') || errorMessage.includes('Validation')) {
        throw new Error(`Shipping flow failed: Data validation error - ${errorMessage}`);
      } else if (errorMessage.includes('Network')) {
        throw new Error(`Shipping flow failed: Network error - ${errorMessage}`);
      } else if (errorMessage !== 'Unknown error') {
        throw new Error(`Shipping flow failed: ${errorMessage}`);
      }
      
      throw new Error(`Shipping flow failed: Unknown error`);
    }
  }

  // Validation helpers
  private validateShipmentData(data: CreateShipmentRequest): void {
    // Validate sender address (pickup location - must be in Toronto/Mississauga)
    this.validateAddress(data.sender_address, 'sender');
    
    // Validate receiver address (delivery location - must be in Toronto/Mississauga)
    this.validateAddress(data.receiver_address, 'receiver');
    
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

    // Validate service area - both sender (pickup) and receiver (delivery) must be in Toronto/Mississauga
    // This matches the backend API requirement that both addresses must be in the service area
    const city = address.city.trim();
    const normalizedCity = city.toLowerCase();
    const postalCode = address.postal_code.trim().toUpperCase().replace(/\s+/g, '');
    
    // Validate postal code is in service area
    const isValidServiceAreaPostalCode = this.isPostalCodeInServiceArea(postalCode);
    
    // Check if city is Toronto (including Downtown Toronto) or Mississauga
    const isToronto = normalizedCity === 'toronto' || normalizedCity.includes('downtown');
    const isMississauga = normalizedCity === 'mississauga';
    
    // Determine address type for error messages
    const addressTypeLabel = type === 'sender' ? 'pickup location (sender)' : 'delivery location (receiver)';
    
    // Validate postal code matches the city
    if (isToronto && !this.isTorontoPostalCode(postalCode)) {
      throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" does not belong to Toronto. Please enter a valid Toronto postal code (starts with M).`);
    }
    
    if (isMississauga && !this.isMississaugaPostalCode(postalCode)) {
      throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" does not belong to Mississauga. Please enter a valid Mississauga postal code (starts with L4T-L5W).`);
    }
    
    // If city is valid but postal code is not in service area, reject
    if ((isToronto || isMississauga) && !isValidServiceAreaPostalCode) {
      throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" is not in our service area. ${type === 'sender' ? 'Pickup' : 'Delivery'} is only available in Downtown Toronto (M prefix) and Mississauga (L4T-L5W prefix).`);
    }
    
    // If postal code is valid but city doesn't match, reject
    if (isValidServiceAreaPostalCode) {
      if (this.isTorontoPostalCode(postalCode) && !isToronto) {
        throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" belongs to Toronto, but the city field doesn't match. Please select "Toronto" as the city.`);
      }
      if (this.isMississaugaPostalCode(postalCode) && !isMississauga) {
        throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" belongs to Mississauga, but the city field doesn't match. Please select "Mississauga" as the city.`);
      }
    }
    
    // Final check: if city is not in service area
    if (!isToronto && !isMississauga) {
      throw new Error(`${type === 'sender' ? 'Pickup' : 'Delivery'} is only supported in Downtown Toronto and Mississauga. Your ${addressTypeLabel} city "${city}" is not in our service area.`);
    }
    
    // Final check: if postal code is not in service area (even if city is correct)
    if (!isValidServiceAreaPostalCode) {
      throw new Error(`The ${addressTypeLabel} postal code "${address.postal_code}" is not in our service area. ${type === 'sender' ? 'Pickup' : 'Delivery'} is only available in Downtown Toronto (postal codes starting with M) and Mississauga (postal codes starting with L4T-L5W).`);
    }
    
    // Normalize city name - ensure province is Ontario for both cities
    if (isToronto) {
      address.city = 'Toronto';
      address.province = 'ON'; // Ensure province is Ontario
    } else if (isMississauga) {
      address.city = 'Mississauga';
      address.province = 'ON'; // Ensure province is Ontario
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
    if (!postalCode || typeof postalCode !== 'string') {
      return false;
    }
    // More flexible validation: remove spaces and dashes, then check format
    // Canadian postal code format: A1A 1A1, A1A1A1, or A1A-1A1
    const cleaned = postalCode.trim().replace(/[\s-]/g, '');
    if (cleaned.length !== 6) {
      return false;
    }
    // Check format: letter, digit, letter, digit, letter, digit
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
    return canadianPostalRegex.test(cleaned);
  }

  /**
   * Check if postal code belongs to Toronto
   * Toronto postal codes start with M (M1A to M9Z)
   * Downtown Toronto typically uses M4W, M5H-M5X, M6G-M6S, etc.
   */
  private isTorontoPostalCode(postalCode: string): boolean {
    // Normalize postal code: remove spaces and convert to uppercase
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    
    // Toronto postal codes start with M
    if (!normalized.startsWith('M')) {
      return false;
    }
    
    // Extract FSA (first 3 characters: M5V)
    const fsa = normalized.substring(0, 3);
    const letter = fsa.charAt(0); // M
    const digit1 = parseInt(fsa.charAt(1)); // 5
    const letter2 = fsa.charAt(2); // V
    
    // Toronto uses M prefix with various FSAs
    // Common Downtown Toronto FSAs: M4W, M5A-M5Z, M6A-M6Z
    // We'll accept all M codes as Toronto (can be refined later)
    return letter === 'M' && digit1 >= 1 && digit1 <= 9;
  }

  /**
   * Check if postal code belongs to Mississauga
   * Mississauga postal codes start with L, specifically L4T-L5W range
   */
  private isMississaugaPostalCode(postalCode: string): boolean {
    // Normalize postal code: remove spaces and convert to uppercase
    const normalized = postalCode.trim().toUpperCase().replace(/\s+/g, '');
    
    // Mississauga postal codes start with L
    if (!normalized.startsWith('L')) {
      return false;
    }
    
    // Extract FSA (first 3 characters: L5A)
    const fsa = normalized.substring(0, 3);
    const letter = fsa.charAt(0); // L
    const digit1 = parseInt(fsa.charAt(1)); // 4 or 5
    const letter2 = fsa.charAt(2); // T, W, X, Y, Z, A, B, C, etc.
    
    // Mississauga uses L4T-L4Z and L5A-L5W ranges
    if (letter !== 'L') {
      return false;
    }
    
    // L4T, L4W, L4X, L4Y, L4Z
    if (digit1 === 4) {
      const validL4FSAs = ['T', 'W', 'X', 'Y', 'Z'];
      return validL4FSAs.includes(letter2);
    }
    
    // L5A through L5W (L5A, L5B, L5C, L5E, L5G, L5H, L5J, L5K, L5L, L5M, L5N, L5P, L5R, L5S, L5T, L5V, L5W)
    if (digit1 === 5) {
      const validL5FSAs = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'];
      return validL5FSAs.includes(letter2);
    }
    
    return false;
  }

  /**
   * Check if postal code is in service area (Toronto or Mississauga)
   */
  private isPostalCodeInServiceArea(postalCode: string): boolean {
    return this.isTorontoPostalCode(postalCode) || this.isMississaugaPostalCode(postalCode);
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