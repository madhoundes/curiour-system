import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type {
  NotificationUnsubscribeRequest,
  NotificationUnsubscribeResponse,
  NotificationResubscribeRequest,
  NotificationResubscribeResponse,
  NotificationStatusResponse,
} from './types';

export class NotificationService {
  /**
   * Unsubscribe an email address from receiving delivery notifications
   */
  async unsubscribeEmail(data: NotificationUnsubscribeRequest): Promise<NotificationUnsubscribeResponse> {
    try {
      const response = await apiClient.post<NotificationUnsubscribeResponse>(
        API_ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to unsubscribe email:', error);
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe from notifications');
    }
  }

  /**
   * Resubscribe an email address to receive delivery notifications
   */
  async resubscribeEmail(data: NotificationResubscribeRequest): Promise<NotificationResubscribeResponse> {
    try {
      const response = await apiClient.post<NotificationResubscribeResponse>(
        API_ENDPOINTS.NOTIFICATIONS.RESUBSCRIBE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to resubscribe email:', error);
      throw new Error(error.response?.data?.message || 'Failed to resubscribe to notifications');
    }
  }

  /**
   * Check if an email address is subscribed to notifications
   */
  async getSubscriptionStatus(email: string): Promise<NotificationStatusResponse> {
    try {
      const response = await apiClient.get<NotificationStatusResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS.STATUS}?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get subscription status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get subscription status');
    }
  }
}

export const notificationService = new NotificationService();
