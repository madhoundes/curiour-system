/**
 * API Module Index
 * Central export point for all API services and utilities
 */

// Core API client
export { apiClient, default as client } from './client';

// API configuration and constants
export { API_CONFIG, API_ENDPOINTS, HTTP_STATUS } from './config';

// TypeScript types
export type * from './types';

// Authentication service
export { authService, AuthService } from './auth';

// Admin service
export { adminService } from './admin';

// Quotes service
export { quotesService } from './quotes';

// Profile service
export { profileService } from './profile';

// Shipping service
export { shippingService } from './shipping';

// Claims service
export { claimsService } from './claims';

// Locations service
export { locationsService, LocationsService } from './locations';

// Import for internal use
import { apiClient } from './client';
import { authService } from './auth';
import { adminService } from './admin';
import { quotesService } from './quotes';
import { profileService } from './profile';
import { shippingService } from './shipping';
import { claimsService } from './claims';
import { locationsService } from './locations';

// Utility functions for API integration
export const api = {
  client: apiClient,
  auth: authService,
  admin: adminService,
  quotes: quotesService,
  profile: profileService,
  shipping: shippingService,
  claims: claimsService,
  locations: locationsService,
};

export default api;