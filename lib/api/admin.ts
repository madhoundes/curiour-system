/**
 * Admin API Service
 * Handles all admin-related API calls for user management
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  ApiSuccessResponse,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AdminListUsersParams,
  AdminUpdateUserRoleParams,
  User
} from './types';

export class AdminService {
  /**
   * Create a new user with specific role (admin only)
   */
  async createUser(userData: AdminCreateUserRequest): Promise<ApiSuccessResponse<AdminCreateUserResponse>> {
    try {
      const response = await apiClient.post<AdminCreateUserResponse>(
        API_ENDPOINTS.AUTH.ADMIN_CREATE_USER,
        userData,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin create user failed:', error);
      throw error;
    }
  }

  /**
   * List all users with pagination (admin only)
   */
  async listUsers(params: AdminListUsersParams = {}): Promise<ApiSuccessResponse<User[]>> {
    try {
      const { skip = 0, limit = 100 } = params;
      
      const response = await apiClient.get<User[]>(
        API_ENDPOINTS.AUTH.ADMIN_LIST_USERS,
        { 
          requiresAuth: true,
          params: { skip, limit }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Admin list users failed:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(params: AdminUpdateUserRoleParams): Promise<ApiSuccessResponse<User>> {
    try {
      const { user_id, new_role } = params;
      
      // Replace :user_id placeholder in the URL
      const url = API_ENDPOINTS.AUTH.ADMIN_UPDATE_USER_ROLE.replace(':user_id', user_id.toString());
      
      const response = await apiClient.put<User>(
        url,
        null, // No body data needed
        { 
          requiresAuth: true,
          params: { new_role }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Admin update user role failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: number): Promise<ApiSuccessResponse<User>> {
    try {
      const response = await apiClient.get<User>(
        `/auth/admin/users/${userId}`,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin get user by ID failed:', error);
      throw error;
    }
  }

  /**
   * Deactivate/activate user (admin only)
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<ApiSuccessResponse<User>> {
    try {
      const response = await apiClient.patch<User>(
        `/auth/admin/users/${userId}/status`,
        { is_active: isActive },
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin toggle user status failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;