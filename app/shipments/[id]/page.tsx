"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { useReactToPrint } from "react-to-print";
import { formatCurrency } from "@/lib/mock/shipments";
import { ShippingService } from "@/lib/api/shipping";
import type { DetailedShipment } from "@/lib/api/types";
import { generatePdfInvoice } from "@/lib/utils";

// Timeline data with status and completion
const timelineSteps = [
  { id: 'label_created', label: 'Label Created', icon: 'FileText', completed: true, active: false },
  { id: 'scanned', label: 'Scanned at Origin Facility', icon: 'Scan', completed: true, active: false },
  { id: 'in_transit', label: 'In Transit', icon: 'Truck', completed: true, active: false },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: 'Package', completed: true, active: false },
  { id: 'delivered', label: 'Delivered', icon: 'CheckCircle', completed: true, active: true }
];

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  // State for API data loading
  const [shipment, setShipment] = useState<DetailedShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const shippingService = new ShippingService();

  // Load shipment data from API
  useEffect(() => {
    const loadShipment = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Parse the shipment ID - assuming it's numeric
        const shipmentId = parseInt(id.replace(/[^0-9]/g, ''), 10);
        if (isNaN(shipmentId)) {
          throw new Error('Invalid shipment ID format');
        }
        
        const shipmentData = await shippingService.getShipment(shipmentId);
        setShipment(shipmentData);
      } catch (err) {
        console.error('Failed to load shipment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shipment data');
      } finally {
        setIsLoading(false);
      }
    };

    loadShipment();
  }, [id]);

  // Handle shipment cancellation with API call
  const handleCancelShipment = async () => {
    if (!shipment || !confirm(`Are you sure you want to cancel shipment ${shipment.id}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await shippingService.updateShipmentStatus(shipment.id, {
        status: 'CANCELLED',
        change_reason: 'Cancelled by merchant',
        notes: 'Shipment cancelled through merchant dashboard'
      });
      
      // Update local state
      setShipment(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      alert(`Shipment ${shipment.id} has been cancelled successfully.`);
      router.push("/shipments");
    } catch (err) {
      console.error('Failed to cancel shipment:', err);
      alert('Failed to cancel shipment. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Print functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Shipment ${shipment?.id || 'Details'}`,
    onAfterPrint: () => {
      console.log('Print completed');
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" onClick={() => router.push("/shipments")} id="parcego-shipments-back-btn">
            <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Shipments
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600">Loading shipment details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !shipment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" onClick={() => router.push("/shipments")} id="parcego-shipments-back-btn">
            <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Shipments
          </Button>
        </div>
        <div className="text-center py-12">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Shipment Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">{error || 'The requested shipment could not be found.'}</p>
          <Button onClick={() => router.push("/shipments")}>
            Return to Shipments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Header Layout - Mobile-first responsive design */}
        <div className="mb-6">
          {/* Header row: Back button, main heading, and action buttons */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Left side: Back button and main heading */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Back button */}
              <Button 
                variant="ghost" 
                onClick={() => router.push("/shipments")} 
                id="parcego-shipments-back-btn" 
                aria-label="Back to shipments"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-full flex-shrink-0 mt-1"
              >
                <Icon name="ArrowLeft" size={18} />
              </Button>

              {/* Main heading and tracking info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">{shipment.id}</h1>
                <p className="text-sm text-gray-600 mb-1">Tracking: {shipment.tracking_code}</p>
                <p className="text-xs text-gray-500">Created on {new Date(shipment.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-shrink-0 gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/create-shipment?from=${encodeURIComponent(shipment.id)}`)} 
                aria-label="Re-ship"
                className="hidden sm:flex items-center"
              >
                <Icon name="Repeat" size={16} className="mr-2" /> Re-ship
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint} 
                aria-label="Print shipment details"
                className="hidden sm:flex items-center hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                <Icon name="Printer" size={16} className="mr-2" /> Print
              </Button>
              {/* Mobile: Icon-only buttons */}
              <Button 
                variant="outline" 
                onClick={() => router.push(`/create-shipment?from=${encodeURIComponent(shipment.id)}`)} 
                aria-label="Re-ship"
                className="sm:hidden p-2"
                size="sm"
              >
                <Icon name="Repeat" size={16} />
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint} 
                aria-label="Print shipment details"
                className="sm:hidden p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                size="sm"
              >
                <Icon name="Printer" size={16} />
              </Button>
              {shipment.status === "LABEL_CREATED" && (
                <Button 
                  variant="destructive" 
                  onClick={handleCancelShipment}
                  disabled={isUpdatingStatus}
                  aria-label="Cancel shipment"
                  className="p-2"
                  size="sm"
                >
                  {isUpdatingStatus ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="X" size={16} />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Badge className="text-sm px-3 py-1 w-fit">{shipment.status.replace(/_/g, " ")}</Badge>
              <span className="text-sm text-gray-700">{new Date(shipment.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Printable Content Reference */}
        <div ref={printRef} className="hidden print-content">
          {/* Print-specific content */}
          <div className="p-8 bg-white">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Shipment Details</h1>
              <div className="text-lg text-gray-600">
                <p><strong>Shipment ID:</strong> {shipment.id}</p>
                <p><strong>Tracking Number:</strong> {shipment.tracking_code}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b pb-2">Shipment Information</h2>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {shipment.status.replace(/_/g, " ")}</p>
                  <p><strong>Tracking Number:</strong> {shipment.tracking_code}</p>
                  <p><strong>Service:</strong> Standard Delivery</p>
                  <p><strong>Created:</strong> {new Date(shipment.created_at).toLocaleDateString()}</p>
                  <p><strong>Updated:</strong> {new Date(shipment.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b pb-2">Package Details</h2>
                <div className="space-y-2">
                  <p><strong>Type:</strong> {shipment.package.package_type}</p>
                  <p><strong>Weight:</strong> {shipment.package.weight} kg</p>
                  <p><strong>Dimensions:</strong> {shipment.package.length} × {shipment.package.width} × {shipment.package.height} cm</p>
                  <p><strong>Contents:</strong> {shipment.package.contents_description}</p>
                  <p><strong>Value:</strong> ${shipment.package.declared_value}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4">Sender Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {shipment.sender_address.contact_name}</p>
                  <p><strong>Company:</strong> {shipment.sender_address.company_name || 'N/A'}</p>
                  <p><strong>Address:</strong> {shipment.sender_address.street_address}</p>
                  <p><strong>City:</strong> {shipment.sender_address.city}, {shipment.sender_address.province} {shipment.sender_address.postal_code}</p>
                  <p><strong>Phone:</strong> {shipment.sender_address.phone_number}</p>
                  <p><strong>Email:</strong> {shipment.sender_address.email}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold border-b pb-2 mb-4">Recipient Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {shipment.receiver_address.contact_name}</p>
                  <p><strong>Company:</strong> {shipment.receiver_address.company_name || 'N/A'}</p>
                  <p><strong>Address:</strong> {shipment.receiver_address.street_address}</p>
                  <p><strong>City:</strong> {shipment.receiver_address.city}, {shipment.receiver_address.province} {shipment.receiver_address.postal_code}</p>
                  <p><strong>Phone:</strong> {shipment.receiver_address.phone_number}</p>
                  <p><strong>Email:</strong> {shipment.receiver_address.email}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Billing Information</h2>
              <div className="space-y-2">
                <p><strong>Subtotal:</strong> {formatCurrency(parseFloat(shipment.billing.subtotal))}</p>
                <p><strong>Tax:</strong> {formatCurrency(parseFloat(shipment.billing.tax_amount))}</p>
                <p><strong>Total:</strong> <span className="font-semibold">{formatCurrency(parseFloat(shipment.billing.amount))}</span></p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="flex w-full h-9 sm:h-10 p-1 bg-gray-100 rounded-lg overflow-hidden justify-start" style={{ padding: '1.68rem .75rem' }}>
            <TabsTrigger 
              value="overview" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="docs" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Label & Docs
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recipient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{shipment.receiver_address.contact_name}</div>
                  <div>{shipment.receiver_address.company_name && `${shipment.receiver_address.company_name} - `}{shipment.receiver_address.street_address}</div>
                  <div>
                    {shipment.receiver_address.city}, {shipment.receiver_address.province} {shipment.receiver_address.postal_code}
                  </div>
                  <div>Canada</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">Standard Delivery</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Package</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{shipment.package.weight} kg • {formatCurrency(parseFloat(shipment.billing.amount))}</CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Timeline Section */}
          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Clock" size={20} className="text-blue-600" />
                  Tracking Timeline
                </CardTitle>
                <CardDescription>Key shipment milestones and current progress</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Enhanced Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} className="text-green-600" />
                      Progress
                    </span>
                    <span className="font-medium text-green-600">100% Complete</span>
                  </div>
                  <div className="relative">
                    <Progress value={100} className="h-3 transition-all duration-1000 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-20 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    All milestones completed successfully
                  </div>
                </div>

                {/* Enhanced Timeline Steps */}
                <div className="space-y-4">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                      {/* Timeline Connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110 ${
                          step.completed 
                            ? 'bg-green-100 border-green-500 text-green-600 shadow-sm' 
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          <Icon 
                            name={step.icon as string} 
                            size={18} 
                            className={step.active ? 'text-green-600' : ''}
                          />
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`w-0.5 h-8 mt-2 transition-all duration-300 ${
                            step.completed ? 'bg-green-300' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pt-1">
                        <div className={`font-medium transition-colors duration-300 ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </div>
                        {step.active && (
                          <div className="mt-1">
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                              <Icon name="CheckCircle" size={14} className="mr-1" />
                              Completed
                            </Badge>
                          </div>
                        )}
                        {step.id === 'delivered' && (
                          <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={14} className="text-green-600" />
                              <span>Delivered on {new Date(shipment.created_at).toLocaleDateString()} at 9:56 PM</span>
                            </div>
                          </div>
                        )}
                        {step.completed && step.id !== 'delivered' && (
                          <div className="mt-1 text-xs text-gray-500">
                            ✓ Completed successfully
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Timeline Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-800 mb-3">
                    <Icon name="Info" size={18} />
                    <span className="font-semibold text-lg">Timeline Summary</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Your shipment has completed all stages successfully. The package was delivered on time and in perfect condition.
                    </p>
                    <div className="flex items-center justify-between text-xs text-blue-600">
                      <span>Total Transit Time: 3 days</span>
                      <span>Status: Fully Complete</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        <Icon name="Shield" size={12} className="mr-1" />
                        Secure Delivery
                      </Badge>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <Icon name="Clock" size={12} className="mr-1" />
                        On Time
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Label and invoice</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      // Convert shipment ID to number for API call
                      const shipmentId = parseInt(shipment.id.toString(), 10);
                      if (isNaN(shipmentId)) {
                        throw new Error(`Invalid shipment ID: ${shipment.id}`);
                      }
                      
                      // Use the real API endpoint to generate and download the label
                      const labelResponse = await shippingService.generateLabel(shipmentId);
                      
                      if (labelResponse.label_url) {
                        // Open the label URL in a new tab for download
                        window.open(labelResponse.label_url, '_blank');
                      } else {
                        console.error('No label URL provided in response');
                        alert('Failed to generate label - no URL provided');
                      }
                    } catch (error) {
                      console.error('Failed to generate label:', error);
                      alert('Failed to generate label. Please try again or contact support.');
                    }
                  }}
                  id="parcego-download-label-btn"
                >
                  <Icon name="FileText" size={16} className="mr-2" /> Download Label
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      await generatePdfInvoice({
                        invoiceNumber: `INV-${shipment.tracking_code.replace('-', '')}`,
                        issueDate: new Date().toLocaleDateString(),
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        billTo: {
                          name: shipment.receiver_address.contact_name,
                          address: shipment.receiver_address.street_address,
                          city: shipment.receiver_address.city,
                          province: shipment.receiver_address.province,
                          postalCode: shipment.receiver_address.postal_code,
                          country: shipment.receiver_address.country
                        },
                        lineItems: [
                          {
                            description: `Standard Delivery Service`,
                            quantity: 1,
                            unitPrice: parseFloat(shipment.billing.subtotal),
                            amount: parseFloat(shipment.billing.subtotal)
                          },
                          {
                            description: 'Taxes & Fees',
                            quantity: 1,
                            unitPrice: parseFloat(shipment.billing.tax_amount),
                            amount: parseFloat(shipment.billing.tax_amount)
                          }
                        ],
                        subtotal: parseFloat(shipment.billing.subtotal),
                        tax: parseFloat(shipment.billing.tax_amount),
                        total: parseFloat(shipment.billing.amount),
                        currency: 'CAD',
                        status: shipment.status,
                        shipmentDetails: {
                          trackingNumber: shipment.tracking_code,
                          service: 'Standard Delivery',
                          weight: `${shipment.package.weight} kg`,
                          deliveryDate: new Date(shipment.created_at).toLocaleDateString()
                        },
                        notes: 'Thank you for choosing Parcego! Your package was delivered with care.'
                      });
                    } catch (error) {
                      console.error('Failed to generate PDF invoice:', error);
                      alert('Failed to generate invoice. Please try again.');
                    }
                  }}
                  id="parcego-download-invoice-btn"
                >
                  <Icon name="FileDown" size={16} className="mr-2" /> Download Invoice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${shipment.billing.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${shipment.billing.tax_amount}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${shipment.billing.amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


