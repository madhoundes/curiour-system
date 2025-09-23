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

// Import for internal use
import { apiClient } from './client';
import { authService } from './auth';
import { adminService } from './admin';

// Utility functions for API integration
export const api = {
  client: apiClient,
  auth: authService,
  admin: adminService,
};

export default api;