"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUndeliverablePackages } from "@/lib/mock/undeliverable";
import { UndeliverablePackage, Status } from "@/lib/mock/undeliverable";
import { PackageDetailsModal } from "./package-details-modal";

export default function UndeliverablePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedPackage, setSelectedPackage] = useState<UndeliverablePackage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [packages, setPackages] = useState(mockUndeliverablePackages);

  // Filter packages based on search and status
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch = 
        pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.recipient.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, packages]);

  const handlePackageSelect = (pkg: UndeliverablePackage) => {
    setSelectedPackage(pkg);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (packageId: string, newStatus: Status) => {
    // Update the local state to move packages between tabs
    setPackages(prevPackages => 
      prevPackages.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, status: newStatus, updatedAt: new Date().toISOString() }
          : pkg
      )
    );
    
    // In a real app, this would update the backend
    console.log(`Updating package ${packageId} status to ${newStatus}`);
  };

  const getStatusBadge = (status: Status) => {
    const statusConfig = {
      pending: { variant: "secondary", text: "Pending Review" },
      in_progress: { variant: "default", text: "In Progress" },
      resolved: { variant: "default", text: "Resolved" }
    } as const;

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: "destructive", text: "High Priority" },
      medium: { variant: "default", text: "Medium Priority" },
      low: { variant: "secondary", text: "Low Priority" }
    } as const;

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  const stats = {
    total: packages.length,
    pending: packages.filter(p => p.status === "pending").length,
    inProgress: packages.filter(p => p.status === "in_progress").length,
    resolved: packages.filter(p => p.status === "resolved").length
  };

  return (
    <div className="min-h-screen bg-gray-50" id="parcego-undeliverable-page-container">
      <PageHeader
        title="Undeliverable Packages"
        onBack={() => router.push('/dashboard')}
        backLabel="Back to Dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 rounded-lg p-3 flex-shrink-0">
                    <Icon name="AlertTriangle" size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                    <p className="text-2xl font-bold text-red-600">{stats.total}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-lg p-3 flex-shrink-0">
                    <Icon name="Clock" size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                    <Icon name="Loader2" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-lg p-3 flex-shrink-0">
                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Search" size={20} className="text-gray-600" />
              <span>Search & Filters</span>
            </CardTitle>
            <CardDescription>Find specific packages or filter by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="parcego-undeliverable-search">Search Packages</Label>
                <Input
                  id="parcego-undeliverable-search"
                  placeholder="Search by tracking number, recipient, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="sm:w-48">
                <Label htmlFor="parcego-undeliverable-status-filter">Status Filter</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | "all")}>
                  <SelectTrigger id="parcego-undeliverable-status-filter" className="mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="PackageX" size={20} className="text-gray-600" />
              <span>Package Management</span>
            </CardTitle>
            <CardDescription>Review and resolve delivery issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Packages ({filteredPackages.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({stats.inProgress})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <PackageList
                  packages={filteredPackages}
                  onPackageSelect={handlePackageSelect}
                  onStatusUpdate={handleStatusUpdate}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <PackageList
                  packages={packages.filter(p => p.status === "pending")}
                  onPackageSelect={handlePackageSelect}
                  onStatusUpdate={handleStatusUpdate}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                />
              </TabsContent>

              <TabsContent value="in_progress" className="mt-6">
                <PackageList
                  packages={packages.filter(p => p.status === "in_progress")}
                  onPackageSelect={handlePackageSelect}
                  onStatusUpdate={handleStatusUpdate}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                />
              </TabsContent>

              <TabsContent value="resolved" className="mt-6">
                <PackageList
                  packages={packages.filter(p => p.status === "resolved")}
                  onPackageSelect={handlePackageSelect}
                  onStatusUpdate={handleStatusUpdate}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Package Details Modal */}
      {showDetailsModal && selectedPackage && (
        <PackageDetailsModal
          pkg={selectedPackage}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// Package List Component
interface PackageListProps {
  packages: UndeliverablePackage[];
  onPackageSelect: (pkg: UndeliverablePackage) => void;
  onStatusUpdate: (packageId: string, newStatus: Status) => void;
  getStatusBadge: (status: Status) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
}

function PackageList({
  packages,
  onPackageSelect,
  onStatusUpdate,
  getStatusBadge,
  getPriorityBadge
}: PackageListProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-12" id="parcego-undeliverable-empty-state">
        <Icon name="PackageX" size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {pkg.trackingNumber}
                      </span>
                      {getStatusBadge(pkg.status)}
                      {getPriorityBadge(pkg.priority)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Recipient: {pkg.recipient.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Address: {pkg.recipient.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Issue: {pkg.issueType}</span>
                  <span>Created: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                  <span>Last Updated: {new Date(pkg.updatedAt).toLocaleDateString()}</span>
                </div>

                {pkg.notes && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {pkg.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPackageSelect(pkg)}
                  id={`parcego-undeliverable-view-details-${pkg.id}`}
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </Button>
                
                {pkg.status === "pending" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onStatusUpdate(pkg.id, "in_progress")}
                    id={`parcego-undeliverable-start-progress-${pkg.id}`}
                  >
                    <Icon name="Play" size={16} className="mr-2" />
                    Start Progress
                  </Button>
                )}
                
                {pkg.status === "in_progress" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onStatusUpdate(pkg.id, "resolved")}
                    id={`parcego-undeliverable-mark-resolved-${pkg.id}`}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
