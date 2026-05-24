/**
 * Money Utilities
 *
 * The server returns all monetary amounts as integer cents (e.g. 5432 for $54.32).
 * The frontend, however, displays and reasons about money in dollars. To keep the UI
 * code simple, all conversion happens at the API boundary in the service layer.
 *
 * These helpers are used by services in `lib/api/*` immediately after a response is
 * received, so consumers downstream always work with dollar values.
 */

import type { BillingRecord, DetailedShipment } from './types';

/**
 * Convert an integer cent amount (number) to a dollar amount (number).
 * Returns null/undefined unchanged so the caller can short-circuit.
 */
export const centsToDollarsNumber = <T extends number | null | undefined>(
  cents: T,
): T extends number ? number : T => {
  if (cents === null || cents === undefined) {
    return cents as T extends number ? number : T;
  }
  return ((cents as number) / 100) as T extends number ? number : T;
};

/**
 * Convert a string-encoded cent amount (e.g. "5432") to a string-encoded
 * dollar amount with two decimal places (e.g. "54.32").
 *
 * Empty / non-numeric inputs are returned unchanged so we don't mask data
 * issues by silently producing "0.00".
 */
export const centsStringToDollars = <T extends string | null | undefined>(
  cents: T,
): T => {
  if (cents === null || cents === undefined || cents === '') {
    return cents;
  }
  const parsed = Number(cents);
  if (!Number.isFinite(parsed)) {
    return cents;
  }
  return (parsed / 100).toFixed(2) as T;
};

/**
 * Normalize a BillingRecord-shaped object: convert money string fields from
 * cents to dollars in-place semantics (returns a new object). Non-money
 * fields (notably `tax_rate`, which is a ratio like "0.13") are untouched.
 */
export const normalizeBillingMoney = <
  T extends Pick<BillingRecord, 'subtotal' | 'tax_amount' | 'amount'>,
>(
  billing: T,
): T => ({
  ...billing,
  subtotal: centsStringToDollars(billing.subtotal),
  tax_amount: centsStringToDollars(billing.tax_amount),
  amount: centsStringToDollars(billing.amount),
});

/**
 * Normalize a DetailedShipment by converting its money-bearing fields from
 * cents to dollars. This includes the embedded `billing` block (when present)
 * and the package's `declared_value` (used for insurance/value display).
 */
export const normalizeDetailedShipmentMoney = <T extends DetailedShipment>(
  shipment: T,
): T => {
  const next: T = {
    ...shipment,
    package: {
      ...shipment.package,
      declared_value: centsToDollarsNumber(shipment.package.declared_value),
    },
  };

  if (next.billing) {
    next.billing = normalizeBillingMoney(next.billing);
  }

  return next;
};
