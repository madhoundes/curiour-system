// Admin Notification Types and Mock Data
export type NotificationPriority = 'high' | 'normal' | 'low';
export type NotificationType = 'merchants' | 'couriers' | 'global';
export type NotificationCategory = 
  | 'shopify_integration'
  | 'claim_submission'
  | 'shipment_exception'
  | 'merchant_registration'
  | 'payment_status'
  | 'integration_error'
  | 'payout_request'
  | 'document_expiration'
  | 'address_report'
  | 'security_alert'
  | 'system_update';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string; // ISO string
  relatedId?: string; // merchant ID, courier ID, shipment ID, etc.
  relatedType?: 'merchant' | 'courier' | 'shipment' | 'integration';
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: 'approve' | 'reject' | 'contact' | 'resolve' | 'view' | 'navigate';
    url?: string;
  }>;
  metadata?: Record<string, unknown>;
}

// Mock Notification Data
export const mockAdminNotifications: AdminNotification[] = [
  // Merchant Notifications
  {
    id: 'notif-001',
    type: 'merchants',
    category: 'shopify_integration',
    priority: 'high',
    status: 'unread',
    title: 'New Shopify Integration Request',
    message: 'TechGadgets Store has requested Shopify integration setup. Store URL: techgadgets-store.myshopify.com',
    timestamp: '2025-01-21T14:30:00Z',
    relatedId: 'M001',
    relatedType: 'merchant',
    actions: [
      { id: 'approve-shopify', label: 'Approve Integration', type: 'primary', action: 'approve' },
      { id: 'contact-merchant', label: 'Contact Merchant', type: 'secondary', action: 'contact' },
      { id: 'view-details', label: 'View Details', type: 'secondary', action: 'view' }
    ],
    metadata: { storeUrl: 'techgadgets-store.myshopify.com', planType: 'premium' }
  },
  {
    id: 'notif-002',
    type: 'merchants',
    category: 'claim_submission',
    priority: 'high',
    status: 'unread',
    title: 'Urgent Claim Submission',
    message: 'Fashion Boutique has submitted a claim for damaged package ASH-20250120-FB789. Claim amount: $450.00',
    timestamp: '2025-01-21T13:15:00Z',
    relatedId: 'ASH-20250120-FB789',
    relatedType: 'shipment',
    actions: [
      { id: 'review-claim', label: 'Review Claim', type: 'primary', action: 'view', url: '/admin/claims/ASH-20250120-FB789' },
      { id: 'contact-merchant', label: 'Contact Merchant', type: 'secondary', action: 'contact' }
    ],
    metadata: { claimAmount: 450.00, damageType: 'water_damage' }
  },
  {
    id: 'notif-003',
    type: 'merchants',
    category: 'shipment_exception',
    priority: 'normal',
    status: 'unread',
    title: 'Multiple Delivery Delays',
    message: 'BookWorld has 5 shipments with delivery delays due to weather conditions in Toronto area.',
    timestamp: '2025-01-21T12:45:00Z',
    relatedId: 'M003',
    relatedType: 'merchant',
    actions: [
      { id: 'view-shipments', label: 'View Affected Shipments', type: 'primary', action: 'navigate', url: '/admin/shipments?merchant=M003&status=delayed' },
      { id: 'notify-customers', label: 'Notify Customers', type: 'secondary', action: 'resolve' }
    ],
    metadata: { affectedShipments: 5, region: 'Toronto' }
  },
  {
    id: 'notif-004',
    type: 'merchants',
    category: 'merchant_registration',
    priority: 'normal',
    status: 'read',
    title: 'New Merchant Registration',
    message: 'Organic Foods Co. has completed registration and is pending approval. Business verification documents uploaded.',
    timestamp: '2025-01-21T11:20:00Z',
    relatedId: 'M017',
    relatedType: 'merchant',
    actions: [
      { id: 'approve-merchant', label: 'Approve', type: 'primary', action: 'approve' },
      { id: 'request-docs', label: 'Request Additional Docs', type: 'secondary', action: 'contact' },
      { id: 'view-profile', label: 'View Profile', type: 'secondary', action: 'view' }
    ]
  },
  {
    id: 'notif-005',
    type: 'merchants',
    category: 'payment_status',
    priority: 'normal',
    status: 'unread',
    title: 'Payment Issue Resolved',
    message: 'Electronics Hub payment method has been successfully updated. Outstanding invoice $1,245.50 has been paid.',
    timestamp: '2025-01-21T10:30:00Z',
    relatedId: 'M005',
    relatedType: 'merchant',
    actions: [
      { id: 'view-invoice', label: 'View Invoice', type: 'secondary', action: 'view' }
    ],
    metadata: { invoiceAmount: 1245.50, paymentMethod: 'credit_card' }
  },
  {
    id: 'notif-006',
    type: 'merchants',
    category: 'integration_error',
    priority: 'high',
    status: 'unread',
    title: 'Stripe Integration Error',
    message: 'Pet Supplies Store experiencing payment processing issues. Multiple failed transactions reported.',
    timestamp: '2025-01-21T09:15:00Z',
    relatedId: 'M008',
    relatedType: 'integration',
    actions: [
      { id: 'check-integration', label: 'Check Integration', type: 'primary', action: 'resolve' },
      { id: 'contact-merchant', label: 'Contact Merchant', type: 'secondary', action: 'contact' }
    ],
    metadata: { failedTransactions: 12, lastError: 'invalid_api_key' }
  },

  // Courier Notifications
  {
    id: 'notif-007',
    type: 'couriers',
    category: 'payout_request',
    priority: 'normal',
    status: 'unread',
    title: 'Bi-weekly Payout Request',
    message: 'Sarah Johnson (Courier ID: C001) has submitted payout request for $1,847.25 covering Jan 7-20.',
    timestamp: '2025-01-21T14:00:00Z',
    relatedId: 'C001',
    relatedType: 'courier',
    actions: [
      { id: 'approve-payout', label: 'Approve Payout', type: 'primary', action: 'approve' },
      { id: 'review-deliveries', label: 'Review Deliveries', type: 'secondary', action: 'view' },
      { id: 'contact-courier', label: 'Contact Courier', type: 'secondary', action: 'contact' }
    ],
    metadata: { payoutAmount: 1847.25, deliveryCount: 156, period: '2025-01-07_2025-01-20' }
  },
  {
    id: 'notif-013',
    type: 'couriers',
    category: 'payment_status',
    priority: 'normal',
    status: 'unread',
    title: 'Weekly Payment Processed',
    message: 'Alex Rodriguez (Courier ID: C009) weekly payment of $2,340.50 has been successfully processed and deposited.',
    timestamp: '2025-01-21T13:45:00Z',
    relatedId: 'C009',
    relatedType: 'courier',
    actions: [
      { id: 'view-payment-details', label: 'View Payment Details', type: 'secondary', action: 'view' },
      { id: 'send-receipt', label: 'Send Receipt', type: 'secondary', action: 'contact' }
    ],
    metadata: { paymentAmount: 2340.50, deliveryCount: 89, period: '2025-01-14_2025-01-20', status: 'completed' }
  },
  {
    id: 'notif-014',
    type: 'couriers',
    category: 'payout_request',
    priority: 'high',
    status: 'unread',
    title: 'Urgent Payout Request',
    message: 'Maria Garcia (Courier ID: C012) has requested emergency payout of $3,200.00 due to vehicle maintenance costs.',
    timestamp: '2025-01-21T13:20:00Z',
    relatedId: 'C012',
    relatedType: 'courier',
    actions: [
      { id: 'approve-emergency-payout', label: 'Approve Emergency Payout', type: 'primary', action: 'approve' },
      { id: 'review-vehicle-docs', label: 'Review Vehicle Docs', type: 'secondary', action: 'view' },
      { id: 'contact-courier', label: 'Contact Courier', type: 'secondary', action: 'contact' }
    ],
    metadata: { payoutAmount: 3200.00, reason: 'vehicle_maintenance', urgency: 'high', deliveryCount: 234 }
  },
  {
    id: 'notif-015',
    type: 'couriers',
    category: 'payment_status',
    priority: 'normal',
    status: 'unread',
    title: 'Bonus Payment Added',
    message: 'James Thompson (Courier ID: C015) has earned a performance bonus of $450.00 for excellent delivery ratings this week.',
    timestamp: '2025-01-21T12:55:00Z',
    relatedId: 'C015',
    relatedType: 'courier',
    actions: [
      { id: 'view-performance-metrics', label: 'View Performance Metrics', type: 'secondary', action: 'view' },
      { id: 'send-bonus-notification', label: 'Send Bonus Notification', type: 'secondary', action: 'contact' }
    ],
    metadata: { bonusAmount: 450.00, rating: 4.9, deliveryCount: 67, period: '2025-01-14_2025-01-20' }
  },
  {
    id: 'notif-016',
    type: 'couriers',
    category: 'payout_request',
    priority: 'normal',
    status: 'read',
    title: 'Monthly Payout Request Approved',
    message: 'Lisa Chen (Courier ID: C008) monthly payout request of $4,567.80 has been approved and will be processed within 24 hours.',
    timestamp: '2025-01-21T12:30:00Z',
    relatedId: 'C008',
    relatedType: 'courier',
    actions: [
      { id: 'view-payout-summary', label: 'View Payout Summary', type: 'secondary', action: 'view' }
    ],
    metadata: { payoutAmount: 4567.80, deliveryCount: 312, period: '2025-01-01_2025-01-20', status: 'approved' }
  },
  {
    id: 'notif-008',
    type: 'couriers',
    category: 'document_expiration',
    priority: 'high',
    status: 'unread',
    title: 'Driver License Expiring Soon',
    message: 'Mike Chen (Courier ID: C003) driver license expires in 15 days. Renewal required to continue deliveries.',
    timestamp: '2025-01-21T13:30:00Z',
    relatedId: 'C003',
    relatedType: 'courier',
    actions: [
      { id: 'notify-courier', label: 'Send Reminder', type: 'primary', action: 'contact' },
      { id: 'view-documents', label: 'View Documents', type: 'secondary', action: 'view' },
      { id: 'suspend-if-expired', label: 'Schedule Auto-Suspend', type: 'danger', action: 'resolve' }
    ],
    metadata: { documentType: 'driver_license', expirationDate: '2025-02-05', daysRemaining: 15 }
  },
  {
    id: 'notif-009',
    type: 'couriers',
    category: 'address_report',
    priority: 'normal',
    status: 'unread',
    title: 'Address Issue Report',
    message: 'Emma Wilson (Courier ID: C007) reported unfindable address for shipment ASH-20250121-EW456. Customer contact attempted.',
    timestamp: '2025-01-21T12:20:00Z',
    relatedId: 'ASH-20250121-EW456',
    relatedType: 'shipment',
    actions: [
      { id: 'contact-customer', label: 'Contact Customer', type: 'primary', action: 'contact' },
      { id: 'update-address', label: 'Update Address', type: 'secondary', action: 'resolve' },
      { id: 'return-to-sender', label: 'Return to Sender', type: 'secondary', action: 'resolve' }
    ],
    metadata: { originalAddress: '123 Main St, Toronto, ON', courierNotes: 'Building demolished, no forwarding address' }
  },
  {
    id: 'notif-010',
    type: 'couriers',
    category: 'payout_request',
    priority: 'low',
    status: 'read',
    title: 'Payout Request Processed',
    message: 'David Kim (Courier ID: C005) payout of $2,156.75 has been processed and transferred to bank account.',
    timestamp: '2025-01-21T11:45:00Z',
    relatedId: 'C005',
    relatedType: 'courier',
    actions: [
      { id: 'view-transaction', label: 'View Transaction', type: 'secondary', action: 'view' }
    ],
    metadata: { payoutAmount: 2156.75, transactionId: 'TXN-20250121-001', status: 'completed' }
  },

  // Global Notifications
  {
    id: 'notif-011',
    type: 'global',
    category: 'security_alert',
    priority: 'high',
    status: 'unread',
    title: 'Suspicious Login Attempts',
    message: '15 failed login attempts detected from IP 192.168.1.100 targeting multiple merchant accounts in the last hour.',
    timestamp: '2025-01-21T14:45:00Z',
    relatedId: 'SEC-001',
    relatedType: 'security',
    actions: [
      { id: 'block-ip', label: 'Block IP Address', type: 'danger', action: 'resolve' },
      { id: 'notify-affected', label: 'Notify Affected Merchants', type: 'primary', action: 'contact' },
      { id: 'view-logs', label: 'View Security Logs', type: 'secondary', action: 'view' }
    ],
    metadata: { suspiciousIP: '192.168.1.100', attemptCount: 15, affectedAccounts: 8 }
  },
  {
    id: 'notif-012',
    type: 'global',
    category: 'system_update',
    priority: 'normal',
    status: 'read',
    title: 'System Maintenance Complete',
    message: 'Scheduled maintenance completed successfully. All systems are operational. Platform performance improved by 15%.',
    timestamp: '2025-01-21T08:00:00Z',
    relatedId: 'MAINT-001',
    relatedType: 'system',
    actions: [
      { id: 'view-report', label: 'View Maintenance Report', type: 'secondary', action: 'view' }
    ],
    metadata: { maintenanceType: 'performance_optimization', duration: '2_hours', improvementPercentage: 15 }
  }
];

