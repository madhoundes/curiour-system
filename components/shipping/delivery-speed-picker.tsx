"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { quotesService } from "@/lib/api/quotes";
import { shippingService } from "@/lib/api/shipping";
import { getDeliverySpeedLabel, resolvePackageSizeFromType } from "@/lib/zone-pricing";
import type { BillingRecord, DetailedShipment, QuoteOptionItem } from "@/lib/api/types";

export interface DeliverySpeedPickerProps {
  shipment: DetailedShipment;
  selectedSpeed?: string | null;
  billingSubtotal?: number | null;
  onSpeedSelected: (speed: string, billing: BillingRecord, updatedShipment: DetailedShipment) => void;
  onOutOfZoneResolved?: () => void;
}

export const DeliverySpeedPicker: React.FC<DeliverySpeedPickerProps> = ({
  shipment,
  selectedSpeed,
  billingSubtotal,
  onSpeedSelected,
  onOutOfZoneResolved,
}) => {
  const [quoteOptions, setQuoteOptions] = useState<QuoteOptionItem[]>([]);
  const [inSpecialZone, setInSpecialZone] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const hasAutoResolvedRef = useRef(false);

  const receiver = shipment.receiver_address;
  const pkg = shipment.package;

  const handleSelectSpeed = useCallback(
    async (speed: string) => {
      setIsSelecting(true);
      setOptionsError(null);
      try {
        const result = await shippingService.selectDeliverySpeed(shipment.id, {
          delivery_speed: speed as 'next_day' | 'standard_2_3' | 'legacy',
        });
        onSpeedSelected(
          result.shipment.delivery_speed || speed,
          result.billing,
          result.shipment as unknown as DetailedShipment,
        );
      } catch (err) {
        setOptionsError(err instanceof Error ? err.message : 'Failed to save delivery speed');
      } finally {
        setIsSelecting(false);
      }
    },
    [onSpeedSelected, shipment.id],
  );

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      setQuoteOptions([]);

      try {
        const response = await quotesService.getOptions({
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

        if (cancelled) return;

        setQuoteOptions(response.options);
        setInSpecialZone(response.in_special_zone);
      } catch (err) {
        if (cancelled) return;
        setOptionsError(err instanceof Error ? err.message : 'Failed to load delivery options');
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [
    pkg.package_type,
    pkg.weight,
    receiver.city,
    receiver.country,
    receiver.latitude,
    receiver.longitude,
    receiver.postal_code,
    receiver.province,
    receiver.street_address,
  ]);

  useEffect(() => {
    if (optionsLoading || inSpecialZone || selectedSpeed || hasAutoResolvedRef.current) {
      return;
    }
    hasAutoResolvedRef.current = true;
    void handleSelectSpeed('legacy').then(() => {
      onOutOfZoneResolved?.();
    });
  }, [
    handleSelectSpeed,
    inSpecialZone,
    onOutOfZoneResolved,
    optionsLoading,
    selectedSpeed,
  ]);

  if (optionsLoading || (!inSpecialZone && !selectedSpeed && isSelecting)) {
    return (
      <Card className="parcego-card parcego-card--delivery-speed-loading">
        <CardContent className="py-8 flex items-center justify-center gap-3">
          <Icon name="Loader2" size={20} className="animate-spin text-blue-600" />
          <span className="text-gray-600 text-sm">Checking delivery zone...</span>
        </CardContent>
      </Card>
    );
  }

  if (!inSpecialZone) {
    return null;
  }

  return (
    <Card className="parcego-card parcego-card--quote-options" id="parcego-draft-delivery-speed-picker">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="Truck" size={20} className="text-green-600" />
          <span>Delivery Speed</span>
        </CardTitle>
        <CardDescription>
          Choose your delivery speed for this downtown Toronto delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optionsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{optionsError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {quoteOptions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              Downtown delivery zone — flat rates apply. HST is added at checkout.
            </p>
            {quoteOptions.map((option) => {
              const isSelected = selectedSpeed === option.delivery_speed;
              const displayPrice =
                isSelected && billingSubtotal != null
                  ? billingSubtotal
                  : option.estimated_price;

              return (
                <button
                  key={option.delivery_speed}
                  type="button"
                  id={`parcego-quote-option-${option.delivery_speed}`}
                  onClick={() => handleSelectSpeed(option.delivery_speed)}
                  disabled={isSelecting}
                  className={`parcego-quote-option relative w-full text-left p-6 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${getDeliverySpeedLabel(option.delivery_speed)} — $${displayPrice.toFixed(2)} before tax`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Selected
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-blue-700 text-lg">
                        {getDeliverySpeedLabel(option.delivery_speed)}
                      </h3>
                      <p className="text-sm text-blue-600 mt-1">{option.eta}</p>
                    </div>
                    <div className="text-xl font-bold text-blue-700">
                      ${displayPrice.toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
