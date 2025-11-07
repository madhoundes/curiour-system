/**
 * Re-authentication Utility
 * Handles automatic token refresh and re-authentication for failed API requests
 */

import { authService } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

let isReAuthenticating = false;
let reAuthPromise: Promise<boolean> | null = null;

/**
 * Attempt to re-authenticate the user
 * First tries to refresh the token, then verifies authentication
 * @returns Promise<boolean> - true if re-authentication succeeded, false otherwise
 */
export async function reAuthenticate(): Promise<boolean> {
  // If already re-authenticating, return the existing promise
  if (isReAuthenticating && reAuthPromise) {
    return reAuthPromise;
  }

  isReAuthenticating = true;
  
  reAuthPromise = (async () => {
    try {
      // Step 1: Try to refresh the token
      console.log('[Re-Auth] Attempting to refresh token...');
      await authService.refreshToken();
      
      // Step 2: Verify the new token works by checking current user
      console.log('[Re-Auth] Verifying refreshed token...');
      await authService.getCurrentUser();
      
      console.log('[Re-Auth] Re-authentication successful');
      return true;
    } catch (refreshError) {
      console.error('[Re-Auth] Token refresh failed:', refreshError);
      
      // If refresh token endpoint doesn't work or refresh token is expired,
      // we need to check if user can still authenticate via session/cookie
      try {
        // Try to verify current token - maybe it's still valid
        console.log('[Re-Auth] Checking if current token is valid...');
        await authService.verifyToken();
        console.log('[Re-Auth] Current token is still valid');
        return true;
      } catch (verifyError) {
        console.error('[Re-Auth] Token verification also failed:', verifyError);
        
        // Token is truly invalid - user needs to log in again
        // But don't redirect immediately - let the component handle it
        apiClient.removeAuthToken();
        return false;
      }
    } finally {
      isReAuthenticating = false;
      // Clear the promise after a short delay to allow retries
      setTimeout(() => {
        reAuthPromise = null;
      }, 1000);
    }
  })();

  return reAuthPromise;
}

/**
 * Execute a function with automatic re-authentication retry on 401 errors
 * @param fn - Function to execute that might fail with 401
 * @param maxRetries - Maximum number of retry attempts (default: 1)
 * @returns Promise with the function result
 */
export async function withReAuth<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 401 error
      const isUnauthorized = 
        error?.status === 401 || 
        error?.response?.status === 401 ||
        (error?.message && error.message.includes('401')) ||
        (error?.message && error.message.includes('Unauthorized'));
      
      if (isUnauthorized && attempt < maxRetries) {
        console.log(`[Re-Auth] Got 401 error, attempting re-authentication (attempt ${attempt + 1}/${maxRetries})...`);
        
        // Try to re-authenticate
        const reAuthSuccess = await reAuthenticate();
        
        if (reAuthSuccess) {
          console.log('[Re-Auth] Re-authentication successful, retrying request...');
          // Continue to next iteration to retry the request
          continue;
        } else {
          console.error('[Re-Auth] Re-authentication failed, cannot retry request');
          // Re-authentication failed, throw the original error
          throw error;
        }
      } else {
        // Not a 401 error, or no more retries, throw the error
        throw error;
      }
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Reset the re-authentication state (useful for testing or manual reset)
 */
export function resetReAuthState(): void {
  isReAuthenticating = false;
  reAuthPromise = null;
}

