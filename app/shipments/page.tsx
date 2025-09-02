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

import type { Shipment, ShipmentStatus } from "@/lib/mock/shipments";
import { formatCurrency, getMockShipments } from "@/lib/mock/shipments";
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
];

export default function ShipmentsPage() {
  const router = useRouter();
  
  // Data loading state for consistent SSR/CSR
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintLabelsModal, setShowPrintLabelsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  // const [shipmentToCancel, setShipmentToCancel] = useState<{ id: string; trackingNumber: string } | null>(null);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [shipmentToReorder, setShipmentToReorder] = useState<Shipment | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageIndex, setPageIndex] = useState<number>(0);
  
  // Load data on client to prevent hydration mismatches
  React.useEffect(() => {
    const shipments = getMockShipments();
    setAllShipments(shipments);
    setIsDataLoaded(true);
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAllVisible = (ids: string[]) => {
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

  const handleCancelShipment = (shipmentId: string) => {
    try {
      // Find the shipment and update its status to CANCELLED
      const shipmentIndex = allShipments.findIndex(s => s.id === shipmentId);
      if (shipmentIndex !== -1) {
        allShipments[shipmentIndex].status = "CANCELLED";
        allShipments[shipmentIndex].updatedAt = new Date().toISOString();
        
        // Force re-render by updating state
        setQuery(query); // This will trigger a re-filter
        
        // Show success message
        alert(`Shipment ${shipmentId} has been cancelled successfully.`);
      } else {
        throw new Error(`Shipment ${shipmentId} not found`);
      }
    } catch (error) {
      console.error("Failed to cancel shipment:", error);
      alert(`Failed to cancel shipment ${shipmentId}. Please try again.`);
    }
  };

  // const openCancelDialog = (shipment: Shipment) => {
  //   setShipmentToCancel({ id: shipment.id, trackingNumber: shipment.trackingNumber });
  //   setShowCancelDialog(true);
  // };

  // Enhanced reorder functionality with better UX
  const handleReorderShipment = async (shipment: Shipment) => {
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
        from: shipmentToReorder.id,
        recipient: shipmentToReorder.recipient.name,
        address: shipmentToReorder.recipient.address1,
        city: shipmentToReorder.recipient.city,
        province: shipmentToReorder.recipient.province || '',
        postalCode: shipmentToReorder.recipient.postalCode,
        country: shipmentToReorder.recipient.country,
        service: shipmentToReorder.service,
        weight: shipmentToReorder.weightKg.toString(),
        notes: `Reordered from shipment ${shipmentToReorder.trackingNumber}`
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
      trackingNumber: s.trackingNumber,
      date: s.createdAt,
      recipient: s.recipient.name,
      service: s.service,
      courier: "Parcego",
      weightKg: s.weightKg,
      cost: s.cost,
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
    // Return empty array while data is loading
    if (!isDataLoaded || allShipments.length === 0) return [];
    
    const q = query.trim().toLowerCase();
    let list = allShipments;
    if (q) {
      list = list.filter((s) => {
        return (
          s.id.toLowerCase().includes(q) ||
          s.trackingNumber.toLowerCase().includes(q) ||
          s.recipient.name.toLowerCase().includes(q) ||
          s.recipient.city.toLowerCase().includes(q) ||
          (s.recipient.province?.toLowerCase() ?? "").includes(q) ||
          s.recipient.address1.toLowerCase().includes(q)
        );
      });
    }
    if (selectedStatus && selectedStatus !== "ALL") {
      list = list.filter((s) => s.status === selectedStatus);
    }
    // Sort: most recent first
    list = list.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  }, [query, selectedStatus, allShipments, isDataLoaded]);

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
            <div className="flex-1">
              <Input
                placeholder="Search shipments by tracking number, recipient, or address..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                id="parcego-shipments-search-input"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                  aria-label="Delete selected shipments"
                >
                  <Icon name="Trash2" size={16} className="mr-2" /> Delete
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
                      <td className="px-3 py-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{s.recipient.name}</td>
                      <td className="px-3 py-2">{s.service}</td>
                      <td className="px-3 py-2">Parcego</td>
                      <td className="px-3 py-2">{s.weightKg.toFixed(2)} kg</td>
                      <td className="px-3 py-2">
                        {(() => {
                          const badgeConfig = getStatusBadge(s.status);
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
                      <td className="px-3 py-2">{formatCurrency(s.cost)}</td>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent id="parcego-delete-shipments-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Shipments</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.size} selected shipment{selectedIds.size === 1 ? '' : 's'}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="parcego-delete-shipments-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setSelectedIds(new Set());
                setShowDeleteDialog(false);
              }}
              id="parcego-delete-shipments-confirm-btn"
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Delete Shipments
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
                    Create a new shipment based on <strong>{shipmentToReorder.trackingNumber}</strong>?
                  </p>
                  <div className="bg-white/40 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient:</span>
                      <span className="font-medium">{shipmentToReorder.recipient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{shipmentToReorder.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{shipmentToReorder.weightKg.toFixed(2)} kg</span>
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
          trackingNumber={shipmentToCancel.trackingNumber}
          onCancel={handleCancelShipment}
          isOpen={showCancelDialog}
          onOpenChange={setShowCancelDialog}
        />
      )}
    </div>
  );
}


