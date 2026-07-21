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
  AdminListPaidShipmentsParams,
  AdminAssignableShipmentsResponse,
  AdminMoveSingleToWarehouseResponse,
  AdminPaidShipmentsResponse,
  AdminUpdateUserRoleParams,
  AdminImpersonateResponse,
  User,
  AssignmentsResponse,
  AssignmentStatisticsResponse,
  ReassignAssignmentRequest,
  ReassignAssignmentResponse,
  ManualAssignmentRequest,
  ManualAssignmentResponse,
  BulkManualAssignmentRequest,
  BulkManualAssignmentResponse,
  AutomatedAssignmentParams,
  MoveToWarehouseResponse,
  StatisticsParams,
  DriverStatisticsResponse,
  UserStatisticsResponse,
  AdminStatisticsParams,
  AdminStatisticsResponse
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

      // ``apiClient.get`` signature: (url, queryParams, options).
      // Previously this passed ``{ requiresAuth, params }`` as the
      // ``queryParams`` arg, which serialized to ``?requiresAuth=true&params=[object+Object]``
      // and silently dropped pagination.
      const response = await apiClient.get<User[]>(
        API_ENDPOINTS.AUTH.ADMIN_LIST_USERS,
        { skip, limit },
        { requiresAuth: true }
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
   * Issue a short-lived merchant session token (admin only)
   */
  async impersonateUser(userId: number): Promise<ApiSuccessResponse<AdminImpersonateResponse>> {
    try {
      const url = API_ENDPOINTS.AUTH.ADMIN_IMPERSONATE_USER.replace(
        ':user_id',
        userId.toString(),
      );

      const response = await apiClient.post<AdminImpersonateResponse>(
        url,
        {},
        { requiresAuth: true },
      );

      return response;
    } catch (error) {
      console.error('Admin impersonate user failed:', error);
      throw error;
    }
  }

  /**
   * List merchants marked as free (payment waived)
   */
  async listFreeMerchants(): Promise<ApiSuccessResponse<User[]>> {
    try {
      const response = await apiClient.get<User[]>(
        API_ENDPOINTS.AUTH.ADMIN_FREE_MERCHANTS,
        {},
        { requiresAuth: true }
      );
      return response;
    } catch (error) {
      console.error('Admin list free merchants failed:', error);
      throw error;
    }
  }

  /**
   * Mark a merchant as free (skip payment)
   */
  async addFreeMerchant(userId: number): Promise<ApiSuccessResponse<User>> {
    try {
      const url = API_ENDPOINTS.AUTH.ADMIN_FREE_MERCHANT.replace(':user_id', userId.toString());
      const response = await apiClient.post<User>(url, {}, { requiresAuth: true });
      return response;
    } catch (error) {
      console.error('Admin add free merchant failed:', error);
      throw error;
    }
  }

  /**
   * Remove a merchant from the free list
   */
  async removeFreeMerchant(userId: number): Promise<ApiSuccessResponse<User>> {
    try {
      const url = API_ENDPOINTS.AUTH.ADMIN_FREE_MERCHANT.replace(':user_id', userId.toString());
      const response = await apiClient.delete<User>(url, { requiresAuth: true });
      return response;
    } catch (error) {
      console.error('Admin remove free merchant failed:', error);
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
   * Get today's assignments for all drivers (admin only)
   */
  async getTodaysAssignments(): Promise<ApiSuccessResponse<AssignmentsResponse>> {
    try {
      const response = await apiClient.get<AssignmentsResponse>(
        API_ENDPOINTS.AUTH.ADMIN_ASSIGNMENTS_TODAY,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin get today\'s assignments failed:', error);
      throw error;
    }
  }

  /**
   * Get assignments for specific date (admin only)
   */
  async getAssignmentsByDate(assignmentDate: string): Promise<ApiSuccessResponse<AssignmentsResponse>> {
    try {
      // Replace :assignment_date placeholder in the URL
      const url = API_ENDPOINTS.AUTH.ADMIN_ASSIGNMENTS_BY_DATE.replace(':assignment_date', assignmentDate);
      
      const response = await apiClient.get<AssignmentsResponse>(
        url,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin get assignments by date failed:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics for specific date (admin only)
   */
  async getAssignmentStatistics(assignmentDate: string): Promise<ApiSuccessResponse<AssignmentStatisticsResponse>> {
    try {
      // Replace :assignment_date placeholder in the URL
      const url = API_ENDPOINTS.AUTH.ADMIN_ASSIGNMENT_STATISTICS.replace(':assignment_date', assignmentDate);
      
      const response = await apiClient.get<AssignmentStatisticsResponse>(
        url,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin get assignment statistics failed:', error);
      throw error;
    }
  }

  /**
   * Reassign assignment to different driver (admin only)
   */
  async reassignAssignment(
    assignmentId: number, 
    reassignmentData: ReassignAssignmentRequest
  ): Promise<ApiSuccessResponse<ReassignAssignmentResponse>> {
    try {
      // Replace :assignment_id placeholder in the URL
      const url = API_ENDPOINTS.AUTH.ADMIN_REASSIGN_ASSIGNMENT.replace(':assignment_id', assignmentId.toString());
      
      const response = await apiClient.put<ReassignAssignmentResponse>(
        url,
        reassignmentData,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
       console.error('Admin reassign assignment failed:', error);
       throw error;
     }
   }

   /**
    * Create manual assignment (admin only)
    */
   async createManualAssignment(
     assignmentData: ManualAssignmentRequest
   ): Promise<ApiSuccessResponse<ManualAssignmentResponse>> {
     try {
       const response = await apiClient.post<ManualAssignmentResponse>(
         API_ENDPOINTS.AUTH.ADMIN_MANUAL_ASSIGNMENT,
         assignmentData,
         { requiresAuth: true }
       );
       
       return response;
     } catch (error) {
       console.error('Admin create manual assignment failed:', error);
       throw error;
     }
   }

   /**
    * Create bulk manual assignments for one driver (admin only)
    */
   async createBulkManualAssignment(
     assignmentData: BulkManualAssignmentRequest
   ): Promise<ApiSuccessResponse<BulkManualAssignmentResponse>> {
     try {
       const response = await apiClient.post<BulkManualAssignmentResponse>(
         API_ENDPOINTS.AUTH.ADMIN_BULK_MANUAL_ASSIGNMENT,
         assignmentData,
         { requiresAuth: true }
       );

       return response;
     } catch (error) {
       console.error('Admin create bulk manual assignment failed:', error);
       throw error;
     }
   }

  /**
   * Run automated assignment process (admin only)
   */
  async runAutomatedAssignment(
    params?: AutomatedAssignmentParams
  ): Promise<ApiSuccessResponse<string>> {
    try {
      const response = await apiClient.post<string>(
        API_ENDPOINTS.AUTH.ADMIN_RUN_AUTOMATED_ASSIGNMENT,
        {},
        { 
          requiresAuth: true,
          params: params
        }
      );
      
      return response;
    } catch (error) {
      console.error('Admin run automated assignment failed:', error);
      throw error;
    }
  }

  /**
   * Clear all current driver assignments (admin only)
   * Removes all currently assigned packages (ASSIGNED and IN_PROGRESS status)
   * 
   * NOTE: Backend endpoint does NOT support date parameter yet.
   * It clears ALL assignments globally, not date-specific.
   */
  async clearAllAssignments(): Promise<ApiSuccessResponse<string>> {
    try {
      const response = await apiClient.post<string>(
        API_ENDPOINTS.AUTH.ADMIN_CLEAR_ALL_ASSIGNMENTS,
        {},
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Admin clear all assignments failed:', error);
      throw error;
    }
  }

   /**
    * Move paid shipments to warehouse (admin only)
    */
   async moveShipmentsToWarehouse(): Promise<ApiSuccessResponse<string>> {
     try {
       const response = await apiClient.post<string>(
         API_ENDPOINTS.SHIPMENTS.ADMIN_MOVE_TO_WAREHOUSE,
         {},
         { requiresAuth: true }
       );
       
       return response;
     } catch (error) {
       console.error('Admin move shipments to warehouse failed:', error);
       throw error;
     }
   }

   /**
    * List paid shipments awaiting warehouse intake (admin only).
    *
    * Backs the admin warehouse page so an operator can review and
    * promote each paid shipment individually instead of using the bulk
    * ``moveShipmentsToWarehouse`` action.
    */
   async listPaidShipments(
     params: AdminListPaidShipmentsParams = {}
   ): Promise<ApiSuccessResponse<AdminPaidShipmentsResponse>> {
     try {
       const { page = 1, per_page = 25 } = params;

       const response = await apiClient.get<AdminPaidShipmentsResponse>(
         API_ENDPOINTS.SHIPMENTS.ADMIN_LIST_PAID,
         { page, per_page },
         { requiresAuth: true }
       );

       return response;
     } catch (error) {
       console.error('Admin list paid shipments failed:', error);
       throw error;
     }
   }

   /**
    * List IN_WAREHOUSE shipments without a driver assignment (admin only).
    * Backs the manual assignment dropdown (up to 100 results).
    */
   async listAssignableShipments(): Promise<ApiSuccessResponse<AdminAssignableShipmentsResponse>> {
     try {
       const response = await apiClient.get<AdminAssignableShipmentsResponse>(
         API_ENDPOINTS.SHIPMENTS.ADMIN_LIST_ASSIGNABLE,
         {},
         { requiresAuth: true }
       );

       return response;
     } catch (error) {
       console.error('Admin list assignable shipments failed:', error);
       throw error;
     }
   }

   /**
    * Move a single paid shipment to warehouse by ID (admin only).
    */
   async moveSingleShipmentToWarehouse(
     shipmentId: number
   ): Promise<ApiSuccessResponse<AdminMoveSingleToWarehouseResponse>> {
     try {
       const url = API_ENDPOINTS.SHIPMENTS.ADMIN_MOVE_SINGLE_TO_WAREHOUSE.replace(
         ':shipment_id',
         shipmentId.toString()
       );

       const response = await apiClient.post<AdminMoveSingleToWarehouseResponse>(
         url,
         {},
         { requiresAuth: true }
       );

       return response;
     } catch (error) {
       console.error('Admin move single shipment to warehouse failed:', error);
       throw error;
     }
   }

   /**
    * Get driver statistics by ID (admin only)
    */
   async getDriverStatistics(
     driverId: number,
     params?: StatisticsParams
   ): Promise<ApiSuccessResponse<DriverStatisticsResponse>> {
     try {
       // Replace :driver_id placeholder in the URL
       const url = API_ENDPOINTS.STATS.ADMIN_DRIVER_STATS.replace(':driver_id', driverId.toString());
       
      const response = await apiClient.get<DriverStatisticsResponse>(
        url,
        params,
        { requiresAuth: true }
      );
       
       return response;
     } catch (error) {
       console.error('Admin get driver statistics failed:', error);
       throw error;
     }
   }

   /**
    * Get user statistics by ID (admin only)
    */
   async getUserStatistics(
     userId: number,
     params?: StatisticsParams
   ): Promise<ApiSuccessResponse<UserStatisticsResponse>> {
     try {
       // Replace :user_id placeholder in the URL
       const url = API_ENDPOINTS.STATS.ADMIN_USER_STATS.replace(':user_id', userId.toString());
       
      const response = await apiClient.get<UserStatisticsResponse>(
        url,
        params,
        { requiresAuth: true }
      );
       
       return response;
     } catch (error) {
       console.error('Admin get user statistics failed:', error);
       throw error;
     }
   }

   /**
    * Get comprehensive admin statistics for all shipments (admin only)
    */
   async getAdminStatistics(
     params?: AdminStatisticsParams
   ): Promise<ApiSuccessResponse<AdminStatisticsResponse>> {
     try {
      const response = await apiClient.get<AdminStatisticsResponse>(
        API_ENDPOINTS.STATS.ADMIN_STATS,
        params,
        { requiresAuth: true }
      );
       
       return response;
     } catch (error) {
       console.error('Admin get statistics failed:', error);
       throw error;
     }
   }

   /**
    * Get current user statistics including delivered, in transit, and unfulfilled shipments
    */
   async getCurrentUserStatistics(
     params?: StatisticsParams
   ): Promise<ApiSuccessResponse<UserStatisticsResponse>> {
     try {
       // Check if user is authenticated before making the request
       if (typeof window !== 'undefined') {
         const token = localStorage.getItem('auth_token');
         if (!token) {
           throw {
             error: 'API Error',
             message: 'Authentication required',
             status: 401,
             details: 'Not authenticated'
           };
         }
       }

      const response = await apiClient.get<UserStatisticsResponse>(
        API_ENDPOINTS.STATS.USER_STATS,
        params,
        { requiresAuth: true }
      );
       
       return response;
     } catch (error: any) {
       console.error('Get current user statistics failed:', error);
       
       // Handle ApiErrorResponse structure (from apiClient)
       const status = error.status || error.response?.status;
       
       if (status === 401 || status === 403) {
         // Clear invalid token
         if (typeof window !== 'undefined') {
           localStorage.removeItem('auth_token');
         }
         throw {
           error: error.error || 'API Error',
           message: error.message || 'Authentication required',
           status: status,
           details: error.details || 'Not authenticated'
         };
       }
       
       throw error;
     }
   }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;