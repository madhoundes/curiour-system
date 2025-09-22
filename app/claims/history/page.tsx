"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Eye, 
  Download, 
  Search, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,

  Package,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClientOnly } from "@/components/ui/client-only";

import { Printer } from "lucide-react";
import { ClaimReportPDF, generateClaimPDF } from "@/components/pdf/claim-report-pdf";
import { generatePrintContent } from "@/components/pdf/claim-print-helper";

// Types for claims
export interface Claim {
  id: string;
  shipmentNumber: string;
  claimType: string;
  status: string;
  submittedDate: string;
  resolvedDate: string | null;
  amount: string;
  description: string;
  payoutAmount: string;
  documents: string[];
  incidentDate: string;
  incidentLocation: string;
  contactName: string;
  businessName: string;
  contactPhone: string;
  contactEmail: string;
}

// Mock claims data
const mockClaims: Claim[] = [
  {
    id: "CLM-001",
    shipmentNumber: "ASH-20250101-ABC123",
    claimType: "damage",
    status: "approved",
    submittedDate: "2025-01-10",
    resolvedDate: "2025-01-15",
    amount: "$150.00",
    description: "Package damaged during transit - corner crushed and contents slightly damaged. Photos provided showing the damage condition.",
    payoutAmount: "$150.00",
    documents: ["receipt.pdf", "damage_photos.zip", "shipping_label.pdf"],
    incidentDate: "2025-01-08",
    incidentLocation: "Toronto, ON",
    contactName: "John Smith",
    businessName: "Smith Electronics",
    contactPhone: "+1 (555) 123-4567",
    contactEmail: "john@smithelectronics.com"
  },
  {
    id: "CLM-002",
    shipmentNumber: "ASH-20250102-DEF456",
    claimType: "loss",
    status: "under_investigation",
    submittedDate: "2025-01-12",
    resolvedDate: null,
    amount: "$75.00",
    description: "Package lost during delivery - never received by recipient. Tracking shows delivered but recipient confirms no package received.",
    payoutAmount: "Pending",
    documents: ["invoice.pdf", "proof_of_value.pdf", "delivery_confirmation.pdf"],
    incidentDate: "2025-01-10",
    incidentLocation: "Vancouver, BC",
    contactName: "Sarah Johnson",
    businessName: "Johnson Crafts",
    contactPhone: "+1 (555) 234-5678",
    contactEmail: "sarah@johnsoncrafts.com"
  },
  {
    id: "CLM-003",
    shipmentNumber: "ASH-20250103-GHI789",
    claimType: "delay",
    status: "pending_review",
    submittedDate: "2025-01-14",
    resolvedDate: null,
    amount: "$25.00",
    description: "Significant delivery delay - 5 days late causing business disruption. Customer had to make alternative arrangements.",
    payoutAmount: "Pending",
    documents: ["delivery_confirmation.pdf", "customer_complaint.pdf", "alternative_arrangement_receipt.pdf"],
    incidentDate: "2025-01-09",
    incidentLocation: "Montreal, QC",
    contactName: "Michael Chen",
    businessName: "Chen Consulting",
    contactPhone: "+1 (555) 345-6789",
    contactEmail: "michael@chenconsulting.com"
  },
  {
    id: "CLM-004",
    shipmentNumber: "ASH-20250104-JKL012",
    claimType: "theft",
    status: "rejected",
    submittedDate: "2025-01-08",
    resolvedDate: "2025-01-13",
    amount: "$200.00",
    description: "Package stolen from doorstep - insufficient evidence provided. Police report filed but no security footage available.",
    payoutAmount: "$0.00",
    documents: ["police_report.pdf", "security_footage.zip", "neighbor_witness_statement.pdf"],
    incidentDate: "2025-01-06",
    incidentLocation: "Calgary, AB",
    contactName: "Emily Davis",
    businessName: "Davis Designs",
    contactPhone: "+1 (555) 456-7890",
    contactEmail: "emily@davisd designs.com"
  },
  {
    id: "CLM-005",
    shipmentNumber: "ASH-20250105-MNO345",
    claimType: "damage",
    status: "approved",
    submittedDate: "2025-01-06",
    resolvedDate: "2025-01-11",
    amount: "$300.00",
    description: "Package contents damaged due to improper handling during transit. Fragile items broken despite proper packaging.",
    payoutAmount: "$300.00",
    documents: ["damage_assessment.pdf", "repair_quotes.pdf", "original_packaging_photos.pdf"],
    incidentDate: "2025-01-04",
    incidentLocation: "Ottawa, ON",
    contactName: "Robert Wilson",
    businessName: "Wilson Antiques",
    contactPhone: "+1 (555) 567-8901",
    contactEmail: "robert@wilsonantiques.com"
  },
  {
    id: "CLM-006",
    shipmentNumber: "ASH-20250106-PQR678",
    claimType: "weather",
    status: "approved",
    submittedDate: "2025-01-16",
    resolvedDate: "2025-01-20",
    amount: "$125.00",
    description: "Package damaged due to severe weather conditions during transit. Water damage to contents despite weather-resistant packaging.",
    payoutAmount: "$125.00",
    documents: ["weather_report.pdf", "damage_photos.pdf", "packaging_specs.pdf"],
    incidentDate: "2025-01-14",
    incidentLocation: "Halifax, NS",
    contactName: "Lisa Thompson",
    businessName: "Thompson Books",
    contactPhone: "+1 (555) 678-9012",
    contactEmail: "lisa@thompsonbooks.com"
  },
  {
    id: "CLM-007",
    shipmentNumber: "ASH-20250107-STU901",
    claimType: "handling",
    status: "under_investigation",
    submittedDate: "2025-01-18",
    resolvedDate: null,
    amount: "$450.00",
    description: "Package damaged due to improper handling during loading/unloading. Forklift damage to pallet and contents.",
    payoutAmount: "Pending",
    documents: ["warehouse_incident_report.pdf", "damage_photos.pdf", "equipment_maintenance_log.pdf"],
    incidentDate: "2025-01-16",
    incidentLocation: "Edmonton, AB",
    contactName: "David Brown",
    businessName: "Brown Manufacturing",
    contactPhone: "+1 (555) 789-0123",
    contactEmail: "david@brownmanufacturing.com"
  }
];

