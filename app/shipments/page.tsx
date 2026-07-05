"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { formatCurrency } from "@/lib/mock/shipments";
import { ShippingService } from "@/lib/api/shipping";
import type { DetailedShipment, ShipmentStatus } from "@/lib/api/types";
import PrintLabelsModal from "./print-labels-modal";
import CancelShipmentDialog from "./cancel-shipment-dialog";

// Function to get status badge styling based on shipment status
const getStatusBadge = (status: ShipmentStatus) => {
  const statusConfig = {
    DELIVERED: {
      variant: "default" as const,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      label: "Delivered",
      icon: "CheckCircle"
    },
    IN_TRANSIT: {
      variant: "secondary" as const,
      className: "bg-blue-50 text-blue-800 border-blue-200",
      label: "In Transit",
      icon: "Truck"
    },
    LABEL_CREATED: {
      variant: "outline" as const,
      className: "bg-slate-50 text-slate-700 border-slate-300",
      label: "Label Created",
      icon: "FileText"
    },
    SCANNED: {
      variant: "outline" as const,
      className: "bg-indigo-50 text-indigo-800 border-indigo-200",
      label: "Scanned",
      icon: "Scan"
    },
    OUT_FOR_DELIVERY: {
      variant: "secondary" as const,
      className: "bg-amber-50 text-amber-800 border-amber-200",
      label: "Out for Delivery",
      icon: "Package"
    },
    FAILED: {
      variant: "destructive" as const,
      className: "bg-red-50 text-red-800 border-red-200",
      label: "Failed",
      icon: "XCircle"
    },
    CANCELLED: {
      variant: "destructive" as const,
      className: "bg-gray-50 text-gray-700 border-gray-300",
      label: "Cancelled",
      icon: "X"
    },
    DRAFT: {
      variant: "outline" as const,
      className: "bg-gray-50 text-gray-600 border-gray-200",
      label: "Draft",
      icon: "Edit"
    },
    PAID: {
      variant: "default" as const,
      className: "bg-green-50 text-green-800 border-green-200",
      label: "Paid",
      icon: "DollarSign"
    },
    PENDING_PAYMENT: {
      variant: "outline" as const,
      className: "bg-yellow-50 text-yellow-800 border-yellow-200",
      label: "Pending Payment",
      icon: "Clock"
    },
    LABEL_GENERATED: {
      variant: "outline" as const,
      className: "bg-purple-50 text-purple-800 border-purple-200",
      label: "Label Generated",
      icon: "FileText"
    },
    PICKED_UP: {
      variant: "secondary" as const,
      className: "bg-blue-50 text-blue-800 border-blue-200",
      label: "Picked Up",
      icon: "Package"
    },
    IN_WAREHOUSE: {
      variant: "secondary" as const,
      className: "bg-indigo-50 text-indigo-800 border-indigo-200",
      label: "In Warehouse",
      icon: "Warehouse"
    },
    UNDELIVERED: {
      variant: "destructive" as const,
      className: "bg-orange-50 text-orange-800 border-orange-200",
      label: "Undelivered",
      icon: "AlertTriangle"
    }
  };

  return statusConfig[status] || statusConfig.LABEL_CREATED;
};

