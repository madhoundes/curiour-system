"use client";

import React, { useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { useReactToPrint } from "react-to-print";
import { getMockShipments, formatCurrency } from "@/lib/mock/shipments";
import { downloadFile, generateMockInvoice, generatePdfInvoice } from '@/lib/utils';

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
  
  // Data loading state for consistent SSR/CSR
  const [allShipments, setAllShipments] = React.useState<Array<Record<string, unknown>>>([]);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  // Load data on client to prevent hydration mismatches
  React.useEffect(() => {
    const shipments = getMockShipments();
    setAllShipments(shipments);
    setIsDataLoaded(true);
  }, []);

  const shipment = useMemo(() => 
    isDataLoaded ? allShipments.find((s) => s.id === id) : null, 
    [id, allShipments, isDataLoaded]
  );

  // Print functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Shipment ${shipment?.id || 'Details'}`,
    onAfterPrint: () => {
      console.log('Print completed');
    },
  });

  if (!shipment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-gray-600">Shipment not found.</p>
        <Button variant="ghost" className="mt-2" onClick={() => router.push("/shipments")} id="parcego-shipments-back-btn">
          <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Shipments
        </Button>
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
                <p className="text-sm text-gray-600 mb-1">Tracking: {shipment.trackingNumber}</p>
                <p className="text-xs text-gray-500">Created on {new Date(shipment.createdAt).toLocaleDateString()}</p>
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
                  onClick={() => {
                    if (confirm(`Are you sure you want to cancel shipment ${shipment.id}? This action cannot be undone.`)) {
                      // Update the shipment status to CANCELLED
                      shipment.status = "CANCELLED";
                      shipment.updatedAt = new Date().toISOString();
                      alert(`Shipment ${shipment.id} has been cancelled successfully.`);
                      // Redirect back to shipments list
                      router.push("/shipments");
                    }
                  }}
                  aria-label="Cancel shipment"
                  className="p-2"
                  size="sm"
                >
                  <Icon name="X" size={16} />
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
              <span className="text-sm text-gray-700">{new Date(shipment.createdAt).toLocaleString()}</span>
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
                <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b pb-2">Shipment Information</h2>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {shipment.status.replace(/_/g, " ")}</p>
                  <p><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</p>
                  <p><strong>Service:</strong> {shipment.service} via {shipment.courier}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b pb-2">Package Details</h2>
                <div className="space-y-2">
                  <p><strong>Weight:</strong> {shipment.weightKg.toFixed(2)} kg</p>
                  <p><strong>Cost:</strong> {formatCurrency(shipment.cost)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Recipient Information</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {shipment.recipient.name}</p>
                <p><strong>Address:</strong> {shipment.recipient.address1}</p>
                <p><strong>City:</strong> {shipment.recipient.city}, {shipment.recipient.province} {shipment.recipient.postalCode}</p>
                <p><strong>Country:</strong> {shipment.recipient.country}</p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
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
                  <div className="font-medium">{shipment.recipient.name}</div>
                  <div>{shipment.recipient.address1}</div>
                  <div>
                    {shipment.recipient.city}, {shipment.recipient.province} {shipment.recipient.postalCode}
                  </div>
                  <div>{shipment.recipient.country}</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{shipment.service} via {shipment.courier}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Package</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700">{shipment.weightKg.toFixed(2)} kg • {formatCurrency(shipment.cost)}</CardContent>
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
                              <span>Delivered on {new Date(shipment.createdAt).toLocaleDateString()} at 9:56 PM</span>
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
                <Button variant="outline" onClick={() => router.push(`/label/preview?tracking=${encodeURIComponent(shipment.trackingNumber)}`)}>
                  <Icon name="FileText" size={16} className="mr-2" /> View Label
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      await generatePdfInvoice({
                        invoiceNumber: `INV-${shipment.trackingNumber.replace('-', '')}`,
                        issueDate: new Date().toLocaleDateString(),
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        billTo: {
                          name: shipment.recipient.name,
                          address: shipment.recipient.address1,
                          city: shipment.recipient.city,
                          province: shipment.recipient.province,
                          postalCode: shipment.recipient.postalCode,
                          country: shipment.recipient.country
                        },
                        lineItems: [
                          {
                            description: `${shipment.service} Delivery Service`,
                            quantity: 1,
                            unitPrice: Math.max(0, shipment.cost - 4.5),
                            amount: Math.max(0, shipment.cost - 4.5)
                          },
                          {
                            description: 'Taxes & Fees',
                            quantity: 1,
                            unitPrice: 4.5,
                            amount: 4.5
                          }
                        ],
                        subtotal: Math.max(0, shipment.cost - 4.5),
                        tax: 4.5,
                        total: shipment.cost,
                        currency: 'CAD',
                        status: shipment.status,
                        shipmentDetails: {
                          trackingNumber: shipment.trackingNumber,
                          service: shipment.service,
                          weight: `${shipment.weightKg.toFixed(2)} kg`,
                          deliveryDate: new Date(shipment.createdAt).toLocaleDateString()
                        },
                        notes: 'Thank you for choosing Parcego! Your package was delivered with care.'
                      });
                    } catch (error) {
                      console.error('Failed to generate PDF invoice:', error);
                      // Fallback to text invoice
                      const invoiceContent = generateMockInvoice(shipment);
                      const filename = `invoice-${shipment.trackingNumber}-${new Date().toISOString().split('T')[0]}.txt`;
                      downloadFile(invoiceContent, filename, 'text/plain');
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
              <CardContent className="text-sm text-gray-700">
                Base: {formatCurrency(Math.max(0, shipment.cost - 4.5))} • Taxes/Fees: {formatCurrency(4.5)} • Total: {formatCurrency(shipment.cost)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


