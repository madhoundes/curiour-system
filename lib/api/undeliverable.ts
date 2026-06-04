import { apiClient } from './client';
import { shippingService } from './shipping';
import { 
  DetailedShipment, 
  ShipmentsListResponse, 
  UpdateShipmentStatusRequest,
  ShipmentStatusChange,
  ShipmentsByStatusDurationParams,
  ShipmentByStatusDurationItem,
  ShipmentStatus
} from './types';

export interface UndeliverablePackage extends DetailedShipment {
  // Additional computed fields for undeliverable packages
  daysUndelivered?: number;
  lastAttemptDate?: string;
  attemptCount?: number;
}

export interface UndeliverableStats {
  totalIssues: number;
  pendingReview: number;
  inProgress: number;
  resolved: number;
}

export interface GetUndeliverablePackagesParams {
  page?: number;
  per_page?: number;
  min_duration_hours?: number;
  max_duration_hours?: number;
  sort_by?: 'duration' | 'created_at' | 'tracking_code';
  sort_order?: 'asc' | 'desc';
}

export interface UndeliverablePackagesResponse {
  packages: UndeliverablePackage[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  stats: UndeliverableStats;
}

export interface UpdateUndeliverableStatusRequest {
  status: 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  change_reason: string;
  notes?: string;
  resolution_type?: 'redelivery_scheduled' | 'customer_pickup' | 'returned_to_sender' | 'address_corrected';
}

export class UndeliverableService {
  private apiClient: typeof apiClient;
  private shippingService: typeof shippingService;
  
  constructor(client: typeof apiClient = apiClient, shipping: typeof shippingService = shippingService) {
    this.apiClient = client;
    this.shippingService = shipping;
  }

