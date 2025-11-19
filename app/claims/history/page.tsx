'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Shield,
  Printer
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClientOnly } from '@/components/ui/client-only';
import { ClaimReportPDF, generateClaimPDF } from '@/components/pdf/claim-report-pdf';
import { generatePrintContent } from '@/components/pdf/claim-print-helper';
import { claimsService } from '@/lib/api/claims';
import type { Claim, GetClaimsParams } from '@/lib/api/types';

// Claim status configuration
const claimStatusConfig = {
  approved: { 
    label: "Approved", 
    color: "bg-green-50 text-green-700 border-green-200", 
    icon: CheckCircle,
    description: "Claim has been approved and payout processed"
  },
  pending: { 
    label: "Pending Review", 
    color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
    icon: Clock,
    description: "Claim is under initial review by claims team"
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-50 text-red-700 border-red-200", 
    icon: XCircle,
    description: "Claim has been rejected based on policy terms"
  },
  resolved: { 
    label: "Resolved", 
    color: "bg-blue-50 text-blue-700 border-blue-200", 
    icon: AlertTriangle,
    description: "Claim has been resolved"
  }
};

// Claim type configuration
const claimTypeConfig = {
  damaged: { label: "Damage", color: "bg-orange-50 text-orange-700", icon: Package },
  lost: { label: "Loss", color: "bg-red-50 text-red-700", icon: Package },
  late_delivery: { label: "Late Delivery", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  wrong_address: { label: "Wrong Address", color: "bg-purple-50 text-purple-700", icon: AlertTriangle },
  missing_items: { label: "Missing Items", color: "bg-blue-50 text-blue-700", icon: Package },
  other: { label: "Other", color: "bg-gray-50 text-gray-700", icon: AlertTriangle }
};

// Format currency
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(numAmount);
};

// Format date in UTC
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

