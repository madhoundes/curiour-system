import { quotesService } from '@/lib/api/quotes';
import { shippingService } from '@/lib/api/shipping';
import { resolvePackageSizeFromType } from '@/lib/zone-pricing';
import type { BillingRecord, DetailedShipment } from '@/lib/api/types';

export type DraftCheckoutPrepResult =
  | { status: 'ready'; billing: BillingRecord; shipment: DetailedShipment }
  | { status: 'needs_speed_selection' }
  | { status: 'error'; message: string };

/**
 * Ensure a DRAFT shipment has delivery speed + pending billing before checkout.
 * In-zone downtown deliveries require the merchant to pick a tier on the detail page.
 */
export const ensureDraftShipmentCheckoutReady = async (
  shipment: DetailedShipment,
): Promise<DraftCheckoutPrepResult> => {
  const hasPendingBilling =
    shipment.billing?.payment_status === 'pending' && Boolean(shipment.billing?.id);

  if (shipment.delivery_speed && hasPendingBilling) {
    return {
      status: 'ready',
      billing: shipment.billing as unknown as BillingRecord,
      shipment,
    };
  }

  try {
    const receiver = shipment.receiver_address;
    const pkg = shipment.package;
    const options = await quotesService.getOptions({
      package_size: resolvePackageSizeFromType(pkg.package_type),
      weight: pkg.weight,
      destination_street_address: receiver.street_address,
      destination_city: receiver.city,
      destination_province: receiver.province,
      destination_postal_code: receiver.postal_code,
      destination_country: receiver.country,
      destination_latitude: receiver.latitude,
      destination_longitude: receiver.longitude,
    });

    if (options.in_special_zone && !shipment.delivery_speed) {
      return { status: 'needs_speed_selection' };
    }

    const speed = shipment.delivery_speed || 'legacy';
    const result = await shippingService.selectDeliverySpeed(shipment.id, {
      delivery_speed: speed,
    });

    return {
      status: 'ready',
      billing: result.billing,
      shipment: result.shipment as unknown as DetailedShipment,
    };
  } catch (err) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to prepare shipment for payment',
    };
  }
};