  /**
   * Get all undeliverable packages with filtering and pagination
   */
  async getUndeliverablePackages(params: GetUndeliverablePackagesParams = {}): Promise<UndeliverablePackagesResponse> {
    try {
      // Use the GET /shipments endpoint with status filter. We over-fetch
      // here so the duration filter has enough candidates to work with –
      // the backend caps ``per_page`` at 100.
      const shipmentParams = {
        status: 'UNDELIVERED',
        page: 1,
        per_page: Math.min(params.per_page || 100, 100),
      };

      // Get undelivered shipments using the shipping service
      const undeliveredShipments = await this.shippingService.getShipments(shipmentParams);

      // Convert to UndeliverablePackage format and apply duration filtering
      const detailedPackages: UndeliverablePackage[] = [];
      const minDurationHours = params.min_duration_hours || 72; // Default to packages undelivered for at least 72 hours (3 days)
      
      for (const shipment of undeliveredShipments) {
        try {
          // Calculate how long the package has been undelivered
          const currentTime = new Date();
          let undeliveredSince: Date;
          
          try {
            // Try to get status history to find when it became undelivered
            const statusHistory = await this.shippingService.getShipmentStatusHistory(shipment.id);
            const undeliveredEntry = statusHistory
              .filter((entry: ShipmentStatusChange) => entry.status === 'UNDELIVERED')
              .sort((a: ShipmentStatusChange, b: ShipmentStatusChange) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0];
            
            undeliveredSince = undeliveredEntry ? new Date(undeliveredEntry.created_at) : new Date(shipment.created_at);
          } catch (statusError) {
            // Fallback to created_at if status history is not available
            console.warn(`Could not fetch status history for shipment ${shipment.id}, using created_at as fallback`);
            undeliveredSince = new Date(shipment.created_at);
          }

          const durationHours = (currentTime.getTime() - undeliveredSince.getTime()) / (1000 * 60 * 60);
          
          // Apply duration filter - only consider packages that have been undelivered for a significant time
          // This prevents recently marked UNDELIVERED packages from being considered problematic
          if (durationHours >= minDurationHours) {
            // Apply max duration filter if specified
            if (params.max_duration_hours && durationHours > params.max_duration_hours) {
              continue;
            }

            // Additional business logic: Check if this is truly an undeliverable package
            // A package is considered undeliverable if:
            // 1. It has been in UNDELIVERED status for the minimum duration
            // 2. It's not a recent status change (handled by duration check above)
            const isActuallyUndeliverable = durationHours >= minDurationHours;
            
            if (isActuallyUndeliverable) {
              const undeliverablePackage: UndeliverablePackage = {
                ...shipment,
                daysUndelivered: Math.floor(durationHours / 24),
                lastAttemptDate: undeliveredSince.toISOString(),
                // Note: attemptCount would need to be calculated from status history if needed
              };

              detailedPackages.push(undeliverablePackage);
            }
          }
        } catch (error) {
          console.warn(`Failed to process shipment ${shipment.id}:`, error);
        }
      }

      // Sort packages if requested
      if (params.sort_by) {
        detailedPackages.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (params.sort_by) {
            case 'duration':
              aValue = a.daysUndelivered || 0;
              bValue = b.daysUndelivered || 0;
              break;
            case 'created_at':
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
              break;
            case 'tracking_code':
              aValue = a.tracking_code;
              bValue = b.tracking_code;
              break;
            default:
              return 0;
          }

          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return params.sort_order === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const per_page = params.per_page || 20;
      const startIndex = (page - 1) * per_page;
      const endIndex = startIndex + per_page;
      const paginatedPackages = detailedPackages.slice(startIndex, endIndex);

      // Calculate stats
      const stats = this.calculateUndeliverableStats(detailedPackages);

      return {
        packages: paginatedPackages,
        total: detailedPackages.length,
        page,
        per_page,
        total_pages: Math.ceil(detailedPackages.length / per_page),
        stats
      };

    } catch (error) {
      console.error('Error fetching undeliverable packages:', error);
      throw error;
    }
  }

  /**
   * Update the status of an undeliverable package
   */
  async updateUndeliverableStatus(
    shipmentId: number, 
    updateRequest: UpdateUndeliverableStatusRequest
  ): Promise<ShipmentStatusChange> {
    try {
      const statusUpdateRequest: UpdateShipmentStatusRequest = {
        status: updateRequest.status,
        change_reason: updateRequest.change_reason,
        notes: updateRequest.notes
      };

      const response = await this.shippingService.updateShipmentStatus(
        shipmentId,
        statusUpdateRequest
      );

      return response;
    } catch (error) {
      console.error(`Error updating status for shipment ${shipmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get status history for an undeliverable package
   */
  async getUndeliverableStatusHistory(shipmentId: number): Promise<ShipmentStatusChange[]> {
    try {
      const response = await this.shippingService.getShipmentStatusHistory(shipmentId);

      return response;
    } catch (error) {
      console.error(`Error fetching status history for shipment ${shipmentId}:`, error);
      throw error;
    }
  }

  /**
   * Search undeliverable packages by tracking number, recipient, or address
   */
  async searchUndeliverablePackages(query: string): Promise<UndeliverablePackage[]> {
    try {
      // First get all undeliverable packages
      const allPackages = await this.getUndeliverablePackages({ per_page: 1000 });
      
      // Filter based on search query
      const filteredPackages = allPackages.packages.filter(pkg => {
        const searchTerm = query.toLowerCase();
        return (
          pkg.tracking_code.toLowerCase().includes(searchTerm) ||
          pkg.receiver_address.contact_name.toLowerCase().includes(searchTerm) ||
          pkg.receiver_address.company_name?.toLowerCase().includes(searchTerm) ||
          pkg.receiver_address.street_address.toLowerCase().includes(searchTerm) ||
          pkg.receiver_address.city.toLowerCase().includes(searchTerm) ||
          pkg.receiver_address.postal_code.toLowerCase().includes(searchTerm)
        );
      });

      return filteredPackages;
    } catch (error) {
      console.error('Error searching undeliverable packages:', error);
      throw error;
    }
  }

  /**
   * Get a single undeliverable package by ID
   */
  async getUndeliverablePackage(shipmentId: number): Promise<UndeliverablePackage | null> {
    try {
      const shipment = await this.shippingService.getShipment(shipmentId);
      
      // Only return if it's actually undelivered
      if (shipment.status !== 'UNDELIVERED') {
        return null;
      }

      // Get duration information using the shipping service
      const statusParams: ShipmentsByStatusDurationParams = {
        status: 'UNDELIVERED',
        limit: 1000 // Get all to find this specific shipment
      };

      const durationResponse = await this.shippingService.getShipmentsByStatusDuration(statusParams);
      const durationItem = durationResponse.find((item: ShipmentByStatusDurationItem) => item.shipment_id === shipmentId);

      const undeliverablePackage: UndeliverablePackage = {
        ...shipment,
        daysUndelivered: durationItem ? Math.floor(durationItem.duration_hours / 24) : 0,
        lastAttemptDate: durationItem?.entered_at,
      };

      return undeliverablePackage;
    } catch (error) {
      console.error(`Error fetching undeliverable package ${shipmentId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate statistics for undeliverable packages
   */
  private calculateUndeliverableStats(packages: UndeliverablePackage[]): UndeliverableStats {
    const stats: UndeliverableStats = {
      totalIssues: packages.length,
      pendingReview: 0,
      inProgress: 0,
      resolved: 0
    };

    // For now, we'll categorize based on how long they've been undelivered
    // This is a simplified categorization - in a real system, you might have
    // additional status fields to track the resolution process
    packages.forEach(pkg => {
      const daysUndelivered = pkg.daysUndelivered || 0;
      
      if (daysUndelivered <= 1) {
        stats.pendingReview++;
      } else if (daysUndelivered <= 7) {
        stats.inProgress++;
      } else {
        // Packages undelivered for more than 7 days might need special attention
        stats.pendingReview++;
      }
    });

    return stats;
  }

  /**
   * Bulk update multiple undeliverable packages
   */
  async bulkUpdateUndeliverableStatus(
    shipmentIds: number[],
    updateRequest: UpdateUndeliverableStatusRequest
  ): Promise<{ successful: number; failed: number; errors: Array<{ shipmentId: number; error: string }> }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ shipmentId: number; error: string }>
    };

    for (const shipmentId of shipmentIds) {
      try {
        await this.updateUndeliverableStatus(shipmentId, updateRequest);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          shipmentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}