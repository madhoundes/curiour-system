"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ShopifyDashboardSummaryResponse,
  ShopifyQuickStatsResponse,
} from "@/lib/api/types";

interface ShopifySummaryStatsProps {
  summary: ShopifyDashboardSummaryResponse | null;
  quickStats: ShopifyQuickStatsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function ShopifySummaryStats({
  summary,
  quickStats,
  isLoading,
  error,
}: ShopifySummaryStatsProps) {
  if (error) {
    return (
      <Alert variant="destructive" id="parcego-shopify-summary-stats-error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const stats = [
    {
      title: "Orders Today",
      value: summary?.orders_today || quickStats?.orders_today || 0,
      icon: "ShoppingBag",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      id: "parcego-shopify-stat-orders-today",
    },
    {
      title: "Orders This Week",
      value: summary?.orders_this_week || 0,
      icon: "Calendar",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      id: "parcego-shopify-stat-orders-week",
    },
    {
      title: "Pending Orders",
      value: summary?.orders_pending || quickStats?.orders_pending || 0,
      icon: "Clock",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      id: "parcego-shopify-stat-orders-pending",
    },
    {
      title: "Failed Orders",
      value: summary?.orders_failed || quickStats?.orders_failed || 0,
      icon: "AlertCircle",
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      id: "parcego-shopify-stat-orders-failed",
    },
    {
      title: "Connected Stores",
      value: summary?.connected_stores || quickStats?.stores_connected || 0,
      icon: "Store",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      id: "parcego-shopify-stat-stores-connected",
    },
    {
      title: "Active Stores",
      value: summary?.active_stores || 0,
      icon: "CheckCircle",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      id: "parcego-shopify-stat-stores-active",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" id="parcego-shopify-summary-stats">
      {stats.map((stat) => (
        <Card key={stat.id} id={stat.id} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon
                      name={stat.icon}
                      size={20}
                      className={stat.iconColor}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

