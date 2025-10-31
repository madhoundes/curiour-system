"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

// Status options for the select dropdown
const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "LABEL_CREATED", label: "Label Created" },
  { value: "SCANNED", label: "Scanned" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DRAFT", label: "Draft" },
  { value: "PAID", label: "Paid" },
];

export default function ShipmentsPage() {
  const router = useRouter();
  
  // Data loading state for consistent SSR/CSR
  const [allShipments, setAllShipments] = useState<DetailedShipment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintLabelsModal, setShowPrintLabelsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [shipmentToCancel, setShipmentToCancel] = useState<{ id: number; tracking_code: string } | null>(null);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [shipmentToReorder, setShipmentToReorder] = useState<DetailedShipment | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageIndex, setPageIndex] = useState<number>(0);
  
  const shippingService = new ShippingService();

  // Load shipments data from API
  React.useEffect(() => {
    const loadShipments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let shipments: DetailedShipment[];
        
        if (query.trim()) {
          const raw = query.trim();
          const isId = /^\d+$/.test(raw);
          const isTracking = /^[A-Za-z0-9-]{1,50}$/.test(raw);
          if (!isId && !isTracking) {
            const listParams: any = { skip: pageIndex * pageSize, limit: pageSize };
            if (selectedStatus !== 'ALL') listParams.status = selectedStatus;
            const listResp = await shippingService.getShipments(listParams);
            const q = raw.toLowerCase();
            shipments = listResp.filter(s => s.tracking_code?.toLowerCase().includes(q) || String(s.id).includes(q));
          } else {
            // Use search API when there's a search query, with graceful fallback
            try {
              shipments = await shippingService.searchShipments(raw, {
                skip: pageIndex * pageSize,
                limit: pageSize
              });
            } catch (searchErr: any) {
              console.warn('Search API failed, falling back to list+client filter:', searchErr);
              const listParams: any = { skip: pageIndex * pageSize, limit: pageSize };
              if (selectedStatus !== 'ALL') listParams.status = selectedStatus;
              const listResp = await shippingService.getShipments(listParams);
              const q = raw.toLowerCase();
              shipments = listResp.filter(s => s.tracking_code?.toLowerCase().includes(q) || String(s.id).includes(q));
            }
          }
        } else {
          // Use list API for normal loading
          const params: any = {
            skip: pageIndex * pageSize,
            limit: pageSize
          };
          
          if (selectedStatus !== "ALL") {
            params.status = selectedStatus;
          }
          
          shipments = await shippingService.getShipments(params);
        }
        
        setAllShipments(shipments);
        setIsDataLoaded(true);
      } catch (err: any) {
        console.error('Failed to load shipments:', err);
        setError(err.message || 'Failed to load shipments');
        setAllShipments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadShipments();
  }, [query, selectedStatus, pageIndex, pageSize]);

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
      // Use the API to update shipment status to CANCELLED
      await shippingService.updateShipmentStatus(shipmentId, {
        status: "CANCELLED",
        change_reason: "Cancelled by user"
      });
      
      // Reload the shipments data to reflect the change
      const loadShipments = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          let shipments: DetailedShipment[];
          
          if (query.trim()) {
            shipments = await shippingService.searchShipments(query, {
              skip: pageIndex * pageSize,
              limit: pageSize
            });
          } else {
            const params: any = {
              skip: pageIndex * pageSize,
              limit: pageSize
            };
            
            if (selectedStatus !== "ALL") {
              params.status = selectedStatus;
            }
            
            shipments = await shippingService.getShipments(params);
          }
          
          setAllShipments(shipments);
        } catch (err: any) {
          console.error('Failed to reload shipments:', err);
          setError(err.message || 'Failed to reload shipments');
        } finally {
          setIsLoading(false);
        }
      };
      
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

  // Enhanced reorder functionality with better UX
  const handleReorderShipment = async (shipment: DetailedShipment) => {
    setShipmentToReorder(shipment);
    setShowReorderDialog(true);
  };

  const confirmReorder = async () => {
    if (!shipmentToReorder) return;

    setIsReordering(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to create shipment with pre-filled data
      const queryParams = new URLSearchParams({
        from: shipmentToReorder.id.toString(),
        recipient: shipmentToReorder.receiver_address.contact_name,
        address: shipmentToReorder.receiver_address.street_address,
        city: shipmentToReorder.receiver_address.city,
        province: shipmentToReorder.receiver_address.province || '',
        postalCode: shipmentToReorder.receiver_address.postal_code,
        country: shipmentToReorder.receiver_address.country,
        service: 'standard', // Default service since it's not in DetailedShipment
        weight: shipmentToReorder.package.weight.toString(),
        notes: `Reordered from shipment ${shipmentToReorder.tracking_code}`
      });

      router.push(`/create-shipment?${queryParams.toString()}`);
      
      // Close dialog and reset state
      setShowReorderDialog(false);
      setShipmentToReorder(null);
      
    } catch (error) {
      console.error("Failed to reorder shipment:", error);
      alert("Failed to reorder shipment. Please try again.");
    } finally {
      setIsReordering(false);
    }
  };

  const handleExportCsv = () => {
    let dataToExport;
    
    if (exportType === "selected") {
      // Export only selected shipments from filtered results (respects current filters)
      dataToExport = filtered.filter(s => selectedIds.has(s.id));
      console.log(`Exporting ${dataToExport.length} selected shipments out of ${selectedIds.size} selected IDs`);
    } else {
      // Export all filtered shipments (current page + filters)
      dataToExport = filtered;
      console.log(`Exporting ${dataToExport.length} filtered shipments`);
    }
    
    // Validate that we have data to export
    if (!dataToExport || dataToExport.length === 0) {
      console.warn("No data to export");
      alert("No data available for export");
      return;
    }
    
    const rows = dataToExport.map((s) => ({
      id: s.id,
      trackingNumber: s.tracking_code,
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

  const filtered = useMemo(() => {
    if (!isDataLoaded || !Array.isArray(allShipments) || allShipments.length === 0) return [];
    
    let list = allShipments.slice();
    // Client-side filter fallback to ensure UX even if backend ignores params
    if (selectedStatus !== 'ALL') {
      list = list.filter(s => (s.status?.toUpperCase?.() || s.status) === selectedStatus);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(s => s.tracking_code?.toLowerCase().includes(q) || String(s.id).includes(q));
    }
    // Sort: most recent first
    list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return list;
  }, [allShipments, isDataLoaded, selectedStatus, query]);

  // Log selection changes for debugging (removed empty effect to prevent warnings)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Selection updated:', {
        selectedCount: selectedIds.size,
        filteredCount: filtered.length,
        exportType
      });
    }
  }, [selectedIds, filtered, exportType]);

  const paged = useMemo(() => {
    const start = pageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  const visibleIds = paged.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  // Calculate selection counts for real-time display
  const selectedCount = selectedIds.size;
  const totalFilteredCount = filtered.length;
  const selectedInFilteredCount = filtered.filter(s => selectedIds.has(s.id)).length;

  // Real-time export message calculation
  const getExportMessage = () => {
    if (exportType === "selected") {
      if (selectedInFilteredCount === 0) {
        return "⚠️ No shipments are currently selected. Please select shipments first.";
      }
      return `This will export ${selectedInFilteredCount} selected shipment${selectedInFilteredCount === 1 ? '' : 's'} to a CSV file.`;
    } else {
      return `This will export ${filtered.length} filtered shipment${filtered.length === 1 ? '' : 's'} to a CSV file.`;
    }
  };

  // Update table title based on selection state
  const getTableTitle = () => {
    if (selectedCount === 0) {
      return `Showing ${paged.length} of ${totalFilteredCount} shipments`;
    } else {
      return `Showing ${selectedInFilteredCount} of ${totalFilteredCount} shipments (${selectedCount} selected)`;
    }
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by tracking code or shipment ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                id="parcego-shipments-search-input"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Icon name="Loader2" className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div id="parcego-shipments-bulk" className="mb-4" aria-live="polite">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2">
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
                {paged.map((s) => {
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
                          {/* View Details Button */}
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

                          {/* Enhanced Reorder/Resend Button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  id={`parcego-shipments-reorder-${s.id}`}
                                  onClick={() => handleReorderShipment(s)}
                                  aria-label={`Reorder/resend ${s.id}`}
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors duration-150"
                                  disabled={s.status === "CANCELLED"}
                                >
                                  <Icon name="Repeat" size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white border-black [&>svg]:fill-black [&>svg]:stroke-black">
                                <p>
                                  {s.status === "CANCELLED" 
                                    ? "Cannot reorder cancelled shipments" 
                                    : "Reorder/Resend this shipment"
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

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

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {pageIndex + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            aria-label="Results per page"
            value={pageSize}
            onChange={(e) => { 
              setPageIndex(0); 
              setPageSize(Number(e.target.value)); 
              // Clear selection when page size changes to avoid confusion
              setSelectedIds(new Set());
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => setPageIndex((v) => Math.max(0, v - 1))} disabled={pageIndex === 0} aria-label="Previous page">
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((v) => (v + 1 < Math.ceil(filtered.length / pageSize) ? v + 1 : v))}
            disabled={pageIndex + 1 >= Math.ceil(filtered.length / pageSize)}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Export CSV Confirmation Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent 
          id="parcego-export-csv-dialog"
          key={`export-dialog-${selectedInFilteredCount}-${exportType}`}
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
              disabled={exportType === "selected" && selectedInFilteredCount === 0}
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
                  // reload current page
                  const params: any = { skip: pageIndex * pageSize, limit: pageSize };
                  if (selectedStatus !== 'ALL') params.status = selectedStatus;
                  const list = query.trim()
                    ? await shippingService.searchShipments(query, { skip: pageIndex * pageSize, limit: pageSize })
                    : await shippingService.getShipments(params);
                  setAllShipments(list);
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

      {/* Enhanced Reorder Confirmation Dialog */}
      <AlertDialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <AlertDialogContent id="parcego-reorder-shipment-dialog" className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="Repeat" size={20} className="text-green-600" />
              Reorder Shipment
            </AlertDialogTitle>
            <div className="text-left">
              {shipmentToReorder && (
                <div className="space-y-3">
                  <p>
                    Create a new shipment based on <strong>{shipmentToReorder.tracking_code}</strong>?
                  </p>
                  <div className="bg-white/40 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-medium">{shipmentToReorder.receiver_address.contact_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">Standard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{shipmentToReorder.package.weight.toFixed(2)} kg</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    All recipient details will be pre-filled for faster ordering.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="parcego-reorder-shipment-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReorder}
              id="parcego-reorder-shipment-confirm-btn"
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              disabled={isReordering}
            >
              {isReordering ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icon name="Repeat" size={16} className="mr-2" />
                  Create New Shipment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Labels Modal */}
      <PrintLabelsModal
        open={showPrintLabelsModal}
        onOpenChange={setShowPrintLabelsModal}
        selectedShipmentIds={Array.from(selectedIds)}
        shipments={allShipments} // Assuming allShipments is the source of truth for all shipments
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