// Helper functions for notification management
export const getNotificationsByType = (type: NotificationType): AdminNotification[] => {
  if (type === 'global') {
    return mockAdminNotifications.filter(n => n.type === 'global');
  }
  return mockAdminNotifications.filter(n => n.type === type);
};

export const getUnreadCount = (type?: NotificationType): number => {
  const notifications = type ? getNotificationsByType(type) : mockAdminNotifications;
  return notifications.filter(n => n.status === 'unread').length;
};

export const getTotalUnreadCount = (): number => {
  return mockAdminNotifications.filter(n => n.status === 'unread').length;
};

export const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getCategoryIcon = (category: NotificationCategory): string => {
  switch (category) {
    case 'shopify_integration': return 'ShoppingBag';
    case 'claim_submission': return 'AlertTriangle';
    case 'shipment_exception': return 'Package';
    case 'merchant_registration': return 'UserPlus';
    case 'payment_status': return 'CreditCard';
    case 'integration_error': return 'AlertCircle';
    case 'payout_request': return 'DollarSign';
    case 'document_expiration': return 'FileText';
    case 'address_report': return 'MapPin';
    case 'security_alert': return 'Shield';
    case 'system_update': return 'Settings';
    default: return 'Bell';
  }
};

export const getCategoryLabel = (category: NotificationCategory): string => {
  switch (category) {
    case 'shopify_integration': return 'Shopify Integration';
    case 'claim_submission': return 'Claim Submission';
    case 'shipment_exception': return 'Shipment Exception';
    case 'merchant_registration': return 'Merchant Registration';
    case 'payment_status': return 'Payment Status';
    case 'integration_error': return 'Integration Error';
    case 'payout_request': return 'Payout Request';
    case 'document_expiration': return 'Document Expiration';
    case 'address_report': return 'Address Issue';
    case 'security_alert': return 'Security Alert';
    case 'system_update': return 'System Update';
    default: return 'Notification';
  }
};