// Status configuration for claims
const claimStatusConfig = {
  approved: { 
    label: "Approved", 
    color: "bg-green-50 text-green-700 border-green-200", 
    icon: CheckCircle,
    description: "Claim has been approved and payout processed"
  },
  pending_review: { 
    label: "Pending Review", 
    color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
    icon: Clock,
    description: "Claim is under initial review by claims team"
  },
  under_investigation: { 
    label: "Under Investigation", 
    color: "bg-blue-50 text-blue-700 border-blue-200", 
    icon: AlertTriangle,
    description: "Claim is being investigated for additional details"
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-50 text-red-700 border-red-200", 
    icon: XCircle,
    description: "Claim has been rejected based on policy terms"
  }
};

// Claim type configuration
const claimTypeConfig = {
  damage: { label: "Damage", color: "bg-orange-50 text-orange-700", icon: Package },
  loss: { label: "Loss", color: "bg-red-50 text-red-700", icon: Package },
  delay: { label: "Delay", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  theft: { label: "Theft", color: "bg-purple-50 text-purple-700", icon: Shield },
  weather: { label: "Weather Damage", color: "bg-blue-50 text-blue-700", icon: AlertTriangle },
  handling: { label: "Handling Damage", color: "bg-yellow-50 text-yellow-700", icon: Package }
};





export default function ClaimsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  




  // Filter claims based on search and filters
  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const matchesSearch = searchQuery === "" || 
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
      const matchesType = typeFilter === "all" || claim.claimType === typeFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const submittedDate = new Date(claim.submittedDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - submittedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            matchesDate = diffDays === 0;
            break;
          case "week":
            matchesDate = diffDays <= 7;
            break;
          case "month":
            matchesDate = diffDays <= 30;
            break;
          case "quarter":
            matchesDate = diffDays <= 90;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [searchQuery, statusFilter, typeFilter, dateFilter]);

  // Calculate processing time for claims
  const getClaimProcessingTime = (submittedDate: string, resolvedDate: string | null) => {
    if (!resolvedDate) return "In Progress";
    
    const submitted = new Date(submittedDate);
    const resolved = new Date(resolvedDate);
    const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Get status configuration for claims
  const getClaimStatusConfig = (status: string) => {
    return claimStatusConfig[status as keyof typeof claimStatusConfig] || claimStatusConfig.pending_review;
  };

  // Get claim type configuration
  const getClaimTypeConfig = (type: string) => {
    return claimTypeConfig[type as keyof typeof claimTypeConfig] || claimTypeConfig.damage;
  };

  // Handle claim detail view
  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailModalOpen(true);
  };

  // Handle print claim - generates complete claim report for printing
  const handlePrintClaim = async (claim: Claim) => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Generate complete claim report HTML
        const printHTML = generatePrintContent(claim);
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Allow time for content to load before printing
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } catch (error) {
      console.error('Print generation error:', error);
      toast.error("Failed to generate print preview");
    }
  };

  // Handle downloading claim documents as professional PDF report
  const handleDownloadClaimDocuments = async (claim: Claim) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      toast.error("PDF generation is only available in the browser");
      return;
    }

    try {
      await toast.promise(
        generateClaimPDF(claim),
        {
          loading: `Generating PDF report for ${claim.id}…`,
          success: "PDF downloaded successfully",
          error: "Failed to generate PDF report",
        }
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback error toast just in case
      toast.error("Something went wrong generating the PDF report");
    }
  };



  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalClaims = mockClaims.length;
    const approvedClaims = mockClaims.filter(c => c.status === 'approved');
    const pendingClaims = mockClaims.filter(c => c.status === 'pending_review' || c.status === 'under_investigation');
    const rejectedClaims = mockClaims.filter(c => c.status === 'rejected');
    
    const totalApprovedAmount = approvedClaims.reduce((sum, c) => 
      sum + parseFloat(c.payoutAmount.replace('$', '')), 0
    );
    
    const totalClaimedAmount = mockClaims.reduce((sum, c) => 
      sum + parseFloat(c.amount.replace('$', '')), 0
    );

    return {
      totalClaims,
      approvedClaims: approvedClaims.length,
      pendingClaims: pendingClaims.length,
      rejectedClaims: rejectedClaims.length,
      totalApprovedAmount: totalApprovedAmount.toFixed(2),
      totalClaimedAmount: totalClaimedAmount.toFixed(2),
      approvalRate: totalClaims > 0 ? ((approvedClaims.length / totalClaims) * 100).toFixed(1) : "0"
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3">

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Claims History
            </h1>
            <p className="mt-2 text-base text-gray-600 max-w-3xl">
              Track the status and progress of all your insurance claims. View supporting documents, 
              payout information, and claim details in one centralized location.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{summaryStats.totalClaims}</div>
                <div className="text-sm text-gray-600">Total Claims</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{summaryStats.approvedClaims}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 rounded-lg p-2 flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingClaims}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${summaryStats.totalApprovedAmount}</div>
                <div className="text-sm text-gray-600">Total Payouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>
            Narrow down your claims by status, type, date, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="parcego-claims-history-search">Search Claims</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="parcego-claims-history-search"
                  placeholder="Search by ID, shipment, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="parcego-claims-history-status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="p-0">
                  <SelectItem className="py-1 px-2" value="all">All Statuses</SelectItem>
                  <SelectItem className="py-1 px-2" value="approved">Approved</SelectItem>
                  <SelectItem className="py-1 px-2" value="pending_review">Pending Review</SelectItem>
                  <SelectItem className="py-1 px-2" value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem className="py-1 px-2" value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="parcego-claims-history-type-filter">Claim Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="p-0">
                  <SelectItem className="py-1 px-2" value="all">All Types</SelectItem>
                  <SelectItem className="py-1 px-2" value="damage">Damage</SelectItem>
                  <SelectItem className="py-1 px-2" value="loss">Loss</SelectItem>
                  <SelectItem className="py-1 px-2" value="delay">Delay</SelectItem>
                  <SelectItem className="py-1 px-2" value="theft">Theft</SelectItem>
                  <SelectItem className="py-1 px-2" value="weather">Weather Damage</SelectItem>
                  <SelectItem className="py-1 px-2" value="handling">Handling Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="parcego-claims-history-date-filter">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent className="p-0">
                  <SelectItem className="py-1 px-2" value="all">All Dates</SelectItem>
                  <SelectItem className="py-1 px-2" value="today">Today</SelectItem>
                  <SelectItem className="py-1 px-2" value="week">Last 7 Days</SelectItem>
                  <SelectItem className="py-1 px-2" value="month">Last 30 Days</SelectItem>
                  <SelectItem className="py-1 px-2" value="quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claims ({filteredClaims.length})</CardTitle>
          <CardDescription>
            Showing {filteredClaims.length} of {mockClaims.length} total claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No claims found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search criteria or filters to find what you&apos;re looking for.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Claim ID</TableHead>
                      <TableHead className="w-[180px]">Shipment</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[100px]">Amount</TableHead>
                      <TableHead className="w-[100px]">Payout</TableHead>
                      <TableHead className="w-[120px]">Submitted</TableHead>
                      <TableHead className="w-[120px]">Processing</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => {
                      const statusConfig = getClaimStatusConfig(claim.status);
                      const typeConfig = getClaimTypeConfig(claim.claimType);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow key={claim.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono font-medium whitespace-nowrap">{claim.id}</TableCell>
                          <TableCell className="font-mono whitespace-nowrap">{claim.shipmentNumber}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge className={`${statusConfig.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{claim.amount}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            <span className={claim.payoutAmount === "Pending" ? "text-yellow-600" : 
                                             claim.payoutAmount === "$0.00" ? "text-red-600" : "text-green-600"}>
                              {claim.payoutAmount}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(claim.submittedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getClaimProcessingTime(claim.submittedDate, claim.resolvedDate)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Details"
                                onClick={() => handleViewClaim(claim)}
                                id={`parcego-claims-history-view-${claim.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Print Claim"
                                onClick={() => handlePrintClaim(claim)}
                                id={`parcego-claims-history-print-${claim.id}`}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <ClientOnly fallback={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Download Documents"
                                  disabled
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              }>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Download Documents"
                                  id={`parcego-claims-history-download-${claim.id}`}
                                  onClick={() => handleDownloadClaimDocuments(claim)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </ClientOnly>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedClaim && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Claim Details - {selectedClaim.id}</span>
                </DialogTitle>
                <DialogDescription>
                  Preview of the claim report for {selectedClaim.id} - this matches the PDF export exactly
                </DialogDescription>
              </DialogHeader>
              
              {/* PDF Preview */}
              <div className="border rounded-lg bg-gray-50 p-4 overflow-auto">
                <ClaimReportPDF claim={selectedClaim} isPreview={true} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}