export default function ClaimsHistoryPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClaims, setTotalClaims] = useState(0);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch claims from API
  const fetchClaims = async (params: { page?: number; status?: 'all' | 'pending' | 'approved' | 'rejected' | 'resolved' } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert 'all' to null for API, keep other statuses as-is
      const statusParam: 'pending' | 'approved' | 'rejected' | 'resolved' | null = 
        params.status === 'all' || params.status === undefined ? null : params.status;
      
      console.log('🔍 Fetching claims with params:', {
        page: params.page || currentPage,
        per_page: 10,
        status: statusParam,
        rawStatus: params.status
      });
      
      const apiParams: GetClaimsParams = {
        page: params.page || currentPage,
        per_page: 10
      };
      
      // Only add status if it's not null
      if (statusParam !== null) {
        apiParams.status = statusParam;
      }
      
      console.log('📡 API params being sent:', apiParams);
      
      const response = await claimsService.getClaims(apiParams);

      console.log('✅ Claims fetched successfully:', {
        totalClaims: response.total,
        claimsReturned: response.claims.length,
        page: response.page,
        totalPages: response.total_pages
      });
      
      console.log('📋 Claims data:', response.claims.map(c => ({
        id: c.id,
        status: c.status,
        reason: c.reason,
        tracking: c.shipment_tracking_code
      })));
      
      setClaims(response.claims);
      setTotalPages(response.total_pages);
      setTotalClaims(response.total);
      setCurrentPage(response.page);
    } catch (err: any) {
      console.error('❌ Error fetching claims:', err);
      setError(err.message || 'Failed to fetch claims');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClaims();
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = (status: 'all' | 'pending' | 'approved' | 'rejected' | 'resolved') => {
    console.log('Status filter changed to:', status);
    setStatusFilter(status);
    setCurrentPage(1);
    setTypeFilter('all'); // Reset type filter when status changes
    setSearchQuery(''); // Reset search when status changes
    fetchClaims({ 
      page: 1, 
      status: status 
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClaims({ 
      page, 
      status: statusFilter 
    });
  };

  // Filter claims based on search and filters (client-side filtering for search and type)
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = searchQuery === "" || 
        claim.shipment_tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || claim.reason === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [claims, searchQuery, typeFilter]);

  // Calculate summary statistics
  const totalApproved = claims.filter(claim => claim.status === 'approved').length;
  const totalPending = claims.filter(claim => claim.status === 'pending').length;
  const totalAmount = claims
    .filter(claim => claim.status === 'approved')
    .reduce((sum, claim) => sum + (claim.billing_id || 0), 0);

  // Handle claim detail view
  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailModalOpen(true);
  };

  // Handle print claim
  const handlePrintClaim = (claim: Claim) => {
    const printContent = generatePrintContent(claim);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Handle download claim PDF
  const handleDownloadPDF = async (claim: Claim) => {
    try {
      await generateClaimPDF(claim);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Loading state
  if (loading && claims.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading claims...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Claims</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchClaims()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
          <p className="text-gray-600 mt-1">View and manage your submitted claims</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
            <p className="text-xs text-muted-foreground">All submitted claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
            <p className="text-xs text-muted-foreground">Claims approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Total approved amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Narrow down your claims by status, type, date, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Claims</Label>
              <Input
                id="search"
                placeholder="Search by ID, shipment, description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Claim Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Claim Type</Label>
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="damaged">Damage</SelectItem>
                  <SelectItem value="lost">Loss</SelectItem>
                  <SelectItem value="late_delivery">Late Delivery</SelectItem>
                  <SelectItem value="wrong_address">Wrong Address</SelectItem>
                  <SelectItem value="missing_items">Missing Items</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims ({filteredClaims.length})</CardTitle>
          <CardDescription>
            {loading ? 'Loading claims...' : `Showing ${filteredClaims.length} of ${totalClaims} claims`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'You haven\'t submitted any claims yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => {
                    const statusConfig = claimStatusConfig[claim.status as keyof typeof claimStatusConfig];
                    const typeConfig = claimTypeConfig[claim.reason as keyof typeof claimTypeConfig];
                    const StatusIcon = statusConfig?.icon || AlertTriangle;
                    const TypeIcon = typeConfig?.icon || Package;

                    return (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">
                          CLM-{claim.id.toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell>{claim.shipment_tracking_code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeConfig?.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeConfig?.label || claim.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusConfig?.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig?.label || claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(claim.created_at)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {claim.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClaim(claim)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintClaim(claim)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(claim)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Claim Details - CLM-{selectedClaim?.id.toString().padStart(3, '0')}
            </DialogTitle>
            <DialogDescription>
              Complete information about this claim
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Claim Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Claim ID:</strong> CLM-{selectedClaim.id.toString().padStart(3, '0')}</div>
                    <div><strong>Shipment:</strong> {selectedClaim.shipment_tracking_code}</div>
                    <div><strong>Type:</strong> {claimsService.getClaimReasonDisplay(selectedClaim.reason)}</div>
                    <div><strong>Status:</strong> {claimsService.getClaimStatusDisplay(selectedClaim.status)}</div>
                    <div><strong>Submitted:</strong> {formatDate(selectedClaim.created_at)}</div>
                    {selectedClaim.updated_at && (
                      <div><strong>Last Updated:</strong> {formatDate(selectedClaim.updated_at)}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedClaim.user_email}</div>
                    <div><strong>User ID:</strong> {selectedClaim.user_id}</div>
                    <div><strong>Billing ID:</strong> {selectedClaim.billing_id}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {selectedClaim.description}
                </p>
              </div>

              {/* Photos */}
              {selectedClaim.photos && selectedClaim.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Photos ({selectedClaim.photos.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedClaim.photos.map((photo, index) => (
                      <div key={index} className="border rounded-md p-2 text-center">
                        <img 
                          src={photo} 
                          alt={`Claim photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded mb-1"
                        />
                        <p className="text-xs text-gray-600">Photo {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handlePrintClaim(selectedClaim)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedClaim)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
