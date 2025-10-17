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
  User,
  AssignmentsResponse,
  AssignmentStatisticsResponse,
  ReassignAssignmentRequest,
  ReassignAssignmentResponse,
  ManualAssignmentRequest,
  ManualAssignmentResponse,
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
         { 
           requiresAuth: true,
           params: params
         }
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
         { 
           requiresAuth: true,
           params: params
         }
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
         { 
           requiresAuth: true,
           params: params
         }
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
       const response = await apiClient.get<UserStatisticsResponse>(
         API_ENDPOINTS.STATS.USER_STATS,
         { 
           requiresAuth: true,
           params: params
         }
       );
       
       return response;
     } catch (error) {
       console.error('Get current user statistics failed:', error);
       throw error;
     }
   }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;