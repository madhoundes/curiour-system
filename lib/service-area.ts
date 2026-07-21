/**
 * Shared GTA service-area helpers (cities + Canada Post FSAs).
 * Keep in sync with Parcego-Backend/quotes/postal_codes.py.
 */

export const SERVICE_AREA_CITIES = [
  'Toronto',
  'Mississauga',
  'Brampton',
  'Oakville',
  'Etobicoke',
] as const;

export type ServiceAreaCity = (typeof SERVICE_AREA_CITIES)[number];

export const SERVICE_AREA_LABEL = SERVICE_AREA_CITIES.join(', ');
export const SERVICE_AREA_LABEL_SHORT = 'Toronto, Mississauga, Brampton, Oakville, or Etobicoke';

const MISSISSAUGA_FSAS = new Set([
  'L4T',
  'L4W',
  'L4X',
  'L4Y',
  'L4Z',
  'L5A',
  'L5B',
  'L5C',
  'L5E',
  'L5G',
  'L5H',
  'L5J',
  'L5K',
  'L5L',
  'L5M',
  'L5N',
  'L5R',
  'L5T',
  'L5V',
  'L5W',
]);

const BRAMPTON_FSAS = new Set([
  'L6P',
  'L6R',
  'L6S',
  'L6T',
  'L6V',
  'L6W',
  'L6X',
  'L6Y',
  'L6Z',
  'L7A',
]);

const OAKVILLE_FSAS = new Set([
  'L6H',
  'L6J',
  'L6K',
  'L6L',
  'L6M',
]);

const ETOBICOKE_FSAS = new Set([
  'M8V',
  'M8W',
  'M8X',
  'M8Y',
  'M8Z',
  'M9A',
  'M9B',
  'M9C',
  'M9L',
  'M9M',
  'M9N',
  'M9P',
  'M9R',
  'M9V',
  'M9W',
]);

const EXCLUDED_TORONTO_FSAS = new Set(['M0R', 'M7R']);

export const normalizePostalCode = (postalCode: string): string =>
  postalCode.trim().toUpperCase().replace(/[\s-]/g, '');

export const getFsa = (postalCode: string): string =>
  normalizePostalCode(postalCode).substring(0, 3);

export const isTorontoPostalCode = (postalCode: string): boolean => {
  const normalized = normalizePostalCode(postalCode);
  if (normalized.length < 3) return false;

  const fsa = normalized.substring(0, 3);
  if (EXCLUDED_TORONTO_FSAS.has(fsa)) return false;
  if (!fsa.startsWith('M')) return false;

  const digit1 = parseInt(fsa.charAt(1), 10);
  return digit1 >= 1 && digit1 <= 9 && /[A-Z]/.test(fsa.charAt(2));
};

export const isEtobicokePostalCode = (postalCode: string): boolean =>
  ETOBICOKE_FSAS.has(getFsa(postalCode));

export const isMississaugaPostalCode = (postalCode: string): boolean =>
  MISSISSAUGA_FSAS.has(getFsa(postalCode));

export const isBramptonPostalCode = (postalCode: string): boolean =>
  BRAMPTON_FSAS.has(getFsa(postalCode));

export const isOakvillePostalCode = (postalCode: string): boolean =>
  OAKVILLE_FSAS.has(getFsa(postalCode));

export const isPostalCodeInServiceArea = (postalCode: string): boolean =>
  isTorontoPostalCode(postalCode) ||
  isMississaugaPostalCode(postalCode) ||
  isBramptonPostalCode(postalCode) ||
  isOakvillePostalCode(postalCode);

export const inferCityFromPostalCode = (postalCode: string): ServiceAreaCity => {
  if (isMississaugaPostalCode(postalCode)) return 'Mississauga';
  if (isBramptonPostalCode(postalCode)) return 'Brampton';
  if (isOakvillePostalCode(postalCode)) return 'Oakville';
  if (isEtobicokePostalCode(postalCode)) return 'Etobicoke';
  return 'Toronto';
};

export const parseServiceAreaCity = (city: string): ServiceAreaCity | null => {
  const normalized = city.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'toronto' || normalized.includes('downtown toronto') || normalized.includes('downtown')) {
    return 'Toronto';
  }
  if (normalized === 'mississauga') return 'Mississauga';
  if (normalized === 'brampton') return 'Brampton';
  if (normalized === 'oakville') return 'Oakville';
  if (normalized === 'etobicoke') return 'Etobicoke';
  return null;
};

export const isAllowedServiceCity = (city: string): boolean =>
  parseServiceAreaCity(city) !== null;

export const postalMatchesCity = (postalCode: string, city: string): boolean => {
  const parsedCity = parseServiceAreaCity(city);
  if (!parsedCity) return false;

  switch (parsedCity) {
    case 'Toronto':
      // Etobicoke is part of Toronto; accept any Toronto M-prefix FSA.
      return isTorontoPostalCode(postalCode);
    case 'Etobicoke':
      return isEtobicokePostalCode(postalCode);
    case 'Mississauga':
      return isMississaugaPostalCode(postalCode);
    case 'Brampton':
      return isBramptonPostalCode(postalCode);
    case 'Oakville':
      return isOakvillePostalCode(postalCode);
    default:
      return false;
  }
};

export const cityHintForPostal = (postalCode: string): string => {
  if (isMississaugaPostalCode(postalCode)) return 'Mississauga';
  if (isBramptonPostalCode(postalCode)) return 'Brampton';
  if (isOakvillePostalCode(postalCode)) return 'Oakville';
  if (isEtobicokePostalCode(postalCode)) return 'Etobicoke or Toronto';
  if (isTorontoPostalCode(postalCode)) return 'Toronto';
  return SERVICE_AREA_LABEL_SHORT;
};

export const serviceAreaPostalHint =
  'Toronto/Etobicoke (M), Mississauga (L4T–L5W), Brampton (L6P–L7A), or Oakville (L6H–L6M)';
