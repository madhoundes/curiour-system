// Tracking UI mock types and data for client-only tracking page
// Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui (UI only)

export type ShipmentStatus =
  | 'LabelCreated'
  | 'DropoffConfirmed'
  | 'ReceivedAtFacility'
  | 'InTransit'
  | 'OutForDelivery'
  | 'DeliveryAttempted'
  | 'Delivered'
  | 'FailedDelivery'
  | 'ReturnedToSender'
  | 'Cancelled';

export type TrackingEvent = {
  id: string;
  timestamp: string; // ISO
  type: string;
  statusAfter: ShipmentStatus;
  location?: string;
  coordinates?: { lat: number; lng: number };
  actor: 'system' | 'courier' | 'merchant';
  details?: string;
  attachments?: Array<{ url: string; type: 'photo' | 'signature' | 'doc' }>;
  meta?: Record<string, unknown>;
};

export type ShipmentSummary = {
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  eta?: string; // ISO
  carrier?: string;
  lastUpdate: string; // ISO
  hasPOD: boolean;
};

export const formatTrackingNumber = (value: string): string => value.trim().toUpperCase();

export const isValidTrackingNumber = (value: string): boolean => {
  const v = formatTrackingNumber(value);
  return /^ASH-\d{8}-[A-Z0-9]{6}$/.test(v);
};

