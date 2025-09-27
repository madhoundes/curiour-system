/**
 * Contact API Service
 * Handles all contact-related API calls for support messages and contact information
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  SendContactMessageRequest,
  SendContactMessageResponse,
  ContactInfoResponse
} from './types';

export class ContactService {
  /**
   * Send a contact message to Parcego support team
   */
  async sendMessage(messageData: SendContactMessageRequest): Promise<SendContactMessageResponse> {
    try {
      if (!messageData.message || messageData.message.trim().length === 0) {
        throw new Error('Message content is required');
      }

      if (!messageData.subject || messageData.subject.trim().length === 0) {
        throw new Error('Subject is required');
      }

      if (!messageData.priority) {
        throw new Error('Priority is required');
      }

      const response = await apiClient.post<SendContactMessageResponse>(
        API_ENDPOINTS.CONTACT.SEND_MESSAGE,
        messageData
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid request data');
      }
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      }
      if (error.response?.status === 403) {
        throw new Error('User or driver role required');
      }
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      if (error.response?.status === 500) {
        throw new Error('Failed to send message. Please try again later.');
      }
      
      console.error('Contact message send error:', error);
      throw new Error('Failed to send contact message');
    }
  }

  /**
   * Get contact information and support details
   */
  async getContactInfo(): Promise<ContactInfoResponse> {
    try {
      const response = await apiClient.get<ContactInfoResponse>(
        API_ENDPOINTS.CONTACT.GET_INFO
      );

      return response.data;
    } catch (error: any) {
      console.error('Get contact info error:', error);
      throw new Error('Failed to retrieve contact information');
    }
  }

  /**
   * Validate message content
   */
  validateMessage(message: string): boolean {
    return !!(message && message.trim().length > 0 && message.trim().length <= 5000);
  }

  /**
   * Validate subject
   */
  validateSubject(subject: string): boolean {
    return !!(subject && subject.trim().length > 0 && subject.trim().length <= 200);
  }

  /**
   * Validate priority
   */
  validatePriority(priority: string): boolean {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    return validPriorities.includes(priority);
  }

  /**
   * Get priority display text
   */
  getPriorityDisplay(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'Low Priority',
      'normal': 'Normal Priority',
      'high': 'High Priority',
      'urgent': 'Urgent'
    };
    return priorityMap[priority] || 'Unknown Priority';
  }

  /**
   * Format contact message for display
   */
  formatMessagePreview(message: string, maxLength: number = 100): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '...';
  }
}

export const contactService = new ContactService();