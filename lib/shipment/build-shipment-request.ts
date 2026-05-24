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

const isTorontoPostalCode = (postal: string): boolean => {
  if (!postal.startsWith('M')) return false;
  const digit1 = parseInt(postal.charAt(1), 10);
  return digit1 >= 1 && digit1 <= 9;
};

const isMississaugaPostalCode = (postal: string): boolean => {
  if (!postal.startsWith('L')) return false;
  const fsa = postal.substring(0, 3);
  const digit1 = parseInt(fsa.charAt(1), 10);
  const letter2 = fsa.charAt(2);
  if (digit1 === 4) {
    return ['T', 'W', 'X', 'Y', 'Z'].includes(letter2);
  }
  if (digit1 === 5) {
    return ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W'].includes(letter2);
  }
  return false;
};

const normalizePostalCode = (code: string): string => {
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
  const senderCity = (senderData.city || '').trim().toLowerCase();
  const senderPostal = (senderData.postal_code || '').trim().toUpperCase().replace(/\s+/g, '');
  const senderIsToronto = senderCity === 'toronto' || senderCity.includes('downtown');
  const senderIsMississauga = senderCity === 'mississauga';
  const senderIsTorontoPostal = isTorontoPostalCode(senderPostal);
  const senderIsMississaugaPostal = isMississaugaPostalCode(senderPostal);

  if (!senderIsToronto && !senderIsMississauga) {
    throw new Error(
      `Pickup location (sender address) must be in Downtown Toronto or Mississauga. Your profile address city "${senderData.city}" is not in our service area. Please update your profile address.`,
    );
  }
  if (!senderIsTorontoPostal && !senderIsMississaugaPostal) {
    throw new Error(
      `Pickup location postal code "${senderData.postal_code}" is not in our service area. Pickup is only available in Downtown Toronto (M prefix) and Mississauga (L4T-L5W prefix). Please update your profile address.`,
    );
  }
  if (senderIsToronto && !senderIsTorontoPostal) {
    throw new Error(
      `Pickup location postal code "${senderData.postal_code}" does not belong to Toronto. Please update your profile address.`,
    );
  }
  if (senderIsMississauga && !senderIsMississaugaPostal) {
    throw new Error(
      `Pickup location postal code "${senderData.postal_code}" does not belong to Mississauga. Please update your profile address.`,
    );
  }

  // Recipient service area
  const recipientCity = formData.recipientCity.trim().toLowerCase();
  const isToronto = recipientCity === 'toronto' || recipientCity.includes('downtown toronto');
  const isMississauga = recipientCity === 'mississauga';

  if (!isToronto && !isMississauga) {
    throw new Error(
      `Delivery is only supported in Downtown Toronto and Mississauga. Your selected city "${formData.recipientCity}" is not in our service area.`,
    );
  }

  const recipientPostal = formData.recipientPostalCode.trim().toUpperCase().replace(/\s+/g, '');
  const recipientIsTorontoPostal = isTorontoPostalCode(recipientPostal);
  const recipientIsMississaugaPostal = isMississaugaPostalCode(recipientPostal);

  if (!recipientIsTorontoPostal && !recipientIsMississaugaPostal) {
    throw new Error(
      `The postal code "${formData.recipientPostalCode}" is not in our service area. Delivery is only available in Downtown Toronto (postal codes starting with M) and Mississauga (postal codes starting with L4T-L5W).`,
    );
  }
  if (isToronto && !recipientIsTorontoPostal) {
    throw new Error(
      `The postal code "${formData.recipientPostalCode}" does not belong to Toronto. Toronto postal codes start with M.`,
    );
  }
  if (isMississauga && !recipientIsMississaugaPostal) {
    throw new Error(
      `The postal code "${formData.recipientPostalCode}" does not belong to Mississauga. Mississauga postal codes start with L4T-L5W.`,
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
      city: senderData.city || '',
      province: senderData.province || '',
      postal_code: normalizePostalCode(senderData.postal_code || ''),
      country: senderData.country || 'Canada',
      phone_number: senderData.phone_number || '',
      email: senderData.email || '',
    },
    receiver_address: {
      contact_name: formData.recipientName,
      company_name: formData.recipientCompany || '',
      street_address: formData.recipientAddress,
      street_address_2: 'N/A',
      city: formData.recipientCity,
      province: formData.recipientProvince,
      postal_code: normalizePostalCode(formData.recipientPostalCode),
      country: 'Canada',
      phone_number: formData.recipientPhone,
      email: formData.recipientEmail,
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
  };
};
