import type { ShipmentFormData } from '@/lib/shipment-context';
import type { QuoteOptionsRequest } from '@/lib/api/types';
import { inferCityFromPostalCode } from '@/lib/service-area';

export type ApiPackageSize = 'small' | 'medium' | 'large';

export const resolvePackageSizeFromType = (packageType: string): ApiPackageSize => {
  switch (packageType?.toLowerCase()) {
    case 'envelope':
      return 'small';
    case 'pallet':
      return 'large';
    default:
      return 'medium';
  }
};

export const resolvePackageSize = (formData: Pick<ShipmentFormData, 'packageType'>): ApiPackageSize => {
  switch (formData.packageType) {
    case 'envelope':
      return 'small';
    case 'pallet':
      return 'large';
    default:
      return 'medium';
  }
};

export { inferCityFromPostalCode };

export const buildQuoteOptionsFromPostal = (
  packageSize: ApiPackageSize,
  weight: number,
  postalCode: string,
): QuoteOptionsRequest => ({
  package_size: packageSize,
  weight,
  destination_postal_code: postalCode.trim().toUpperCase(),
  destination_city: inferCityFromPostalCode(postalCode),
  destination_province: 'ON',
});

export const getDeliverySpeedLabel = (speed: string): string => {
  switch (speed) {
    case 'next_day':
      return 'Next Day Delivery';
    case 'standard_2_3':
      return '2–3 Day Delivery';
    default:
      return 'Parcego Standard';
  }
};
