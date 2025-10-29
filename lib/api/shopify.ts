/**
 * Shopify OAuth API Service
 * Handles all Shopify OAuth-related API calls
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  ShopifyInstallParams, 
  ShopifyInstallResponse,
  ShopifyCallbackParams,
  ShopifyCallbackResponse,
  ShopifyDisconnectResponse,
  ShopifyAccountsResponse,
  ShopifyAccountDetails,
  ShopifySyncResponse,
  ShopifyOrdersParams,
  ShopifyOrdersResponse,
  ShopifyStatsResponse,
  ShopifyAdminAccountsParams,
  ShopifyAdminPollResponse,
  ShopifyAdminRetryResponse,
  ShopifyAdminSchedulerStatusResponse,
  ShopifyDashboardSummaryResponse,
  ShopifyActivityParams,
  ShopifyActivityResponse,
  ShopifyAlertsResponse,
  ShopifyQuickStatsResponse,
  ShopifyErrorMetricsParams,
  ShopifyErrorMetricsResponse,
  ShopifyStoreHealthResponse,
  ShopifyErrorTrendsParams,
  ShopifyErrorTrendsResponse,
  ShopifyCriticalAlertsResponse,
  ShopifyHealthSummaryResponse,
  ShopifyWebhookOrderCreateResponse,
  ShopifyWebhookTestResponse,
  ApiSuccessResponse
} from './types';

export class ShopifyService {
  /**
   * Redirect unauthenticated Shopify users to frontend login
   * 
   * GET /shopify/auth/install?shop={shop}
   * Returns: redirect URL to login page with query params preserved
   */
  async install(params: ShopifyInstallParams): Promise<ApiSuccessResponse<string>> {
    try {
      const response = await apiClient.get<string>(
        API_ENDPOINTS.SHOPIFY.INSTALL,
        { shop: params.shop },
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Shopify install redirect failed:', error);
      throw error;
    }
  }

  /**
   * Initiate Shopify OAuth flow for authenticated users
   * 
   * GET /shopify/auth/install-authenticated?shop={shop}
   * Returns: redirect URL to Shopify authorization page
   */
  async installAuthenticated(params: ShopifyInstallParams): Promise<ApiSuccessResponse<ShopifyInstallResponse>> {
    try {
      const response = await apiClient.get<ShopifyInstallResponse>(
        API_ENDPOINTS.SHOPIFY.INSTALL_AUTHENTICATED,
        { shop: params.shop },
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Shopify OAuth initiation failed:', error);
      throw error;
    }
  }

  /**
   * Handle Shopify OAuth callback
   * 
   * GET /shopify/auth/callback?code={code}&state={state}&shop={shop}
   * Returns: success response with connection details
   */
  async callback(params: ShopifyCallbackParams): Promise<ApiSuccessResponse<ShopifyCallbackResponse>> {
    try {
      const callbackParams: Record<string, string> = {};
      if (params.code) callbackParams.code = params.code;
      if (params.state) callbackParams.state = params.state;
      if (params.shop) callbackParams.shop = params.shop;
      if (params.error) callbackParams.error = params.error;

      const response = await apiClient.get<ShopifyCallbackResponse>(
        API_ENDPOINTS.SHOPIFY.CALLBACK,
        callbackParams,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Shopify OAuth callback failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect Shopify store
   * 
   * DELETE /shopify/auth/disconnect/{account_id}
   * Returns: success response
   */
  async disconnect(accountId: number): Promise<ApiSuccessResponse<ShopifyDisconnectResponse>> {
    try {
      const endpoint = API_ENDPOINTS.SHOPIFY.DISCONNECT.replace(':account_id', accountId.toString());
      const response = await apiClient.delete<ShopifyDisconnectResponse>(
        endpoint,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Shopify disconnect failed:', error);
      throw error;
    }
  }

  /**
   * List connected Shopify stores
   * 
   * GET /shopify/accounts
   * Returns: List of connected stores
   */
  async getAccounts(): Promise<ApiSuccessResponse<ShopifyAccountsResponse>> {
    try {
      const response = await apiClient.get<ShopifyAccountsResponse>(
        API_ENDPOINTS.SHOPIFY.ACCOUNTS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify accounts:', error);
      throw error;
    }
  }

  /**
   * Get Shopify store details
   * 
   * GET /shopify/accounts/{account_id}
   * Returns: Store details
   */
  async getAccountDetails(accountId: number): Promise<ApiSuccessResponse<ShopifyAccountDetails>> {
    try {
      const endpoint = API_ENDPOINTS.SHOPIFY.ACCOUNT_DETAILS.replace(':account_id', accountId.toString());
      const response = await apiClient.get<ShopifyAccountDetails>(
        endpoint,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify account details:', error);
      throw error;
    }
  }

  /**
   * Sync Shopify store
   * 
   * POST /shopify/accounts/{account_id}/sync
   * Returns: Sync completion response
   */
  async syncAccount(accountId: number): Promise<ApiSuccessResponse<ShopifySyncResponse>> {
    try {
      const endpoint = API_ENDPOINTS.SHOPIFY.ACCOUNT_SYNC.replace(':account_id', accountId.toString());
      const response = await apiClient.post<ShopifySyncResponse>(
        endpoint,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Shopify sync failed:', error);
      throw error;
    }
  }

  /**
   * List Shopify orders
   * 
   * GET /shopify/orders
   * Returns: List of orders with optional filtering
   */
  async getOrders(params?: ShopifyOrdersParams): Promise<ApiSuccessResponse<ShopifyOrdersResponse>> {
    try {
      const response = await apiClient.get<ShopifyOrdersResponse>(
        API_ENDPOINTS.SHOPIFY.ORDERS,
        params,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify orders:', error);
      throw error;
    }
  }

  /**
   * Get Shopify integration statistics
   * 
   * GET /shopify/stats
   * Returns: Statistics about Shopify integration
   */
  async getStats(): Promise<ApiSuccessResponse<ShopifyStatsResponse>> {
    try {
      const response = await apiClient.get<ShopifyStatsResponse>(
        API_ENDPOINTS.SHOPIFY.STATS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify stats:', error);
      throw error;
    }
  }

  /**
   * Get Shopify integration dashboard summary
   * 
   * GET /shopify/dashboard/summary
   * Returns: Comprehensive dashboard summary
   */
  async getDashboardSummary(): Promise<ApiSuccessResponse<ShopifyDashboardSummaryResponse>> {
    try {
      const response = await apiClient.get<ShopifyDashboardSummaryResponse>(
        API_ENDPOINTS.SHOPIFY.DASHBOARD_SUMMARY,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get recent Shopify activity feed
   * 
   * GET /shopify/dashboard/activity
   * Returns: Recent order processing activity with pagination
   */
  async getDashboardActivity(params?: ShopifyActivityParams): Promise<ApiSuccessResponse<ShopifyActivityResponse>> {
    try {
      const response = await apiClient.get<ShopifyActivityResponse>(
        API_ENDPOINTS.SHOPIFY.DASHBOARD_ACTIVITY,
        params,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify dashboard activity:', error);
      throw error;
    }
  }

  /**
   * Get Shopify integration alerts
   * 
   * GET /shopify/dashboard/alerts
   * Returns: Current alerts and issues that need attention
   */
  async getDashboardAlerts(): Promise<ApiSuccessResponse<ShopifyAlertsResponse>> {
    try {
      const response = await apiClient.get<ShopifyAlertsResponse>(
        API_ENDPOINTS.SHOPIFY.DASHBOARD_ALERTS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify dashboard alerts:', error);
      throw error;
    }
  }

  /**
   * Get quick stats for widgets
   * 
   * GET /shopify/dashboard/quick-stats
   * Returns: Lightweight stats for dashboard widgets
   */
  async getDashboardQuickStats(): Promise<ApiSuccessResponse<ShopifyQuickStatsResponse>> {
    try {
      const response = await apiClient.get<ShopifyQuickStatsResponse>(
        API_ENDPOINTS.SHOPIFY.DASHBOARD_QUICK_STATS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify dashboard quick stats:', error);
      throw error;
    }
  }

  /**
   * Get error metrics (Admin only)
   * 
   * GET /shopify/monitoring/errors/metrics
   * Returns: Comprehensive error metrics and analytics
   */
  async getErrorMetrics(params?: ShopifyErrorMetricsParams): Promise<ApiSuccessResponse<ShopifyErrorMetricsResponse>> {
    try {
      const response = await apiClient.get<ShopifyErrorMetricsResponse>(
        API_ENDPOINTS.SHOPIFY.MONITORING_ERROR_METRICS,
        params,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify error metrics:', error);
      throw error;
    }
  }

  /**
   * Get store health metrics
   * 
   * GET /shopify/monitoring/health/stores
   * Returns: Health metrics for Shopify stores
   */
  async getStoreHealth(): Promise<ApiSuccessResponse<ShopifyStoreHealthResponse>> {
    try {
      const response = await apiClient.get<ShopifyStoreHealthResponse>(
        API_ENDPOINTS.SHOPIFY.MONITORING_STORE_HEALTH,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify store health:', error);
      throw error;
    }
  }

  /**
   * Get error trends (Admin only)
   * 
   * GET /shopify/monitoring/errors/trends
   * Returns: Error trends over time for analytics
   */
  async getErrorTrends(params?: ShopifyErrorTrendsParams): Promise<ApiSuccessResponse<ShopifyErrorTrendsResponse>> {
    try {
      const response = await apiClient.get<ShopifyErrorTrendsResponse>(
        API_ENDPOINTS.SHOPIFY.MONITORING_ERROR_TRENDS,
        params,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify error trends:', error);
      throw error;
    }
  }

  /**
   * Get critical alerts
   * 
   * GET /shopify/monitoring/alerts/critical
   * Returns: Critical alerts that need immediate attention
   */
  async getCriticalAlerts(): Promise<ApiSuccessResponse<ShopifyCriticalAlertsResponse>> {
    try {
      const response = await apiClient.get<ShopifyCriticalAlertsResponse>(
        API_ENDPOINTS.SHOPIFY.MONITORING_CRITICAL_ALERTS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify critical alerts:', error);
      throw error;
    }
  }

  /**
   * Get integration health summary
   * 
   * GET /shopify/monitoring/health/summary
   * Returns: Overall health summary of Shopify integration
   */
  async getHealthSummary(): Promise<ApiSuccessResponse<ShopifyHealthSummaryResponse>> {
    try {
      const response = await apiClient.get<ShopifyHealthSummaryResponse>(
        API_ENDPOINTS.SHOPIFY.MONITORING_HEALTH_SUMMARY,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify health summary:', error);
      throw error;
    }
  }

  /**
   * List all Shopify accounts (Admin only)
   * 
   * GET /shopify/admin/accounts
   * Returns: List of all accounts with optional filtering
   */
  async getAdminAccounts(params?: ShopifyAdminAccountsParams): Promise<ApiSuccessResponse<ShopifyAccountsResponse>> {
    try {
      const response = await apiClient.get<ShopifyAccountsResponse>(
        API_ENDPOINTS.SHOPIFY.ADMIN_ACCOUNTS,
        params,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch admin Shopify accounts:', error);
      throw error;
    }
  }

  /**
   * Trigger manual order polling (Admin only)
   * 
   * POST /shopify/admin/poll
   * Returns: Polling completion response
   */
  async triggerPolling(): Promise<ApiSuccessResponse<ShopifyAdminPollResponse>> {
    try {
      const response = await apiClient.post<ShopifyAdminPollResponse>(
        API_ENDPOINTS.SHOPIFY.ADMIN_POLL,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to trigger Shopify polling:', error);
      throw error;
    }
  }

  /**
   * Retry failed orders (Admin only)
   * 
   * POST /shopify/admin/retry-failed
   * Returns: Retry completion response
   */
  async retryFailedOrders(): Promise<ApiSuccessResponse<ShopifyAdminRetryResponse>> {
    try {
      const response = await apiClient.post<ShopifyAdminRetryResponse>(
        API_ENDPOINTS.SHOPIFY.ADMIN_RETRY_FAILED,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to retry failed Shopify orders:', error);
      throw error;
    }
  }

  /**
   * Get Shopify scheduler status (Admin only)
   * 
   * GET /shopify/admin/scheduler/status
   * Returns: Scheduler status information
   */
  async getSchedulerStatus(): Promise<ApiSuccessResponse<ShopifyAdminSchedulerStatusResponse>> {
    try {
      const response = await apiClient.get<ShopifyAdminSchedulerStatusResponse>(
        API_ENDPOINTS.SHOPIFY.ADMIN_SCHEDULER_STATUS,
        undefined,
        { requiresAuth: true }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to fetch Shopify scheduler status:', error);
      throw error;
    }
  }

  /**
   * Handle Shopify order creation webhook
   * 
   * POST /shopify/webhooks/orders/create
   * Returns: Webhook processing result
   * Note: This endpoint is called by Shopify directly and does not require authentication
   */
  async processOrderWebhook(webhookData: any): Promise<ApiSuccessResponse<ShopifyWebhookOrderCreateResponse>> {
    try {
      const response = await apiClient.post<ShopifyWebhookOrderCreateResponse>(
        API_ENDPOINTS.SHOPIFY.WEBHOOKS_ORDERS_CREATE,
        webhookData,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to process Shopify order webhook:', error);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   * 
   * GET /shopify/webhooks/test
   * Returns: Test response to verify webhook connectivity
   */
  async testWebhook(): Promise<ApiSuccessResponse<ShopifyWebhookTestResponse>> {
    try {
      const response = await apiClient.get<ShopifyWebhookTestResponse>(
        API_ENDPOINTS.SHOPIFY.WEBHOOKS_TEST,
        undefined,
        { requiresAuth: false }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to test Shopify webhook:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const shopifyService = new ShopifyService();
export default shopifyService;

