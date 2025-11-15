"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ShopifyAccount } from "@/lib/api/types";
import Link from "next/link";

interface ShopifyConnectedStoresProps {
  stores: ShopifyAccount[];
  isLoading: boolean;
  error: string | null;
}

export function ShopifyConnectedStores({
  stores,
  isLoading,
  error,
}: ShopifyConnectedStoresProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            Error
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatLastSync = (lastSyncAt: string | null | undefined) => {
    if (!lastSyncAt) return "Never synced";
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card id="parcego-shopify-connected-stores">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Store" size={20} />
          Connected Stores
        </CardTitle>
        <CardDescription>
          Manage your connected Shopify stores and monitor their status
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : stores.length > 0 ? (
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                id={`parcego-shopify-store-${store.id}`}
                className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {store.shop_name || store.shop_domain}
                      </h4>
                      {getStatusBadge(store.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{store.shop_domain}</p>
                    {store.last_sync_at && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Icon name="Clock" size={12} aria-hidden="true" />
                        Last synced: {formatLastSync(store.last_sync_at)}
                      </p>
                    )}
                  </div>
                </div>
                {store.error_message && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription className="text-sm">
                      {store.error_message}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    id={`parcego-shopify-store-sync-${store.id}`}
                  >
                    <Link href={`/profile?tab=api&sync=${store.id}`}>
                      <Icon name="RefreshCw" size={14} className="mr-1" aria-hidden="true" />
                      Sync
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    id={`parcego-shopify-store-manage-${store.id}`}
                  >
                    <Link href="/profile?tab=api">
                      <Icon name="Settings" size={14} className="mr-1" aria-hidden="true" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Store" size={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium mb-1">No stores connected</p>
            <p className="text-xs text-gray-400 mb-4">
              Connect your first Shopify store to get started
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile?tab=api">
                <Icon name="Plus" size={14} className="mr-1" aria-hidden="true" />
                Connect Store
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

