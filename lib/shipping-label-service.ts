"use client";

import { ShippingLabelData } from '@/components/pdf/polished-shipping-label';
import { Shipment } from '@/lib/mock/shipments';

/**
 * Centralized shipping label service for unified label generation across the app
 * Ensures consistent branding, data formatting, and generation logic
 */

import { profileService } from './api/profile';

/**
 * Get sender information from user profile
 */
export const getSenderFromProfile = async () => {
  try {
    const profile = await profileService.getProfile();
    return {
      name: profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}` 
        : profile.business_name || "Your Name",
      company: profile.business_name || "",
      address: profile.street_address || "Your Address",
      city: profile.city || "Your City",
      state: profile.province || "Your Province",
      postalCode: profile.postal_code || "Your Postal Code",
      phone: profile.phone_number || "Your Phone",
      email: profile.email || "your@email.com"
    };
  } catch (error) {
    console.error('Failed to load profile for sender info:', error);
    // Return empty defaults if profile loading fails
    return {
      name: "",
      company: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      email: ""
    };
  }
};

/**
 * Service type mappings for consistent display
 */
const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'standard': '3-5 business days',
  'express': '1-2 business days',
  'same_day': 'Same day delivery',
  'overnight': 'Next business day',
  'STANDARD': '3-5 business days',
  'EXPRESS': '1-2 business days',
  'SAME_DAY': 'Same day delivery',
  'OVERNIGHT': 'Next business day'
};

/**
 * Converts form data to shipping label data with consistent formatting
 */
export const createShippingLabelData = async (params: {
  trackingNumber: string;
  recipient: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  service: {
    type: string;
    description?: string;
  };
  package: {
    weight: string;
    dimensions: string;
    type: string;
  };
  sender?: Partial<Awaited<ReturnType<typeof getSenderFromProfile>>>;
}): Promise<ShippingLabelData> => {
  // Get sender information from profile
  const defaultSender = await getSenderFromProfile();
  
  // Normalize service type
  const serviceType = params.service.type.toUpperCase();
  const serviceDescription = params.service.description || 
    SERVICE_DESCRIPTIONS[serviceType] || 
    SERVICE_DESCRIPTIONS[params.service.type.toLowerCase()] || 
    'Standard delivery';

  return {
    trackingNumber: params.trackingNumber,
    sender: {
      ...defaultSender,
      ...params.sender
    },
    recipient: {
      name: params.recipient.name,
      company: params.recipient.company,
      address: params.recipient.address,
      city: params.recipient.city,
      state: params.recipient.state,
      postalCode: params.recipient.postalCode,
      phone: params.recipient.phone,
      email: params.recipient.email
    },
    service: {
      type: serviceType,
      description: serviceDescription
    },
    package: {
      weight: params.package.weight,
      dimensions: params.package.dimensions,
      type: params.package.type
    },
    shipDate: (() => {
      const date = new Date();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${month}/${day}/${year}`;
    })()
  };
};

/**
 * Converts shipment data to shipping label data
 */
export const createShippingLabelFromShipment = async (shipment: Shipment): Promise<ShippingLabelData> => {
  return await createShippingLabelData({
    trackingNumber: shipment.trackingNumber,
    recipient: {
      name: shipment.recipient.name,
      company: shipment.recipient.address2, // Often used as company field
      address: shipment.recipient.address1,
      city: shipment.recipient.city,
      state: shipment.recipient.province || 'ON',
      postalCode: shipment.recipient.postalCode,
      phone: shipment.recipient.phone || '+1 (555) 000-0000',
      email: shipment.recipient.email || 'customer@example.com'
    },
    service: {
      type: shipment.service,
      description: SERVICE_DESCRIPTIONS[shipment.service.toLowerCase()] || 'Standard delivery'
    },
    package: {
      weight: `${shipment.weightKg} kg`,
      dimensions: '12" × 8" × 6" in', // Default dimensions
      type: 'Package'
    }
  });
};

/**
 * Converts form order data to shipping label data
 */
export const createShippingLabelFromOrderData = async (params: {
  trackingNumber: string;
  recipientName: string;
  recipientCompany?: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  recipientPhone: string;
  recipientEmail: string;
  serviceType: string;
  weight?: string;
  weightUnit?: string;
  length?: string;
  width?: string;
  height?: string;
  dimensionUnit?: string;
  packageType?: string;
  selectedQuote?: {
    deliveryTime?: string;
  };
}): Promise<ShippingLabelData> => {
  // Format dimensions
  const dimensions = params.length && params.width && params.height
    ? `${params.length}" × ${params.width}" × ${params.height}" ${params.dimensionUnit || 'in'}`
    : '12" × 8" × 6" in';

  // Format weight
  const weight = params.weight && params.weightUnit
    ? `${params.weight} ${params.weightUnit}`
    : '2.5 lbs';

  return await createShippingLabelData({
    trackingNumber: params.trackingNumber,
    recipient: {
      name: params.recipientName,
      company: params.recipientCompany,
      address: params.recipientAddress,
      city: params.recipientCity,
      state: params.recipientProvince,
      postalCode: params.recipientPostalCode,
      phone: params.recipientPhone,
      email: params.recipientEmail
    },
    service: {
      type: params.serviceType,
      description: params.selectedQuote?.deliveryTime
    },
    package: {
      weight,
      dimensions,
      type: params.packageType || 'Package'
    }
  });
};

/**
 * @deprecated Use shippingService.generateLabel() instead
 * Generate and download shipping label - DEPRECATED
 */
export const generateAndDownloadLabel = async (labelData: ShippingLabelData): Promise<void> => {
  console.warn('generateAndDownloadLabel is deprecated. Use shippingService.generateLabel() instead.');
  alert('This function is deprecated. Please use the updated label generation system.');
};

/**
 * @deprecated Use shippingService.generateLabel() for each shipment instead
 * Generate and download multiple shipping labels - DEPRECATED
 */
export const generateAndDownloadMultipleLabels = async (shipments: Shipment[]): Promise<void> => {
  console.warn('generateAndDownloadMultipleLabels is deprecated. Use shippingService.generateLabel() for each shipment instead.');
  alert('This function is deprecated. Please use the updated label generation system.');
};

/**
 * Get label preview blob for display purposes
 */
export const getLabelPreviewBlob = async (labelData: ShippingLabelData): Promise<Blob> => {
  try {
    const { generateShippingLabelBlob } = await import('@/lib/pdf-generator');
    return await generateShippingLabelBlob(labelData);
  } catch (error) {
    console.error('Error generating label preview:', error);
    throw new Error('Failed to generate label preview. Please try again.');
  }
};
