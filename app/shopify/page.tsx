"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shopifyService } from "@/lib/api/shopify";
import type {
  ShopifyDashboardSummaryResponse,
  ShopifyActivityResponse,
  ShopifyAlertsResponse,
  ShopifyQuickStatsResponse,
} from "@/lib/api/types";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import components (we'll create these)
import { ShopifySummaryStats } from "@/components/shopify/shopify-summary-stats";
import { ShopifyActivityFeed } from "@/components/shopify/shopify-activity-feed";
import { ShopifyAlertsSection } from "@/components/shopify/shopify-alerts-section";
import { ShopifyConnectedStores } from "@/components/shopify/shopify-connected-stores";

export default function ShopifyDashboardPage() {
  const router = useRouter();
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loading states
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isLoadingQuickStats, setIsLoadingQuickStats] = useState(true);

  // Data states
  const [summary, setSummary] = useState<ShopifyDashboardSummaryResponse | null>(null);
  const [activity, setActivity] = useState<ShopifyActivityResponse | null>(null);
  const [alerts, setAlerts] = useState<ShopifyAlertsResponse | null>(null);
  const [quickStats, setQuickStats] = useState<ShopifyQuickStatsResponse | null>(null);

  // Error states
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [quickStatsError, setQuickStatsError] = useState<string | null>(null);

  // Load dashboard summary
  const loadSummary = async () => {
    try {
      setIsLoadingSummary(true);
      setSummaryError(null);
      const response = await shopifyService.getDashboardSummary();
      setSummary(response.data);
    } catch (error: any) {
      console.error("Failed to load Shopify dashboard summary:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard summary";
      setSummaryError(errorMsg);
      
      // Check for authentication errors
      if (error.status === 401 || error.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        router.push("/login");
        return;
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Load activity feed
  const loadActivity = async (limit = 20, offset = 0) => {
    try {
      setIsLoadingActivity(true);
      setActivityError(null);
      const response = await shopifyService.getDashboardActivity({ limit, offset });
      setActivity(response.data);
    } catch (error: any) {
      console.error("Failed to load Shopify activity:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load activity feed";
      setActivityError(errorMsg);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  // Load alerts
  const loadAlerts = async () => {
    try {
      setIsLoadingAlerts(true);
      setAlertsError(null);
      const response = await shopifyService.getDashboardAlerts();
      setAlerts(response.data);
    } catch (error: any) {
      console.error("Failed to load Shopify alerts:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load alerts";
      setAlertsError(errorMsg);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Load quick stats
  const loadQuickStats = async () => {
    try {
      setIsLoadingQuickStats(true);
      setQuickStatsError(null);
      const response = await shopifyService.getDashboardQuickStats();
      setQuickStats(response.data);
    } catch (error: any) {
      console.error("Failed to load Shopify quick stats:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to load quick stats";
      setQuickStatsError(errorMsg);
    } finally {
      setIsLoadingQuickStats(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadSummary();
    loadActivity();
    loadAlerts();
    loadQuickStats();
  }, []);

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([
      loadSummary(),
      loadActivity(),
      loadAlerts(),
      loadQuickStats(),
    ]);
    toast.success("Dashboard refreshed");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <PageHeader
          title="Shopify Integration Dashboard"
          description="Monitor your Shopify store connections, order processing, and integration health"
        />

        {/* Action Bar */}
        <div
          className={`mb-6 flex items-center justify-between ${
            prefersReducedMotion ? "" : "animate-in fade-in slide-in-from-bottom-1 duration-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingSummary || isLoadingActivity || isLoadingAlerts}
              aria-label="Refresh dashboard data"
              id="parcego-shopify-dashboard-refresh-btn"
            >
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          className={`grid grid-cols-1 gap-6 lg:grid-cols-3 ${
            prefersReducedMotion ? "" : "animate-in fade-in slide-in-from-bottom-2 duration-300"
          }`}
        >
          {/* Left Column - Main Stats and Stores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Stats */}
            <ShopifySummaryStats
              summary={summary}
              quickStats={quickStats}
              isLoading={isLoadingSummary || isLoadingQuickStats}
              error={summaryError || quickStatsError}
            />

            {/* Connected Stores */}
            <ShopifyConnectedStores
              stores={summary?.stores || []}
              isLoading={isLoadingSummary}
              error={summaryError}
            />

            {/* Activity Feed */}
            <ShopifyActivityFeed
              activity={activity}
              isLoading={isLoadingActivity}
              error={activityError}
              onLoadMore={() => {
                if (activity && activity.has_more) {
                  loadActivity(20, activity.events.length);
                }
              }}
            />
          </div>

          {/* Right Column - Alerts and Quick Info */}
          <div className="space-y-6">
            {/* Alerts Section */}
            <ShopifyAlertsSection
              alerts={alerts}
              isLoading={isLoadingAlerts}
              error={alertsError}
              alertCount={summary?.alert_count}
            />

            {/* Quick Info Card */}
            <Card id="parcego-shopify-dashboard-quick-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={20} />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSummary ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : summary ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Sync</span>
                      <span className="font-medium">
                        {summary.last_sync_at
                          ? new Date(summary.last_sync_at).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                    {summary.next_sync_in_minutes !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next Sync</span>
                        <span className="font-medium">
                          In {summary.next_sync_in_minutes} minutes
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Processed</span>
                      <span className="font-medium">
                        {summary.total_orders_processed.toLocaleString()} orders
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

