"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Calendar,
  MapPin,
  Package,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils";
import { ClientOnly } from "@/components/ui/client-only";

// Types for claims
interface Claim {
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
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only rendering for dynamic functionality
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Handle downloading claim documents as professional PDF report
  const handleDownloadClaimDocuments = async (claim: Claim) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      toast.error("PDF generation is only available in the browser");
      return;
    }

    try {
      await toast.promise(
        generateClaimReportPDF(claim),
        {
          loading: `Generating report for ${claim.id}…`,
          success: "Download started",
          error: "Failed to generate report",
        }
      );
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback error toast just in case
      toast.error("Something went wrong generating the report");
    }
  };

  // Generate professional PDF report for claim
  const generateClaimReportPDF = async (claim: Claim): Promise<void> => {
    try {
      // Dynamic imports to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');

      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      // Tighter global line height for denser layout
      doc.setLineHeightFactor(1.1);
      
      // Load logo
      let logoData: string;
      try {
        logoData = await loadLogoForPDF();
      } catch (error) {
        logoData = 'PARCEGO'; // Fallback
      }

      // Page dimensions and compact margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let yPosition = margin;

      // Header with logo and title
      try {
        // Slightly smaller logo for compact header
        addLogoToPDF(doc, margin, yPosition, 32, 6, logoData);
      } catch (logoError) {
        // Fallback text logo
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 145, 245);
        doc.text('PARCEGO', margin, yPosition + 5);
      }

      // Report title (just below logo)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      // Balanced gap between logo and title: 30px
      const pxToMm = 25.4 / 96;
      const titleBaselineY = yPosition + (30 * pxToMm);
      doc.text('CLAIM REPORT', margin, titleBaselineY);

      // Contact Information Box (top right) - Structured format
      const contactInfoData = [
        ['Email', 'support@parcego.com'],
        ['Claim ID', claim.id],
        ['Phone Number', '1-800-PARCEGO'],
        ['Shipment ID', claim.shipmentNumber],
        ['Date Generated', new Date().toLocaleDateString()]
      ];

      autoTable(doc, {
        body: contactInfoData,
        startY: yPosition - 2,
        margin: { left: pageWidth - 72, right: margin },
        tableWidth: 68,
        theme: 'plain',
        styles: {
          fontSize: 8,
          cellPadding: { top: 1, right: 2, bottom: 1, left: 2 },
          textColor: [60, 60, 60],
          lineWidth: 0,
          fillColor: false
        },
        columnStyles: {
          0: {
            fontStyle: 'bold',
            cellWidth: 24,
            halign: 'left',
            textColor: [0, 80, 150]
          },
          1: {
            cellWidth: 44,
            halign: 'left',
            fontStyle: 'normal'
          }
        }
      });

      // Start main content relative to the title to push body lower
      yPosition = titleBaselineY + 12;

      // Basic Information Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      // Ensure "BASIC INFORMATION" sits just under title
      doc.text('BASIC INFORMATION', margin, titleBaselineY + 6);
      yPosition = titleBaselineY + 12;

      const statusConfig = getClaimStatusConfig(claim.status);
      const typeConfig = getClaimTypeConfig(claim.claimType);
      
      const basicInfoData = [
        ['Claim Type', typeConfig.label],
        ['Status', statusConfig.label],
        ['Claimed Amount', claim.amount],
        ['Payout Amount', claim.payoutAmount],
        ['Processing Time', getClaimProcessingTime(claim.submittedDate, claim.resolvedDate)],
        ['Submitted Date', new Date(claim.submittedDate).toLocaleDateString()],
        ...(claim.resolvedDate ? [['Resolved Date', new Date(claim.resolvedDate).toLocaleDateString()]] : [])
      ];

      autoTable(doc, {
        body: basicInfoData,
        startY: yPosition,
        theme: 'plain',
        tableLineWidth: 0,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [60, 60, 60],
          lineWidth: 0
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 248, 248] },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 6;

      // Incident Details Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('INCIDENT DETAILS', margin, yPosition);
      yPosition += 5;

      const incidentData = [
        ['Incident Date', new Date(claim.incidentDate).toLocaleDateString()],
        ['Incident Location', claim.incidentLocation],
        ['Description', claim.description]
      ];

      autoTable(doc, {
        body: incidentData,
        startY: yPosition,
        theme: 'plain',
        tableLineWidth: 0,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [60, 60, 60],
          lineWidth: 0
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 248, 248] },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 6;

      // Contact Information Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CONTACT INFORMATION', margin, yPosition);
      yPosition += 5;

      const contactData = [
        ['Contact Name', claim.contactName],
        ['Business Name', claim.businessName || 'N/A'],
        ['Phone', claim.contactPhone],
        ['Email', claim.contactEmail]
      ];

      autoTable(doc, {
        body: contactData,
        startY: yPosition,
        theme: 'plain',
        tableLineWidth: 0,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [60, 60, 60],
          lineWidth: 0
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', fillColor: [248, 248, 248] },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 6;

      // Supporting Documents Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SUPPORTING DOCUMENTS', margin, yPosition);
      yPosition += 5;

      // Prepare documents data with mock metadata
      const documentsData = claim.documents.map((doc, index) => {
        const extension = doc.split('.').pop()?.toLowerCase() || 'unknown';
        const mockSize = ['1.2 MB', '845 KB', '2.1 MB', '567 KB'][index % 4];
        const mockDate = new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toLocaleDateString();
        
        return [
          (index + 1).toString(),
          doc,
          extension.toUpperCase(),
          mockSize,
          mockDate
        ];
      });

      autoTable(doc, {
        head: [['#', 'Document Name', 'Type', 'Size', 'Date']],
        body: documentsData,
        startY: yPosition,
        theme: 'plain',
        tableLineWidth: 0,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [60, 60, 60],
          lineWidth: 0
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 18, halign: 'right' },
          4: { cellWidth: 22, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;

      // Footer
      const footerY = pageHeight - 22;
      
      // Terms section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('IMPORTANT NOTES', margin, footerY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(7);
      const notes = [
        'This report contains confidential claim information.',
        'For questions about this claim, contact support@parcego.com',
        'Keep this document for your records.'
      ];

      notes.forEach((note, index) => {
        doc.text(note, margin, footerY + 4 + (index * 2.6));
      });

      // Page footer
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Parcego Claims Report`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );

      // Save the PDF
      const filename = `claim-report-${claim.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

    } catch (error) {
      console.error('Failed to generate claim report PDF:', error);
      
      // Fallback to text download
      const reportContent = `CLAIM REPORT - ${claim.id}

Generated: ${new Date().toLocaleString()}

BASIC INFORMATION:
Claim ID: ${claim.id}
Shipment Number: ${claim.shipmentNumber}
Claim Type: ${getClaimTypeConfig(claim.claimType).label}
Status: ${getClaimStatusConfig(claim.status).label}
Claimed Amount: ${claim.amount}
Payout Amount: ${claim.payoutAmount}
Processing Time: ${getClaimProcessingTime(claim.submittedDate, claim.resolvedDate)}

INCIDENT DETAILS:
Incident Date: ${new Date(claim.incidentDate).toLocaleDateString()}
Incident Location: ${claim.incidentLocation}
Description: ${claim.description}

CONTACT INFORMATION:
Contact Name: ${claim.contactName}
Business Name: ${claim.businessName || 'N/A'}
Phone: ${claim.contactPhone}
Email: ${claim.contactEmail}

SUPPORTING DOCUMENTS:
${claim.documents.map((doc, index) => `${index + 1}. ${doc}`).join('\n')}

---
Parcego Courier Services
Generated on ${new Date().toLocaleDateString()}`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `claim-report-${claim.id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      throw new Error('PDF generation failed, downloaded text version instead');
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedClaim && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Claim Details - {selectedClaim.id}</span>
                </DialogTitle>
                <DialogDescription>
                  Detailed information about claim {selectedClaim.id} for shipment {selectedClaim.shipmentNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Claim ID</Label>
                      <p className="text-lg font-mono">{selectedClaim.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Shipment Number</Label>
                      <p className="text-lg font-mono">{selectedClaim.shipmentNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Claim Type</Label>
                      <Badge className={getClaimTypeConfig(selectedClaim.claimType).color}>
                        {getClaimTypeConfig(selectedClaim.claimType).label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge className={getClaimStatusConfig(selectedClaim.status).color}>
                          {getClaimStatusConfig(selectedClaim.status).label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getClaimStatusConfig(selectedClaim.status).description}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Claimed Amount</Label>
                      <p className="text-2xl font-bold text-blue-600">{selectedClaim.amount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Payout Amount</Label>
                      <p className={`text-2xl font-bold ${
                        selectedClaim.payoutAmount === "Pending" ? "text-yellow-600" : 
                        selectedClaim.payoutAmount === "$0.00" ? "text-red-600" : "text-green-600"
                      }`}>
                        {selectedClaim.payoutAmount}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Processing Time</Label>
                      <p className="text-lg">
                        {getClaimProcessingTime(selectedClaim.submittedDate, selectedClaim.resolvedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Incident Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Incident Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Incident Date</Label>
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(selectedClaim.incidentDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Incident Location</Label>
                      <p className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedClaim.incidentLocation}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="mt-1 text-gray-700">{selectedClaim.description}</p>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Contact Name</Label>
                      <p>{selectedClaim.contactName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                      <p>{selectedClaim.businessName || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p>{selectedClaim.contactPhone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p>{selectedClaim.contactEmail}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Supporting Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedClaim.documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Claim Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Claim Submitted</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedClaim.submittedDate).toLocaleDateString()} at {new Date(selectedClaim.submittedDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {selectedClaim.resolvedDate && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Claim Resolved</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedClaim.resolvedDate).toLocaleDateString()} at {new Date(selectedClaim.resolvedDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
