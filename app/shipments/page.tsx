"use client";

import React, { useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Shipment, ShipmentStatus } from "@/lib/mock/shipments";
import { formatCurrency, generateMockShipments } from "@/lib/mock/shipments";

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
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors",
      label: "Label Created",
      icon: "FileText"
    },
    SCANNED: {
      variant: "outline" as const,
      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors",
      label: "Scanned",
      icon: "Scan"
    },
    OUT_FOR_DELIVERY: {
      variant: "secondary" as const,
      className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 transition-colors",
      label: "Out for Delivery",
      icon: "Package"
    },
    FAILED: {
      variant: "destructive" as const,
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors",
      label: "Failed",
      icon: "XCircle"
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
];

export default function ShipmentsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isClient, setIsClient] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");

  // Ensure hydration consistency
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(25);
  const [pageIndex, setPageIndex] = useState<number>(0);

  const handleStatusChange = (status: string) => {
    const normalized = status.toUpperCase();
    setPageIndex(0);
    setSelectedStatus(normalized);
  };

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

  const handleExportCsv = () => {
    const dataToExport = exportType === "selected" ? 
      allShipments.filter(s => selectedIds.has(s.id)) : 
      filtered;
    
    const rows = dataToExport.map((s) => ({
      id: s.id,
      trackingNumber: s.trackingNumber,
      date: s.createdAt,
      recipient: s.recipient.name,
      service: s.service,
      courier: s.courier,
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

  const paged = useMemo(() => {
    const start = pageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  const visibleIds = paged.map((s) => s.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  return (
    <div id="parcego-shipments-page" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
            <p className="text-sm text-gray-600">Search, filter, and manage your past shipments.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/create-shipment")} id="parcego-shipments-create-btn">
            <Icon name="Plus" size={16} className="mr-2" />
            Create Shipment
          </Button>
        </div>

        {/* Controls */}
        <Card className="mb-6" id="parcego-shipments-filters">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 flex items-center gap-2">
                <Icon name="Search" size={16} className="text-gray-500" />
                <Input
                  id="parcego-shipments-search"
                  placeholder="Search by ID, tracking, recipient, address…"
                  value={query}
                  onChange={(e) => {
                    setPageIndex(0);
                    setQuery(e.target.value);
                  }}
                  aria-label="Search shipments"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Status Filter Select */}
                {isClient ? (
                  <Suspense fallback={<div className="w-[200px] h-9 bg-gray-100 rounded-md animate-pulse" />}>
                    <div suppressHydrationWarning>
                      <Select value={selectedStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger 
                          className="w-[200px]"
                          id="parcego-shipments-status-filter"
                          aria-label="Select status filter"
                        >
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Suspense>
                ) : (
                  <div className="w-[200px] h-9 bg-gray-100 rounded-md animate-pulse" />
                )}
                
                <Button variant="ghost" onClick={() => { setSelectedStatus("ALL"); setQuery(""); setPageIndex(0); }} aria-label="Reset filters">
                  Reset
                </Button>
                            <Button variant="outline" onClick={() => handleExportCsvClick("all")} aria-label="Export CSV">
                  <Icon name="Download" size={16} className="mr-2" />
                  Export CSV
                </Button>
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
                  <Button variant="outline" onClick={() => handleExportCsvClick("selected")} aria-label="Export selected">
                    <Icon name="FileDown" size={16} className="mr-2" /> Export
                  </Button>
                  <Button variant="outline" onClick={() => alert("Printing labels (mock)…")} aria-label="Print labels">
                    <Icon name="Printer" size={16} className="mr-2" /> Print Labels
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.size} shipments? (mock)`)) setSelectedIds(new Set());
                    }}
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
              Showing {paged.length} of {filtered.length} shipments
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
                        <td className="px-3 py-2">{s.courier}</td>
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
              onChange={(e) => { setPageIndex(0); setPageSize(Number(e.target.value)); }}
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
      </div>

      {/* Export CSV Confirmation Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent id="parcego-export-csv-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Export Shipments to CSV</AlertDialogTitle>
            <AlertDialogDescription>
              {exportType === "selected" 
                ? `This will export ${selectedIds.size} selected shipments to a CSV file.`
                : `This will export ${filtered.length} filtered shipments to a CSV file.`
              }
              The file will include shipment ID, tracking number, date, recipient, service, courier, weight, cost, and status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel id="parcego-export-csv-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExportCsv}
              id="parcego-export-csv-confirm-btn"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Export CSV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


