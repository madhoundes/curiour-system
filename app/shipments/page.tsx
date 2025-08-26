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
import type { Shipment, ShipmentStatus } from "@/lib/mock/shipments";
import { formatCurrency, generateMockShipments } from "@/lib/mock/shipments";
import PrintLabelsModal from "./print-labels-modal";
import CancelShipmentDialog from "./cancel-shipment-dialog";

const allShipments: Shipment[] = generateMockShipments();

// Function to get status badge styling based on shipment status
const getStatusBadge = (status: ShipmentStatus) => {
  const statusConfig = {
    DELIVERED: {
      variant: "default" as const,
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors",
      label: "Delivered",
      icon: "CheckCircle"
    },
    IN_TRANSIT: {
      variant: "secondary" as const,
      className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors",
      label: "In Transit",
      icon: "Truck"
    },
    LABEL_CREATED: {
      variant: "outline" as const,
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-green-100 transition-colors",
      label: "Label Created",
      icon: "FileText"
    },
    SCANNED: {
      variant: "outline" as const,
      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-green-100 transition-colors",
      label: "Scanned",
      icon: "Scan"
    },
    OUT_FOR_DELIVERY: {
      variant: "secondary" as const,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-green-100 transition-colors",
      label: "Out for Delivery",
      icon: "Package"
    },
    FAILED: {
      variant: "destructive" as const,
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-green-100 transition-colors",
      label: "Failed",
      icon: "XCircle"
    },
    CANCELLED: {
      variant: "destructive" as const,
      className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-100 transition-colors",
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
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintLabelsModal, setShowPrintLabelsModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [shipmentToCancel, setShipmentToCancel] = useState<{ id: string; trackingNumber: string } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageIndex, setPageIndex] = useState<number>(0);

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

  const openCancelDialog = (shipment: Shipment) => {
    setShipmentToCancel({ id: shipment.id, trackingNumber: shipment.trackingNumber });
    setShowCancelDialog(true);
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
  }, [query, selectedStatus]);

  // Force export dialog re-render when selections change for real-time updates
  React.useEffect(() => {
    // This effect ensures the export dialog message updates in real-time
    // when selectedIds or filtered data changes
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Shipments"
        description="Manage and track all your shipments in one place"
        icon="Package"
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
                    <tr key={s.id} className="border-t">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            id={`parcego-shipments-rowactions-${s.id}`}
                            onClick={() => router.push(`/shipments/${encodeURIComponent(s.id)}`)}
                            aria-label={`View details for ${s.id}`}
                          >
                            <Icon name="Eye" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/create-shipment?from=${encodeURIComponent(s.id)}`)}
                            aria-label={`Re-ship ${s.id}`}
                          >
                            <Icon name="Repeat" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert("Printing label (mock)…")}
                            aria-label={`Print label for ${s.id}`}
                          >
                            <Icon name="Printer" size={16} />
                          </Button>
                          {s.status === "LABEL_CREATED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCancelDialog(s)}
                              aria-label={`Cancel shipment ${s.id}`}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          )}
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


