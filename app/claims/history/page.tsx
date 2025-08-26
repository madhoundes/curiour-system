"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Search, Filter, Eye, FileText, Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock claims data
const mockClaims = [
  {
    id: "CLM-001",
    shipmentNumber: "ASH-20250101-ABC123",
    claimType: "Damage",
    status: "approved",
    submittedDate: "2025-01-10",
    resolvedDate: "2025-01-15",
    amount: "$150.00",
    description: "Package damaged during transit - corner crushed"
  },
  {
    id: "CLM-002",
    shipmentNumber: "ASH-20250102-DEF456",
    claimType: "Loss",
    status: "under_investigation",
    submittedDate: "2025-01-12",
    resolvedDate: null,
    amount: "$75.00",
    description: "Package lost during delivery - never received"
  },
  {
    id: "CLM-003",
    shipmentNumber: "ASH-20250103-GHI789",
    claimType: "Delay",
    status: "pending_review",
    submittedDate: "2025-01-14",
    resolvedDate: null,
    amount: "$25.00",
    description: "Significant delivery delay - 5 days late"
  },
  {
    id: "CLM-004",
    shipmentNumber: "ASH-20250104-JKL012",
    claimType: "Theft",
    status: "rejected",
    submittedDate: "2025-01-08",
    resolvedDate: "2025-01-13",
    amount: "$200.00",
    description: "Package stolen from doorstep - insufficient evidence"
  },
  {
    id: "CLM-005",
    shipmentNumber: "ASH-20250105-MNO345",
    claimType: "Damage",
    status: "approved",
    submittedDate: "2025-01-06",
    resolvedDate: "2025-01-11",
    amount: "$89.99",
    description: "Items damaged due to improper handling"
  }
];

// Status configurations
const statusConfig = {
  pending_review: {
    label: "Pending Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock
  },
  under_investigation: {
    label: "Under Investigation",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertTriangle
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle
  }
};

// Claim type configurations
const claimTypeConfig = {
  loss: { label: "Loss", color: "bg-red-50 text-red-700" },
  damage: { label: "Damage", color: "bg-orange-50 text-orange-700" },
  theft: { label: "Theft", color: "bg-purple-50 text-purple-700" },
  delay: { label: "Delay", color: "bg-blue-50 text-blue-700" },
  weather: { label: "Weather", color: "bg-gray-50 text-gray-700" },
  handling: { label: "Handling", color: "bg-yellow-50 text-yellow-700" }
};

export default function ClaimsHistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<typeof mockClaims[0] | null>(null);

  // Filter claims based on search and filters
  const filteredClaims = mockClaims.filter(claim => {
    const matchesSearch = claim.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || claim.status === statusFilter;
    const matchesType = !typeFilter || claim.claimType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status configuration
  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
  };

  // Get claim type configuration
  const getClaimTypeConfig = (type: string) => {
    return claimTypeConfig[type as keyof typeof claimTypeConfig] || claimTypeConfig.damage;
  };

  // Calculate processing time
  const getProcessingTime = (submittedDate: string, resolvedDate: string | null) => {
    if (!resolvedDate) return "In Progress";
    
    const submitted = new Date(submittedDate);
    const resolved = new Date(resolvedDate);
    const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Handle claim selection
  const handleClaimSelect = (claim: typeof mockClaims[0]) => {
    setSelectedClaim(claim);
  };

  // Handle close claim details
  const handleCloseClaimDetails = () => {
    setSelectedClaim(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/claims')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Claims</span>
          </Button>
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
                              <h1 className="text-2xl font-bold text-gray-900">Claims History</h1>
              <p className="text-gray-600">Track the status of your insurance claims</p>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => router.push('/claims')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Shield className="h-4 w-4 mr-2" />
          File New Claim
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-normal text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold text-gray-900">{mockClaims.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-base font-normal text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockClaims.filter(c => c.status === 'pending_review' || c.status === 'under_investigation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-base font-normal text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockClaims.filter(c => c.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-base font-normal text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockClaims.filter(c => c.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="parcego-claims-search">Search Claims</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="parcego-claims-search"
                  placeholder="Search by ID, shipment, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="parcego-claims-status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parcego-claims-type-filter">Claim Type Filter</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="handling">Handling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Overview</CardTitle>
          <CardDescription>
            {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No claims found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search criteria or file a new claim.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => {
                  const statusConfig = getStatusConfig(claim.status);
                  const typeConfig = getClaimTypeConfig(claim.claimType);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={claim.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-medium">{claim.id}</TableCell>
                      <TableCell className="font-mono">{claim.shipmentNumber}</TableCell>
                      <TableCell>
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{claim.amount}</TableCell>
                      <TableCell>{new Date(claim.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {getProcessingTime(claim.submittedDate, claim.resolvedDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClaimSelect(claim)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Claim Details</span>
                </CardTitle>
                <CardDescription>Claim ID: {selectedClaim.id}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseClaimDetails}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Shipment Number</Label>
                  <p className="font-mono text-sm">{selectedClaim.shipmentNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Claim Type</Label>
                  <Badge className={getClaimTypeConfig(selectedClaim.claimType).color}>
                    {getClaimTypeConfig(selectedClaim.claimType).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={`${getStatusConfig(selectedClaim.status).color} border`}>
                    {getStatusConfig(selectedClaim.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount</Label>
                  <p className="font-medium">{selectedClaim.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Submitted Date</Label>
                  <p className="text-sm">{new Date(selectedClaim.submittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Processing Time</Label>
                  <p className="text-sm">
                    {getProcessingTime(selectedClaim.submittedDate, selectedClaim.resolvedDate)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-sm mt-1">{selectedClaim.description}</p>
              </div>

              {selectedClaim.resolvedDate && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Resolved:</strong> This claim was resolved on{' '}
                    {new Date(selectedClaim.resolvedDate).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseClaimDetails}
                >
                  Close
                </Button>
                {selectedClaim.status === 'pending_review' && (
                  <Button
                    onClick={() => {
                      handleCloseClaimDetails();
                      router.push('/claims');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Claim
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
