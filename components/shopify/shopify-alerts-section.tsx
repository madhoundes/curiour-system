"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ShopifyAlertsResponse } from "@/lib/api/types";
import Link from "next/link";

interface ShopifyAlertsSectionProps {
  alerts: ShopifyAlertsResponse | null;
  isLoading: boolean;
  error: string | null;
  alertCount?: number;
}

export function ShopifyAlertsSection({
  alerts,
  isLoading,
  error,
  alertCount,
}: ShopifyAlertsSectionProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return "AlertCircle";
      case "warning":
        return "AlertTriangle";
      case "info":
        return "Info";
      default:
        return "Bell";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card id="parcego-shopify-alerts-section">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Alerts
          </div>
          {alertCount !== undefined && alertCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alertCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Issues and notifications that need your attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : alerts && alerts.alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.alerts.map((alert) => (
              <Alert
                key={alert.id}
                id={`parcego-shopify-alert-${alert.id}`}
                className={getAlertColor(alert.type)}
              >
                <Icon
                  name={getAlertIcon(alert.type)}
                  size={16}
                  className="mt-0.5"
                  aria-hidden="true"
                />
                <AlertTitle className="text-sm font-semibold mb-1">
                  {alert.title}
                </AlertTitle>
                <AlertDescription className="text-sm mb-2">
                  {alert.description}
                </AlertDescription>
                {alert.action_text && alert.action_url && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      id={`parcego-shopify-alert-action-${alert.id}`}
                    >
                      <Link href={alert.action_url}>
                        {alert.action_text}
                        <Icon name="ArrowRight" size={14} className="ml-1" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                )}
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">All clear!</p>
            <p className="text-xs text-gray-400 mt-1">No alerts at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

