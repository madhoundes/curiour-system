/**
 * Builds a CreateShipmentRequest payload from the wizard form data and the
 * authenticated user's profile (sender). Performs the same client-side
 * validation rules previously inline in the purchase-label page so the
 * shipment can be created at any point in the flow.
 *
 * Callers should be prepared to handle thrown Errors with human-readable
 * messages (suitable for surfacing directly to the user).
 */

import type { ShipmentFormData } from '@/lib/shipment-context';
import type { CreateShipmentRequest, UserProfile } from '@/lib/api/types';
import {
  isAllowedServiceCity,
  isPostalCodeInServiceArea,
  parseServiceAreaCity,
  postalMatchesCity,
  SERVICE_AREA_LABEL_SHORT,
  serviceAreaPostalHint,
} from '@/lib/service-area';

const REQUIRED_SENDER_FIELDS: Array<keyof UserProfile> = [
  'email',
  'phone_number',
  'street_address',
  'city',
  'province',
  'postal_code',
];

const REQUIRED_RECIPIENT_FIELDS: Array<{ field: keyof ShipmentFormData; label: string }> = [
  { field: 'recipientName', label: 'recipient name' },
  { field: 'recipientAddress', label: 'recipient address' },
  { field: 'recipientCity', label: 'recipient city' },
  { field: 'recipientProvince', label: 'recipient province' },
  { field: 'recipientPostalCode', label: 'recipient postal code' },
  { field: 'recipientPhone', label: 'recipient phone' },
  { field: 'recipientEmail', label: 'recipient email' },
];

const formatPostalCode = (code: string): string => {
  if (!code) return '';
  const cleaned = code.trim().replace(/[\s-]/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }
  return cleaned;
};

export const buildCreateShipmentRequest = (
  formData: ShipmentFormData,
  senderData: UserProfile,
): CreateShipmentRequest => {
  if (!formData || !senderData) {
    throw new Error('Missing shipment data or sender information');
  }

  // Sender (profile) presence
  for (const field of REQUIRED_SENDER_FIELDS) {
    const value = senderData[field];
    if (!value || String(value).trim() === '') {
      throw new Error(
        `Sender ${String(field).replace('_', ' ')} is required but missing from your profile`,
      );
    }
  }

  // Recipient presence
  for (const { field, label } of REQUIRED_RECIPIENT_FIELDS) {
    const value = formData[field];
    if (!value || String(value).trim() === '') {
      throw new Error(`${label} is required but missing`);
    }
  }

  // Sender service area
  const senderCity = senderData.city || '';
  const senderPostal = senderData.postal_code || '';
  const senderParsedCity = parseServiceAreaCity(senderCity);

  if (!senderParsedCity || !isAllowedServiceCity(senderCity)) {
    throw new Error(
      `Pickup location (sender address) must be in ${SERVICE_AREA_LABEL_SHORT}. Your profile address city "${senderData.city}" is not in our service area. Please update your profile address.`,
    );
  }
  if (!isPostalCodeInServiceArea(senderPostal)) {
    throw new Error(
      `Pickup location postal code "${senderData.postal_code}" is not in our service area. Pickup is only available in ${serviceAreaPostalHint}. Please update your profile address.`,
    );
  }
  if (!postalMatchesCity(senderPostal, senderCity)) {
    throw new Error(
      `Pickup location postal code "${senderData.postal_code}" does not belong to ${senderParsedCity}. Please update your profile address.`,
    );
  }

  // Recipient service area
  const recipientCity = formData.recipientCity;
  const recipientParsedCity = parseServiceAreaCity(recipientCity);

  if (!recipientParsedCity || !isAllowedServiceCity(recipientCity)) {
    throw new Error(
      `Delivery is only supported in ${SERVICE_AREA_LABEL_SHORT}. Your selected city "${formData.recipientCity}" is not in our service area.`,
    );
  }

  const recipientPostal = formData.recipientPostalCode;
  if (!isPostalCodeInServiceArea(recipientPostal)) {
    throw new Error(
      `The postal code "${formData.recipientPostalCode}" is not in our service area. Delivery is only available in ${serviceAreaPostalHint}.`,
    );
  }
  if (!postalMatchesCity(recipientPostal, recipientCity)) {
    throw new Error(
      `The postal code "${formData.recipientPostalCode}" does not belong to ${recipientParsedCity}.`,
    );
  }

  // Package dimensions
  const numericPackageFields: Array<keyof ShipmentFormData> = ['weight', 'length', 'width', 'height'];
  for (const field of numericPackageFields) {
    const value = parseFloat(formData[field] as string);
    if (Number.isNaN(value) || value <= 0) {
      throw new Error(`Package ${String(field)} must be a valid positive number`);
    }
  }

  return {
    sender_address: {
      contact_name:
        senderData.business_name || `${senderData.first_name} ${senderData.last_name}` || 'Contact Name',
      company_name: senderData.business_name || '',
      street_address: senderData.street_address || '',
      street_address_2: senderData.street_address_2 || 'N/A',
      city: senderParsedCity,
      province: senderData.province || '',
      postal_code: formatPostalCode(senderData.postal_code || ''),
      country: senderData.country || 'Canada',
      phone_number: senderData.phone_number || '',
      email: senderData.email || '',
    },
    receiver_address: {
      contact_name: formData.recipientName,
      company_name: formData.recipientCompany || '',
      street_address: formData.recipientAddress,
      street_address_2: 'N/A',
      city: recipientParsedCity,
      province: formData.recipientProvince,
      postal_code: formatPostalCode(formData.recipientPostalCode),
      country: 'Canada',
      phone_number: formData.recipientPhone,
      email: formData.recipientEmail,
      latitude: formData.recipientLatitude,
      longitude: formData.recipientLongitude,
    },
    package: {
      package_type: formData.packageType as 'box' | 'envelope' | 'tube' | 'pallet',
      weight: parseFloat(formData.weight),
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      declared_value: 0,
      contents_description: formData.specialInstructions || 'Package contents',
      fragile: formData.fragile,
      requires_signature: false,
      special_instructions: formData.specialInstructions || '',
    },
    special_instructions: formData.specialInstructions || '',
    delivery_notes: formData.specialInstructions || 'Standard delivery',
    delivery_speed: formData.deliverySpeed,
  };
};