export default function ShipmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data loading state for consistent SSR/CSR
  const [shipments, setShipments] = useState<DetailedShipment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintLabelsModal, setShowPrintLabelsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [shipmentToCancel, setShipmentToCancel] = useState<{ id: number; tracking_code: string } | null>(null);
  const [processingPaymentForId, setProcessingPaymentForId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  // 1-indexed to match the backend contract (page=1 is the first page).
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalShipments, setTotalShipments] = useState<number>(0);
  // When the user is searching the page acts as a filtered results view; the
  // backend search endpoint doesn't paginate so we expose a "no pagination"
  // mode in that case.
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

  const shippingService = new ShippingService();

  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // Whenever the search query or page size changes, snap back to page 1.
  React.useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [pageSize, query]);

  const loadShipments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const trimmed = query.trim();

      if (trimmed) {
        // Search endpoint returns all matches for tracking code, shipment ID,
        // or Shopify order name/ID. Treat the result as a one-page view.
        const results = await shippingService.searchShipments(trimmed);

        setShipments(results);
        setTotalShipments(results.length);
        setTotalPages(1);
        setIsSearchMode(true);
      } else {
        const response = await shippingService.getShipmentsPaginated({
          page,
          per_page: pageSize,
        });

        setShipments(response.shipments);
        setTotalShipments(response.total);
        setTotalPages(Math.max(1, response.total_pages));
        setIsSearchMode(false);
      }

      setIsDataLoaded(true);
    } catch (err: any) {
      console.error('Failed to load shipments:', err);
      setError(err.message || 'Failed to load shipments');
      setShipments([]);
      setTotalShipments(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
    // ``shippingService`` is a fresh instance each render but its methods
    // are stateless, so it's safe to leave out of the dep array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query]);

  React.useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllVisible = (ids: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleCancelShipment = async (shipmentId: number) => {
    try {
      await shippingService.updateShipmentStatus(shipmentId, {
        status: "CANCELLED",
        change_reason: "Cancelled by user"
      });

      await loadShipments();
      alert(`Shipment ${shipmentId} has been cancelled successfully.`);
    } catch (error: any) {
      console.error("Failed to cancel shipment:", error);
      alert(`Failed to cancel shipment ${shipmentId}. ${error.message || 'Please try again.'}`);
    }
  };

  const openCancelDialog = (shipment: DetailedShipment) => {
    setShipmentToCancel({ id: shipment.id, tracking_code: shipment.tracking_code });
    setShowCancelDialog(true);
  };

  const handleExportCsv = () => {
    // Export operates on what is currently visible (the current page from the
    // server). The user can adjust ``per_page`` if they want a bigger export.
    const dataToExport = exportType === "selected"
      ? shipments.filter(s => selectedIds.has(s.id))
      : shipments;

    // Validate that we have data to export
    if (!dataToExport || dataToExport.length === 0) {
      console.warn("No data to export");
      alert("No data available for export");
      return;
    }
    
    const rows = dataToExport.map((s) => ({
      id: s.id,
      trackingNumber: s.tracking_code,
      shopifyOrderNumber: s.shopify_order_number ?? '',
      date: s.created_at,
      recipient: s.receiver_address.contact_name,
      service: 'Standard', // Default service since it's not in DetailedShipment
      courier: "Parcego",
      weight: s.package.weight,
      cost: s.billing?.amount || 'N/A',
      status: s.status,
    }));
    const header = Object.keys(rows[0] ?? {}).join(",");
    const body = rows.map((r) => Object.values(r).join(",")).join("\n");
    const csv = [header, body].filter(Boolean).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportType === "selected" ? `selected_shipments_export.csv` : `shipments_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Close dialog and reset state
    setShowExportDialog(false);
    setExportType("all");
  };

  const handleExportCsvClick = (type: "all" | "selected") => {
    setExportType(type);
    setShowExportDialog(true);
  };

  // The server already filtered, sorted, and paginated this list – the
  // previous client-side re-slice/sort was both wrong (only operated on the
  // current page) and contradicted the backend order.
  const visibleIds = useMemo(() => shipments.map((s) => s.id), [shipments]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  // Calculate selection counts for real-time display
  const selectedCount = selectedIds.size;
  const selectedOnPageCount = shipments.filter(s => selectedIds.has(s.id)).length;

  // Real-time export message calculation. Export operates on the current page
  // so the count matches what the user can actually see.
  const getExportMessage = () => {
    if (exportType === "selected") {
      if (selectedOnPageCount === 0) {
        return "⚠️ No shipments are currently selected. Please select shipments first.";
      }
      return `This will export ${selectedOnPageCount} selected shipment${selectedOnPageCount === 1 ? '' : 's'} to a CSV file.`;
    }
    return `This will export ${shipments.length} shipment${shipments.length === 1 ? '' : 's'} from the current page to a CSV file.`;
  };

  // Handle payment for a single draft shipment (same flow as creating new shipment)
  const handlePaymentForShipment = async (shipmentId: number) => {
    setProcessingPaymentForId(shipmentId);
    
    try {
      // Find the shipment in the currently rendered page
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) {
        throw new Error('Shipment not found');
      }

      if (shipment.status !== "DRAFT") {
        throw new Error('Only draft shipments can be paid');
      }

      console.log('Processing payment for draft shipment:', shipment.id);
      
      // Step 1: Get or create billing record
      let billingId: number;
      
      // First, reload shipment data to get updated billing info (in case billing was created in previous attempt)
      try {
        const updatedShipment = await shippingService.getShipment(shipment.id);
        if (updatedShipment.billing && updatedShipment.billing.id) {
          billingId = updatedShipment.billing.id;
          console.log('Using existing billing ID from shipment:', billingId);
        } else {
          // Billing doesn't exist, create it
          console.log('Creating new billing record for shipment:', shipment.id);
          try {
            const billing = await shippingService.createBilling({
              shipment_id: shipment.id
            });
            billingId = billing.id;
            console.log('Created billing with ID:', billingId);
          } catch (createErr: any) {
            // If billing creation fails because it already exists, fetch it
            const errorMessage = createErr.message || createErr.details || '';
            const isAlreadyExists = errorMessage.includes('already exists') || 
                                   createErr.response?.status === 400 ||
                                   createErr.status === 400;
            
            if (isAlreadyExists) {
              console.log('Billing already exists, fetching billing records...');

              // Re-check shipment details first; backend may have attached billing after create attempt.
              const refreshedShipment = await shippingService.getShipment(shipment.id);
              if (refreshedShipment.billing?.id) {
                billingId = refreshedShipment.billing.id;
                console.log('Found existing billing ID from refreshed shipment:', billingId);
              } else {
                // Fallback: paginate billing records until we find the shipment billing record.
                let currentPage = 1;
                let foundBillingId: number | null = null;

                while (!foundBillingId && currentPage <= 50) {
                  const billingRecords = await shippingService.getBillingRecords({ page: currentPage, per_page: 100 });
                  const existingBilling = billingRecords.items?.find((b) => b.shipment_id === shipment.id);

                  if (existingBilling) {
                    foundBillingId = existingBilling.id;
                    break;
                  }

                  if (!billingRecords.has_next || currentPage >= billingRecords.pages) {
                    break;
                  }
                  currentPage += 1;
                }

                if (foundBillingId) {
                  billingId = foundBillingId;
                  console.log('Found existing billing ID via paginated lookup:', billingId);
                } else {
                  throw new Error('Billing exists but could not be found');
                }
              }
            } else {
              throw createErr;
            }
          }
        }
      } catch (err: any) {
        console.error('Error handling billing:', err);
        throw new Error(`Failed to get or create billing: ${err.message || 'Unknown error'}`);
      }
      
      // Step 2: Create checkout session (same as new shipment flow)
      console.log('Creating checkout session for billing ID:', billingId);
      const checkoutSession = await shippingService.createCheckoutSession(billingId);
      console.log('Checkout session created:', checkoutSession);
      console.log('Client secret:', checkoutSession.client_secret);
      
      // Step 3: Redirect to checkout URL (same as new shipment flow)
      if (!checkoutSession) {
        console.error('Checkout session is null or undefined');
        throw new Error('Failed to create checkout session - no response received');
      }

      if (checkoutSession.client_secret) {
        console.log('Using client_secret, redirecting to purchase-label page');
        // Handle Stripe Elements payment form if needed
        sessionStorage.setItem('parcego_checkout_session', JSON.stringify(checkoutSession));
        sessionStorage.setItem('parcego_payment_shipment_id', String(shipment.id));
        setTimeout(() => {
          router.push(`/purchase-label?shipment_id=${shipment.id}`);
        }, 100);
        return;
      } else {
        console.error('Invalid checkout session response:', checkoutSession);
        console.error('Response keys:', Object.keys(checkoutSession || {}));
        throw new Error(`No valid checkout session received. Response: ${JSON.stringify(checkoutSession)}`);
      }
      
    } catch (error: any) {
      console.error("Payment processing failed:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        response: error.response?.data,
        status: error.response?.status || error.status
      });
      
      const errorMessage = error.details || error.message || 'Unknown error';
      alert(`Failed to process payment: ${errorMessage}`);
      setProcessingPaymentForId(null);
    }
  };

  // Update table title based on selection state. ``totalShipments`` reflects
  // the count the server reports (so the user knows there are more pages),
  // while ``shipments.length`` is just what's on this page.
  const getTableTitle = () => {
    const pageInfo = isSearchMode
      ? `Showing ${shipments.length} search result${shipments.length === 1 ? '' : 's'}`
      : `Showing ${shipments.length} of ${totalShipments} shipments`;

    if (selectedCount === 0) {
      return pageInfo;
    }
    return `${pageInfo} (${selectedCount} selected)`;
  };

  // Early return for loading state
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Shipments"
          description="Manage and track all your shipments in one place"
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Icon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Shipments</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                <Icon name="RefreshCw" className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Shipments"
        description="Manage and track all your shipments in one place"
      />

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Search by tracking code, shipment ID, or Shopify order..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              id="parcego-shipments-search-input"
              aria-label="Search shipments by tracking code, shipment ID, or Shopify order"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Icon name="Loader2" className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div id="parcego-shipments-bulk" className="mb-4" aria-live="polite">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportCsvClick("selected")} 
                  disabled={selectedIds.size === 0}
                  aria-label="Export selected"
                >
                  <Icon name="FileDown" size={16} className="mr-2" /> Export
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintLabelsModal(true)} 
                  disabled={selectedIds.size === 0}
                  aria-label="Print labels"
                >
                  <Icon name="Printer" size={16} className="mr-2" /> Print Labels
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  aria-label="Cancel selected shipments"
                >
                  <Icon name="XCircle" size={16} className="mr-2" /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card id="parcego-shipments-table">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>
            {getTableTitle()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <input
                      id="parcego-shipments-select-all"
                      type="checkbox"
                      aria-label="Select all visible"
                      checked={allVisibleSelected}
                      onChange={() => handleToggleSelectAllVisible(visibleIds)}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Shipment ID</th>
                  <th className="px-3 py-2 text-left">Shopify Order</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Recipient</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">Courier</th>
                  <th className="px-3 py-2 text-left">Weight</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Cost</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <tr key={s.id} className="border-t hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 py-2">
                        <input
                          id={`parcego-shipments-rowchk-${s.id}`}
                          type="checkbox"
                          aria-label={`Select shipment ${s.id}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">{s.id}</td>
                      <td className="px-3 py-2 text-gray-700">
                        {s.shopify_order_number ?? "—"}
                      </td>
                      <td className="px-3 py-2">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{s.receiver_address.contact_name}</td>
                      <td className="px-3 py-2">Standard</td>
                      <td className="px-3 py-2">Parcego</td>
                      <td className="px-3 py-2">{s.package.weight.toFixed(2)} kg</td>
                      <td className="px-3 py-2">
                        {(() => {
                          const badgeConfig = getStatusBadge(s.status as ShipmentStatus);
                          return (
                            <Badge 
                              variant={badgeConfig.variant}
                              className={badgeConfig.className}
                              aria-label={`Status: ${badgeConfig.label}`}
                            >
                              <Icon name={badgeConfig.icon} size={14} className="mr-1" />
                              {badgeConfig.label}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2">{s.billing ? formatCurrency(parseFloat(s.billing.amount)) : 'N/A'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {/* Pay Button for DRAFT shipments */}
                          {s.status === "DRAFT" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    id={`parcego-shipments-pay-${s.id}`}
                                    onClick={() => handlePaymentForShipment(s.id)}
                                    disabled={processingPaymentForId === s.id}
                                    aria-label={`Pay for shipment ${s.id}`}
                                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors duration-150"
                                  >
                                    {processingPaymentForId === s.id ? (
                                      <Icon name="Loader2" size={16} className="animate-spin" />
                                    ) : (
                                      <Icon name="CreditCard" size={16} />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-black [&>svg]:fill-black [&>svg]:stroke-black">
                                  <p>Pay for this shipment</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* Edit Button for DRAFT shipments, View Button for others */}
                          {s.status === "DRAFT" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    id={`parcego-shipments-edit-${s.id}`}
                                    onClick={() => router.push(`/shipments/${encodeURIComponent(s.id)}`)}
                                    aria-label={`Edit shipment ${s.id}`}
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                                  >
                                    <Icon name="Edit" size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-black [&>svg]:fill-black [&>svg]:stroke-black">
                                  <p>Edit shipment</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    id={`parcego-shipments-view-${s.id}`}
                                    onClick={() => router.push(`/shipments/${encodeURIComponent(s.id)}`)}
                                    aria-label={`View details for ${s.id}`}
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                                  >
                                    <Icon name="Eye" size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-black [&>svg]:fill-black [&>svg]:stroke-black">
                                  <p>View shipment details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* Cancel Shipment Button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  id={`parcego-shipments-cancel-${s.id}`}
                                  onClick={() => openCancelDialog(s)}
                                  aria-label={`Cancel shipment ${s.id}`}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                                  disabled={s.status === "CANCELLED" || s.status === "DELIVERED"}
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white border-black [&>svg]:fill-black [&>svg]:stroke-black">
                                <p>
                                  {s.status === "CANCELLED" 
                                    ? "Shipment already cancelled" 
                                    : s.status === "DELIVERED"
                                    ? "Cannot cancel delivered shipments"
                                    : "Cancel this shipment"
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>


                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination – hidden in search mode since the backend search returns
          a single best match without pagination. */}
      {!isSearchMode && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
            {totalShipments > 0 && (
              <span className="ml-2 text-gray-400">({totalShipments} total)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              aria-label="Results per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
              disabled={isLoading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              disabled={page <= 1 || isLoading}
              aria-label="Previous page"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
              disabled={page >= totalPages || isLoading}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Export CSV Confirmation Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent 
          id="parcego-export-csv-dialog"
          key={`export-dialog-${selectedOnPageCount}-${exportType}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Export Shipments to CSV</AlertDialogTitle>
            <AlertDialogDescription>
              {getExportMessage()}
              <br /><br />
              The file will include shipment ID, tracking number, date, recipient, service, courier, weight, cost, and status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="parcego-export-csv-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExportCsv}
              id="parcego-export-csv-confirm-btn"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              disabled={exportType === "selected" && selectedOnPageCount === 0}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Export CSV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Cancel Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent id="parcego-cancel-shipments-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Selected Shipments</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status of {selectedIds.size} selected shipment{selectedIds.size === 1 ? '' : 's'} to <strong>Cancelled</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="parcego-cancel-shipments-cancel-btn">Close</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const ids = Array.from(selectedIds);
                  // Backend does not support DELETE; mark as CANCELLED instead
                  for (const id of ids) {
                    try {
                      await shippingService.updateShipmentStatus(id, {
                        status: 'CANCELLED',
                        change_reason: 'Deleted by user from list'
                      });
                    } catch (innerErr) {
                      console.warn('Failed to cancel shipment', id, innerErr);
                    }
                  }
                  setSelectedIds(new Set());
                  setShowDeleteDialog(false);
                  await loadShipments();
                } catch (e: any) {
                  alert(e?.message || 'Failed to update shipment status');
                } finally {
                  setIsLoading(false);
                }
              }}
              id="parcego-cancel-shipments-confirm-btn"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <Icon name="XCircle" size={16} className="mr-2" />
              Cancel Shipments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Labels Modal – passes the current page; the modal already
          fetches full label data per ID, so this is fine even when selection
          spans pages. */}
      <PrintLabelsModal
        open={showPrintLabelsModal}
        onOpenChange={setShowPrintLabelsModal}
        selectedShipmentIds={Array.from(selectedIds)}
        shipments={shipments}
      />

      {/* Cancel Shipment Dialog */}
      {shipmentToCancel && (
        <CancelShipmentDialog
          shipmentId={shipmentToCancel.id}
          trackingNumber={shipmentToCancel.tracking_code}
          onCancel={handleCancelShipment}
          isOpen={showCancelDialog}
          onOpenChange={setShowCancelDialog}
        />
      )}

    </div>
  );
}


