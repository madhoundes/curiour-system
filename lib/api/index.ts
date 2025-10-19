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

// Contact service
export { contactService } from './contact';

// Locations service
export { locationsService, LocationsService } from './locations';

// Driver service
export { driverService, DriverService } from './driver';

// Route optimization service
export { routeOptimizationService, RouteOptimizationService } from './route-optimization';

// Tracking service
export { trackingService, TrackingService } from './tracking';

// Notification service
export { notificationService, NotificationService } from './notifications';

// Import for internal use
import { apiClient } from './client';
import { authService } from './auth';
import { adminService } from './admin';
import { quotesService } from './quotes';
import { profileService } from './profile';
import { shippingService } from './shipping';
import { claimsService } from './claims';
import { contactService } from './contact';
import { locationsService } from './locations';
import { driverService } from './driver';
import { routeOptimizationService } from './route-optimization';
import { trackingService } from './tracking';
import { notificationService } from './notifications';

// Utility functions for API integration
export const api = {
  client: apiClient,
  auth: authService,
  admin: adminService,
  quotes: quotesService,
  profile: profileService,
  shipping: shippingService,
  claims: claimsService,
  contact: contactService,
  locations: locationsService,
  driver: driverService,
  routeOptimization: routeOptimizationService,
  tracking: trackingService,
  notifications: notificationService,
};

export default api;