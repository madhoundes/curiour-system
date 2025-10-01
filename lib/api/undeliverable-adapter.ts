import { UndeliverablePackage as ApiUndeliverablePackage, UndeliverableStats as ApiUndeliverableStats } from './undeliverable';
import { UndeliverablePackage as UIUndeliverablePackage, Status, Recipient, Sender, PackageDetails } from '@/lib/mock/undeliverable';

/**
 * Maps API shipment status to UI status
 */
export function mapApiStatusToUIStatus(apiStatus: string): Status {
  // For undeliverable packages, we'll categorize them based on how long they've been undelivered
  // This is a simplified mapping - in a real system, you might have additional status fields
  switch (apiStatus) {
    case 'UNDELIVERED':
      return 'pending'; // Default to pending for newly undelivered packages
    case 'IN_TRANSIT':
      return 'in_progress'; // Package is being redelivered
    case 'DELIVERED':
      return 'resolved'; // Successfully delivered
    case 'CANCELLED':
      return 'resolved'; // Cancelled packages are considered resolved
    default:
      return 'pending';
  }
}

/**
 * Determines priority based on package characteristics and duration
 */
export function determinePriority(
  daysUndelivered: number = 0,
  isFragile: boolean = false,
  isValuable: boolean = false,
  hasInsurance: boolean = false
): 'high' | 'medium' | 'low' {
  // High priority: valuable/insured items, fragile items, or packages undelivered for more than 3 days
  if (isValuable || hasInsurance || (isFragile && daysUndelivered > 1) || daysUndelivered > 3) {
    return 'high';
  }
  
  // Medium priority: fragile items or packages undelivered for more than 1 day
  if (isFragile || daysUndelivered > 1) {
    return 'medium';
  }
  
  // Low priority: everything else
  return 'low';
}

/**
 * Generates issue type based on package status and characteristics
 */
export function generateIssueType(
  status: string,
  daysUndelivered: number = 0,
  isFragile: boolean = false
): string {
  const issueTypes = [
    'Address Not Found',
    'Recipient Unavailable',
    'No Access to Building',
    'Business Hours',
    'Weather Delay',
    'Damaged Package',
    'Temperature Control',
    'Campus Delivery'
  ];

  // For demo purposes, we'll assign issue types based on some logic
  // In a real system, this would come from the API or be determined by business rules
  if (isFragile && daysUndelivered > 2) {
    return 'Damaged Package';
  } else if (daysUndelivered > 5) {
    return 'Address Not Found';
  } else if (daysUndelivered > 3) {
    return 'Recipient Unavailable';
  } else if (daysUndelivered > 1) {
    return 'No Access to Building';
  } else {
    return 'Business Hours';
  }
}

/**
 * Generates issue description based on issue type and package details
 */
export function generateIssueDescription(issueType: string, trackingCode: string): string {
  const descriptions: Record<string, string> = {
    'Address Not Found': `The delivery address provided for package ${trackingCode} does not exist or cannot be located.`,
    'Recipient Unavailable': `Recipient is unavailable to receive package ${trackingCode}. Multiple delivery attempts have been unsuccessful.`,
    'No Access to Building': `Courier cannot access the building to deliver package ${trackingCode}. No access code provided or building security restrictions.`,
    'Business Hours': `Package ${trackingCode} arrived outside of business hours. Recipient location is closed and no one available to receive delivery.`,
    'Weather Delay': `Severe weather conditions preventing delivery of package ${trackingCode}. Roads are impassable or unsafe for delivery.`,
    'Damaged Package': `Package ${trackingCode} appears to be damaged during transit. Contents may be compromised and require inspection.`,
    'Temperature Control': `Package ${trackingCode} requires special temperature control that cannot be maintained at the delivery location.`,
    'Campus Delivery': `Package ${trackingCode} cannot be delivered to campus address. Specific building and room number required for delivery.`
  };

  return descriptions[issueType] || `Delivery issue with package ${trackingCode}. Please contact customer service for details.`;
}

/**
 * Transforms API UndeliverablePackage to UI UndeliverablePackage format
 */