// Mock data for different tracking statuses
export const mockTrackingData: Record<string, { events: TrackingEvent[]; summary: ShipmentSummary }> = {
  'ASH-20250910-ABC123': {
    events: [
      {
        id: 'evt-005',
        timestamp: '2025-09-12T14:15:00Z',
        type: 'DELIVERED',
        statusAfter: 'Delivered',
        location: 'Toronto, ON',
        actor: 'courier',
        details: 'Delivered to recipient. Proof of delivery captured.'
      },
      {
        id: 'evt-004',
        timestamp: '2025-09-12T07:30:00Z',
        type: 'OUT_FOR_DELIVERY',
        statusAfter: 'OutForDelivery',
        location: 'Toronto, ON',
        actor: 'system',
        details: 'Package is out for delivery.'
      },
      {
        id: 'evt-003',
        timestamp: '2025-09-11T08:00:00Z',
        type: 'IN_TRANSIT_ARRIVED',
        statusAfter: 'InTransit',
        location: 'Mississauga, ON Facility',
        actor: 'system'
      },
      {
        id: 'evt-002',
        timestamp: '2025-09-10T12:00:00Z',
        type: 'DROP_OFF_CONFIRMED',
        statusAfter: 'DropoffConfirmed',
        location: 'Scarborough, ON',
        actor: 'merchant',
        details: 'Package dropped at partner location.'
      },
      {
        id: 'evt-001',
        timestamp: '2025-09-10T09:00:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250910-ABC123',
      status: 'Delivered',
      origin: 'Toronto, ON',
      destination: 'New York, NY',
      eta: '2025-09-12T15:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-12T14:15:00Z',
      hasPOD: true
    }
  },
  'ASH-20250911-DEF456': {
    events: [
      {
        id: 'evt-003',
        timestamp: '2025-09-11T08:00:00Z',
        type: 'IN_TRANSIT_ARRIVED',
        statusAfter: 'InTransit',
        location: 'Mississauga, ON Facility',
        actor: 'system',
        details: 'Package arrived at sorting facility.'
      },
      {
        id: 'evt-002',
        timestamp: '2025-09-10T12:00:00Z',
        type: 'DROP_OFF_CONFIRMED',
        statusAfter: 'DropoffConfirmed',
        location: 'Scarborough, ON',
        actor: 'merchant',
        details: 'Package dropped at partner location.'
      },
      {
        id: 'evt-001',
        timestamp: '2025-09-10T09:00:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250911-DEF456',
      status: 'InTransit',
      origin: 'Toronto, ON',
      destination: 'Vancouver, BC',
      eta: '2025-09-13T16:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-11T08:00:00Z',
      hasPOD: false
    }
  },
  'ASH-20250912-GHI789': {
    events: [
      {
        id: 'evt-004',
        timestamp: '2025-09-12T07:30:00Z',
        type: 'OUT_FOR_DELIVERY',
        statusAfter: 'OutForDelivery',
        location: 'Vancouver, BC',
        actor: 'system',
        details: 'Package is out for delivery today.'
      },
      {
        id: 'evt-003',
        timestamp: '2025-09-11T08:00:00Z',
        type: 'IN_TRANSIT_ARRIVED',
        statusAfter: 'InTransit',
        location: 'Vancouver, BC Facility',
        actor: 'system',
        details: 'Package arrived at local facility.'
      },
      {
        id: 'evt-002',
        timestamp: '2025-09-10T12:00:00Z',
        type: 'DROP_OFF_CONFIRMED',
        statusAfter: 'DropoffConfirmed',
        location: 'Scarborough, ON',
        actor: 'merchant',
        details: 'Package dropped at partner location.'
      },
      {
        id: 'evt-001',
        timestamp: '2025-09-10T09:00:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250912-GHI789',
      status: 'OutForDelivery',
      origin: 'Toronto, ON',
      destination: 'Montreal, QC',
      eta: '2025-09-12T18:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-12T07:30:00Z',
      hasPOD: false
    }
  },
  'ASH-20250913-JKL012': {
    events: [
      {
        id: 'evt-005',
        timestamp: '2025-09-13T14:15:00Z',
        type: 'DELIVERED',
        statusAfter: 'Delivered',
        location: 'Montreal, QC',
        actor: 'courier',
        details: 'Delivered to recipient. Proof of delivery captured.'
      },
      {
        id: 'evt-004',
        timestamp: '2025-09-13T07:30:00Z',
        type: 'OUT_FOR_DELIVERY',
        statusAfter: 'OutForDelivery',
        location: 'Montreal, QC',
        actor: 'system',
        details: 'Package is out for delivery.'
      },
      {
        id: 'evt-003',
        timestamp: '2025-09-12T08:00:00Z',
        type: 'IN_TRANSIT_ARRIVED',
        statusAfter: 'InTransit',
        location: 'Montreal, QC Facility',
        actor: 'system',
        details: 'Package arrived at local facility.'
      },
      {
        id: 'evt-002',
        timestamp: '2025-09-11T12:00:00Z',
        type: 'DROP_OFF_CONFIRMED',
        statusAfter: 'DropoffConfirmed',
        location: 'Scarborough, ON',
        actor: 'merchant',
        details: 'Package dropped at partner location.'
      },
      {
        id: 'evt-001',
        timestamp: '2025-09-11T09:00:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250913-JKL012',
      status: 'Delivered',
      origin: 'Toronto, ON',
      destination: 'Montreal, QC',
      eta: '2025-09-13T15:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-13T14:15:00Z',
      hasPOD: true
    }
  },
  'ASH-20250914-MNO345': {
    events: [
      {
        id: 'evt-006',
        timestamp: '2025-09-14T16:30:00Z',
        type: 'DELIVERY_FAILED',
        statusAfter: 'FailedDelivery',
        location: 'Calgary, AB',
        actor: 'courier',
        details: 'Delivery attempt failed - recipient not available. Will retry tomorrow.'
      },
      {
        id: 'evt-005',
        timestamp: '2025-09-14T14:00:00Z',
        type: 'DELIVERY_ATTEMPTED',
        statusAfter: 'DeliveryAttempted',
        location: 'Calgary, AB',
        actor: 'courier',
        details: 'Delivery attempt made - no one available to receive package.'
      },
      {
        id: 'evt-004',
        timestamp: '2025-09-14T07:30:00Z',
        type: 'OUT_FOR_DELIVERY',
        statusAfter: 'OutForDelivery',
        location: 'Calgary, AB',
        actor: 'system',
        details: 'Package is out for delivery.'
      },
      {
        id: 'evt-003',
        timestamp: '2025-09-13T08:00:00Z',
        type: 'IN_TRANSIT_ARRIVED',
        statusAfter: 'InTransit',
        location: 'Calgary, AB Facility',
        actor: 'system',
        details: 'Package arrived at local facility.'
      },
      {
        id: 'evt-002',
        timestamp: '2025-09-12T12:00:00Z',
        type: 'DROP_OFF_CONFIRMED',
        statusAfter: 'DropoffConfirmed',
        location: 'Scarborough, ON',
        actor: 'merchant',
        details: 'Package dropped at partner location.'
      },
      {
        id: 'evt-001',
        timestamp: '2025-09-12T09:00:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250914-MNO345',
      status: 'FailedDelivery',
      origin: 'Toronto, ON',
      destination: 'Calgary, AB',
      eta: '2025-09-15T16:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-14T16:30:00Z',
      hasPOD: false
    }
  },
  'ASH-20250915-PQR678': {
    events: [
      {
        id: 'evt-001',
        timestamp: '2025-09-15T10:30:00Z',
        type: 'LABEL_CREATED',
        statusAfter: 'LabelCreated',
        location: 'Toronto, ON',
        actor: 'merchant',
        details: 'Shipping label created and ready for drop-off.'
      }
    ],
    summary: {
      trackingNumber: 'ASH-20250915-PQR678',
      status: 'LabelCreated',
      origin: 'Toronto, ON',
      destination: 'Ottawa, ON',
      eta: '2025-09-17T14:00:00Z',
      carrier: 'Ashraf Express',
      lastUpdate: '2025-09-15T10:30:00Z',
      hasPOD: false
    }
  }
};

// Legacy exports for backward compatibility
export const mockEvents: TrackingEvent[] = mockTrackingData['ASH-20250910-ABC123'].events;
export const mockSummary: ShipmentSummary = mockTrackingData['ASH-20250910-ABC123'].summary;

// Function to get tracking data by tracking number
export const getTrackingData = (trackingNumber: string): { events: TrackingEvent[]; summary: ShipmentSummary } | null => {
  const formatted = formatTrackingNumber(trackingNumber);
  return mockTrackingData[formatted] || null;
};

export const statusBadgeTone: Record<ShipmentStatus, { bg: string; text: string }> = {
  LabelCreated: { bg: 'bg-slate-100', text: 'text-slate-700' },
  DropoffConfirmed: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  ReceivedAtFacility: { bg: 'bg-violet-100', text: 'text-violet-700' },
  InTransit: { bg: 'bg-blue-100', text: 'text-blue-700' },
  OutForDelivery: { bg: 'bg-amber-100', text: 'text-amber-800' },
  DeliveryAttempted: { bg: 'bg-orange-100', text: 'text-orange-800' },
  Delivered: { bg: 'bg-green-100', text: 'text-green-700' },
  FailedDelivery: { bg: 'bg-red-100', text: 'text-red-700' },
  ReturnedToSender: { bg: 'bg-rose-100', text: 'text-rose-700' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-700' }
};

export const typeToIcon: Record<string, string> = {
  LABEL_CREATED: 'file-text',
  DROP_OFF_CONFIRMED: 'map-pin',
  SCANNED_AT_FACILITY: 'scan-barcode',
  IN_TRANSIT_DEPARTED: 'truck',
  IN_TRANSIT_ARRIVED: 'warehouse',
  OUT_FOR_DELIVERY: 'truck',
  DELIVERY_ATTEMPTED: 'clock',
  DELIVERY_FAILED: 'x-circle',
  DELIVERED: 'check-circle',
  RETURNED_TO_SENDER: 'rotate-ccw',
  POD_UPLOADED: 'camera',
  NOTE_ADDED: 'message-square'
};


