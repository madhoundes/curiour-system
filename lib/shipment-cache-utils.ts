/**
 * Shipment Cache Utilities
 * Provides user-specific caching for shipment form data
 */

import { profileService } from '@/lib/api/profile';
import type { ShipmentFormData } from './shipment-context';

/**
 * Get user-specific cache key for shipment form data
 */
export const getShipmentCacheKey = (userId?: string | number | null): string => {
  if (userId) {
    return `parcego-shipment-form-data-${userId}`;
  }
  // Return user-specific key format even without userId (will be empty until userId loads)
  return `parcego-shipment-form-data-${userId || 'temp'}`;
};

/**
 * Get current user ID from profile
 */
export const getCurrentUserId = async (): Promise<string | number | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const profile = await profileService.getProfile();
    return profile.id || null;
  } catch (error) {
    console.warn('Could not fetch user profile for cache key:', error);
    return null;
  }
};

/**
 * Load shipment form data from cache (user-specific)
 */
export const loadShipmentFormData = async (): Promise<ShipmentFormData | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userId = await getCurrentUserId();
    const cacheKey = getShipmentCacheKey(userId);
    const saved = localStorage.getItem(cacheKey);
    
    if (saved) {
      return JSON.parse(saved);
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to load shipment form data from cache:', error);
    return null;
  }
};

/**
 * Save shipment form data to cache (user-specific)
 */
export const saveShipmentFormData = async (data: Partial<ShipmentFormData>): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const userId = await getCurrentUserId();
    const cacheKey = getShipmentCacheKey(userId);
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save shipment form data to cache:', error);
  }
};

/**
 * Clear shipment form data cache for current user
 */
export const clearShipmentFormData = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const userId = await getCurrentUserId();
    const cacheKey = getShipmentCacheKey(userId);
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to clear shipment form data cache:', error);
  }
};

/**
 * Clear only recipient address fields from shipment form cache
 * Preserves package details (weight, dimensions, etc.)
 */
export const clearRecipientAddressOnly = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const userId = await getCurrentUserId();
    const cacheKey = getShipmentCacheKey(userId);
    const saved = localStorage.getItem(cacheKey);
    
    if (saved) {
      const data = JSON.parse(saved);
      
      // Clear only recipient fields
      data.recipientName = '';
      data.recipientCompany = '';
      data.recipientAddress = '';
      data.recipientCity = '';
      data.recipientProvince = '';
      data.recipientPostalCode = '';
      data.recipientPhone = '';
      data.recipientEmail = '';
      
      // Save back with recipient fields cleared
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Failed to clear recipient address from cache:', error);
  }
};

/**
 * Clear all shipment form data caches (for logout)
 * This clears all user-specific caches by pattern matching
 */
export const clearAllShipmentFormData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all user-specific keys by pattern
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('parcego-shipment-form-data-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear all shipment form data caches:', error);
  }
};

