"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { ShopifyActivityResponse } from "@/lib/api/types";

interface ShopifyActivityFeedProps {
  activity: ShopifyActivityResponse | null;
  isLoading: boolean;
  error: string | null;
  onLoadMore?: () => void;
}

export function ShopifyActivityFeed({
  activity,
  isLoading,
  error,
  onLoadMore,
}: ShopifyActivityFeedProps) {
  if (error) {
    return (
      <Card id="parcego-shopify-activity-feed">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "order_processed":
        return "CheckCircle";
      case "order_failed":
        return "AlertCircle";
      case "shipment_created":
        return "Package";
      case "sync_completed":
        return "RefreshCw";
      default:
        return "Info";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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
    <Card id="parcego-shopify-activity-feed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" size={20} />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest order processing and integration events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activity && activity.events.length > 0 ? (
          <div className="space-y-4">
            {activity.events.map((event) => (
              <div
                key={event.id}
                id={`parcego-shopify-activity-event-${event.id}`}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <div
                  className={`p-2 rounded-full ${
                    event.status_color === "green"
                      ? "bg-green-100"
                      : event.status_color === "red"
                      ? "bg-red-100"
                      : event.status_color === "yellow"
                      ? "bg-yellow-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    name={getEventIcon(event.event_type)}
                    size={20}
                    className={
                      event.status_color === "green"
                        ? "text-green-600"
                        : event.status_color === "red"
                        ? "text-red-600"
                        : event.status_color === "yellow"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                    <Badge
                      variant={
                        event.status_color === "green"
                          ? "default"
                          : event.status_color === "red"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {event.event_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon name="Store" size={12} aria-hidden="true" />
                      {event.store_domain}
                    </span>
                    {event.tracking_code && (
                      <span className="flex items-center gap-1">
                        <Icon name="Package" size={12} aria-hidden="true" />
                        {event.tracking_code}
                      </span>
                    )}
                    {event.order_amount && (
                      <span className="flex items-center gap-1">
                        <Icon name="DollarSign" size={12} aria-hidden="true" />
                        ${event.order_amount.toFixed(2)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={12} aria-hidden="true" />
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {activity.has_more && onLoadMore && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  className="w-full"
                  id="parcego-shopify-activity-load-more-btn"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Inbox" size={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No activity to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