export function transformApiPackageToUI(apiPackage: ApiUndeliverablePackage): UIUndeliverablePackage {
  const daysUndelivered = apiPackage.daysUndelivered || 0;
  const isFragile = apiPackage.package.fragile;
  const isValuable = apiPackage.package.declared_value > 500; // Consider valuable if declared value > $500
  const hasInsurance = isValuable; // Assume insurance for valuable items
  
  const priority = determinePriority(daysUndelivered, isFragile, isValuable, hasInsurance);
  const issueType = generateIssueType(apiPackage.status, daysUndelivered, isFragile);
  const issueDescription = generateIssueDescription(issueType, apiPackage.tracking_code);

  // Transform sender information
  const sender: Sender = {
    name: apiPackage.sender_address.contact_name,
    address: `${apiPackage.sender_address.street_address}${apiPackage.sender_address.street_address_2 ? ', ' + apiPackage.sender_address.street_address_2 : ''}, ${apiPackage.sender_address.city}, ${apiPackage.sender_address.province} ${apiPackage.sender_address.postal_code}`,
    company: apiPackage.sender_address.company_name,
    contact: {
      phone: apiPackage.sender_address.phone_number,
      email: apiPackage.sender_address.email
    }
  };

  // Transform recipient information
  const recipient: Recipient = {
    name: apiPackage.receiver_address.contact_name,
    address: `${apiPackage.receiver_address.street_address}${apiPackage.receiver_address.street_address_2 ? ', ' + apiPackage.receiver_address.street_address_2 : ''}, ${apiPackage.receiver_address.city}, ${apiPackage.receiver_address.province} ${apiPackage.receiver_address.postal_code}`,
    company: apiPackage.receiver_address.company_name,
    contact: {
      phone: apiPackage.receiver_address.phone_number,
      email: apiPackage.receiver_address.email
    }
  };

  // Transform package details
  const packageDetails: PackageDetails = {
    type: apiPackage.package.contents_description || 'General Package',
    weight: apiPackage.package.weight,
    weightUnit: 'kg', // API uses kg
    dimensions: {
      length: apiPackage.package.length,
      width: apiPackage.package.width,
      height: apiPackage.package.height,
      unit: 'cm' // API uses cm
    },
    fragile: apiPackage.package.fragile,
    valuable: isValuable,
    insurance: hasInsurance,
    insuranceAmount: hasInsurance ? apiPackage.package.declared_value : undefined
  };

  // Determine UI status based on API status and duration
  let uiStatus: Status = 'pending';
  if (apiPackage.status === 'DELIVERED' || apiPackage.status === 'CANCELLED') {
    uiStatus = 'resolved';
  } else if (daysUndelivered > 1) {
    uiStatus = 'in_progress';
  }

  return {
    id: apiPackage.id.toString(),
    trackingNumber: apiPackage.tracking_code,
    sender,
    recipient,
    packageDetails,
    issueType,
    issueDescription,
    priority,
    status: uiStatus,
    notes: apiPackage.special_instructions || apiPackage.delivery_notes,
    reportedBy: `System - Package Tracking`, // Since we don't have this info from API
    reportedAt: apiPackage.lastAttemptDate || apiPackage.updated_at,
    createdAt: apiPackage.created_at,
    updatedAt: apiPackage.updated_at,
    estimatedResolution: apiPackage.estimated_delivery_date,
    courierNotes: `Package has been undelivered for ${daysUndelivered} day(s). Last status update: ${apiPackage.updated_at}`,
    customerContactAttempts: 0, // We don't have this info from API
    lastContactAttempt: apiPackage.lastAttemptDate
  };
}

/**
 * Transforms API stats to UI stats format
 */
export function transformApiStatsToUI(apiStats: ApiUndeliverableStats): {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
} {
  return {
    total: apiStats.totalIssues,
    pending: apiStats.pendingReview,
    inProgress: apiStats.inProgress,
    resolved: apiStats.resolved
  };
}

/**
 * Maps UI status back to API status for updates
 */
export function mapUIStatusToApiStatus(uiStatus: Status): 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' {
  switch (uiStatus) {
    case 'in_progress':
      return 'IN_TRANSIT';
    case 'resolved':
      return 'DELIVERED';
    default:
      return 'IN_TRANSIT'; // Default to in transit for pending items
  }
}

/**
 * Generates appropriate change reason based on status transition
 */
export function generateChangeReason(fromStatus: Status, toStatus: Status): string {
  const transitions: Record<string, string> = {
    'pending_to_in_progress': 'Issue being actively resolved - redelivery scheduled',
    'pending_to_resolved': 'Issue resolved - package successfully delivered',
    'in_progress_to_resolved': 'Redelivery successful - package delivered to recipient',
    'in_progress_to_pending': 'Redelivery attempt failed - issue requires further investigation',
    'resolved_to_in_progress': 'Issue reopened - additional delivery attempt required',
    'resolved_to_pending': 'Issue reopened - requires review and investigation'
  };

  const transitionKey = `${fromStatus}_to_${toStatus}`;
  return transitions[transitionKey] || `Status updated from ${fromStatus} to ${toStatus}`;
}

/**
 * Transforms an array of API packages to UI format
 */
export function transformUndeliverablePackages(apiPackages: ApiUndeliverablePackage[]): UIUndeliverablePackage[] {
  return apiPackages.map(transformApiPackageToUI);
}

/**
 * Transforms API stats to UI stats format (alias for transformApiStatsToUI)
 */
export function transformUndeliverableStats(apiStats: ApiUndeliverableStats): {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
} {
  return transformApiStatsToUI(apiStats);
}