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
import { TrackingService } from "@/lib/api/tracking";
import type { DetailedShipment, ShipmentStatusChange, BillingRecord, UpdateShipmentRequest, TrackingStatusHistoryItem } from "@/lib/api/types";
import { generatePdfInvoice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Map backend status values to labels and icons for display
const statusMeta: Record<string, { label: string; icon: string }> = {
  DRAFT: { label: 'Draft', icon: 'Edit' },
  PENDING_PAYMENT: { label: 'Pending Payment', icon: 'CreditCard' },
  PAID: { label: 'Paid', icon: 'DollarSign' },
  LABEL_GENERATED: { label: 'Label Generated', icon: 'FileText' },
  LABEL_CREATED: { label: 'Label Created', icon: 'FileText' },
  PICKED_UP: { label: 'Picked Up', icon: 'Package' },
  IN_WAREHOUSE: { label: 'In Warehouse', icon: 'Warehouse' },
  DROP_OFF_CONFIRMED: { label: 'Drop-off Confirmed', icon: 'MapPin' },
  RECEIVED_AT_FACILITY: { label: 'Scanned at Origin Facility', icon: 'ScanBarcode' },
  IN_TRANSIT: { label: 'In Transit', icon: 'Truck' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: 'Package' },
  DELIVERY_ATTEMPTED: { label: 'Delivery Attempted', icon: 'Clock' },
  DELIVERED: { label: 'Delivered', icon: 'CheckCircle' },
  FAILED_DELIVERY: { label: 'Failed Delivery', icon: 'CircleX' },
  UNDELIVERABLE: { label: 'Undeliverable', icon: 'XCircle' },
  RETURNED_TO_SENDER: { label: 'Returned to Sender', icon: 'RotateCcw' },
  CANCELLED: { label: 'Cancelled', icon: 'Slash' }
};

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
  const [statusHistory, setStatusHistory] = useState<ShipmentStatusChange[]>([]);
  const [billingRecord, setBillingRecord] = useState<BillingRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingShipment, setIsUpdatingShipment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const shippingService = new ShippingService();
  const trackingService = new TrackingService();

  // Helper function to map TrackingStatusHistoryItem to ShipmentStatusChange
  const mapTrackingHistoryToStatusChange = (
    trackingHistory: TrackingStatusHistoryItem[],
    shipmentId: number
  ): ShipmentStatusChange[] => {
    return trackingHistory.map((item, index) => ({
      id: index + 1, // Generate a temporary ID
      shipment_id: shipmentId,
      status: item.status as any,
      previous_status: item.previous_status as any,
      changed_by_user_id: 0,
      changed_by_user_name: 'System',
      change_reason: item.notes || 'Status update',
      notes: item.notes,
      created_at: item.timestamp,
    }));
  };

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
        // Prefer billing from shipment payload
        if (shipmentData?.billing) {
          setBillingRecord(shipmentData.billing as unknown as BillingRecord);
        } else {
          // Fallback: fetch user billing records and find by shipment_id
          try {
            const list = await shippingService.getBillingRecords({ page: 1, per_page: 50 });
            const match = list.items?.find((b) => b.shipment_id === shipmentId) || null;
            setBillingRecord(match);
          } catch (billingErr) {
            console.error('Failed to load billing record:', billingErr);
            setBillingRecord(null);
          }
        }
        // Fetch tracking data using tracking endpoint
        try {
          if (shipmentData?.tracking_code) {
            const trackingData = await trackingService.trackShipment(shipmentData.tracking_code);
            console.log('Tracking data received:', trackingData);
            
            if (trackingData.status_history && trackingData.status_history.length > 0) {
              const mappedHistory = mapTrackingHistoryToStatusChange(
                trackingData.status_history,
                shipmentId
              );
              setStatusHistory(mappedHistory);
            } else {
              // If no history from tracking endpoint, create timeline events from available dates
              const currentStatus = trackingData.current_status || shipmentData.status;
              const events: ShipmentStatusChange[] = [];
              
              // Create "Label Created" or "Shipment Created" event from created_at
              if (trackingData.created_at || shipmentData.created_at) {
                events.push({
                  id: events.length + 1,
                  shipment_id: shipmentId,
                  status: 'LABEL_CREATED' as any,
                  previous_status: 'DRAFT' as any,
                  changed_by_user_id: 0,
                  changed_by_user_name: 'System',
                  change_reason: 'Shipment created',
                  notes: 'Shipment label created',
                  created_at: trackingData.created_at || shipmentData.created_at,
                });
              }
              
              // Create "Delivered" event from actual_delivery_date if status is DELIVERED
              if (currentStatus === 'DELIVERED' && trackingData.actual_delivery_date) {
                events.push({
                  id: events.length + 1,
                  shipment_id: shipmentId,
                  status: 'DELIVERED' as any,
                  previous_status: 'OUT_FOR_DELIVERY' as any,
                  changed_by_user_id: 0,
                  changed_by_user_name: 'System',
                  change_reason: 'Package delivered',
                  notes: trackingData.delivery_photos && trackingData.delivery_photos.length > 0 
                    ? 'Delivered with proof of delivery' 
                    : 'Package delivered successfully',
                  created_at: trackingData.actual_delivery_date,
                });
              } else if (currentStatus && currentStatus !== 'LABEL_CREATED' && currentStatus !== 'DRAFT') {
                // For other statuses, create an event with the current status
                events.push({
                  id: events.length + 1,
                  shipment_id: shipmentId,
                  status: currentStatus as any,
                  previous_status: 'LABEL_CREATED' as any,
                  changed_by_user_id: 0,
                  changed_by_user_name: 'System',
                  change_reason: 'Status update',
                  notes: `Current status: ${currentStatus}`,
                  created_at: trackingData.last_updated || trackingData.created_at || shipmentData.created_at || new Date().toISOString(),
                });
              }
              
              setStatusHistory(events.length > 0 ? events : []);
            }
          } else {
            console.warn('No tracking code available for shipment:', shipmentId);
            setStatusHistory([]);
          }
        } catch (historyErr) {
          console.error('Failed to load tracking data:', historyErr);
          // On error, try to create a fallback event from shipment status
          if (shipmentData?.status) {
            const fallbackEvent: ShipmentStatusChange = {
              id: 1,
              shipment_id: shipmentId,
              status: shipmentData.status as any,
              previous_status: 'DRAFT' as any,
              changed_by_user_id: 0,
              changed_by_user_name: 'System',
              change_reason: 'Status update',
              notes: `Current status: ${shipmentData.status}`,
              created_at: shipmentData.created_at || new Date().toISOString(),
            };
            setStatusHistory([fallbackEvent]);
          } else {
            setStatusHistory([]);
          }
        }
      } catch (err) {
        console.error('Failed to load shipment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shipment data');
      } finally {
        setIsLoading(false);
      }
    };

    loadShipment();
  }, [id]);

  // Handle shipment update
  const handleUpdateShipment = async (updateData: UpdateShipmentRequest) => {
    if (!shipment) return;
    
    try {
      setIsUpdatingShipment(true);
      const updated = await shippingService.updateShipment(shipment.id, updateData);
      setShipment(updated.shipment as DetailedShipment);
      setShowEditModal(false);
      toast.success('Shipment updated successfully');
    } catch (error: any) {
      console.error('Failed to update shipment:', error);
      toast.error(error.message || 'Failed to update shipment');
    } finally {
      setIsUpdatingShipment(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!shipment || !billingRecord) {
      toast.error('No billing information available');
      return;
    }

    if (billingRecord.payment_status === 'paid') {
      toast.info('This shipment has already been paid');
      return;
    }

    try {
      setIsProcessingPayment(true);
      // Create checkout session
      const checkoutSession = await shippingService.createCheckoutSession(billingRecord.id);
      // Redirect to Stripe checkout
      if (checkoutSession.checkout_url) {
        window.location.href = checkoutSession.checkout_url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

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
              {/* Edit button for DRAFT shipments */}
              {shipment.status === "DRAFT" && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(true)}
                  disabled={isUpdatingShipment}
                  aria-label="Edit shipment"
                  className="hidden sm:flex items-center"
                >
                  <Icon name="Edit" size={16} className="mr-2" /> Edit
                </Button>
              )}
              {/* Payment button for unpaid shipments */}
              {billingRecord && billingRecord.payment_status !== 'paid' && shipment.status !== "DRAFT" && (
                <Button 
                  variant="default" 
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  aria-label="Pay for shipment"
                  className="hidden sm:flex items-center bg-green-600 hover:bg-green-700"
                >
                  {isProcessingPayment ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Icon name="CreditCard" size={16} className="mr-2" /> Pay Now
                    </>
                  )}
                </Button>
              )}
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
              {/* Mobile: Icon-only buttons */}
              {shipment.status === "DRAFT" && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(true)}
                  disabled={isUpdatingShipment}
                  aria-label="Edit shipment"
                  className="sm:hidden p-2"
                  size="sm"
                >
                  <Icon name="Edit" size={16} />
                </Button>
              )}
              {billingRecord && billingRecord.payment_status !== 'paid' && shipment.status !== "DRAFT" && (
                <Button 
                  variant="default" 
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  aria-label="Pay for shipment"
                  className="sm:hidden p-2 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {isProcessingPayment ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="CreditCard" size={16} />
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
              {shipment.billing ? (
                <div className="space-y-2">
                  <p><strong>Subtotal:</strong> {formatCurrency(parseFloat(shipment.billing.subtotal))}</p>
                  <p><strong>Tax:</strong> {formatCurrency(parseFloat(shipment.billing.tax_amount))}</p>
                  <p><strong>Total:</strong> <span className="font-semibold">{formatCurrency(parseFloat(shipment.billing.amount))}</span></p>
                </div>
              ) : (
                <p className="text-gray-500">No billing information available</p>
              )}
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
                <CardContent className="text-sm text-gray-700">{shipment.package.weight} kg • {shipment.billing ? formatCurrency(parseFloat(shipment.billing.amount)) : 'N/A'}</CardContent>
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
                {/* Progress Bar based on status history */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Icon name="TrendingUp" size={14} className="text-green-600" />
                      Progress
                    </span>
                    {(() => {
                      const lastHistoryStatus = statusHistory[statusHistory.length - 1]?.status;
                      const currentStatus = shipment?.status || lastHistoryStatus;
                      // If shipment is DELIVERED, show 100% regardless of history length
                      const pct = currentStatus === 'DELIVERED' ? 100 : 
                                  statusHistory.length > 0 ? Math.min(90, Math.round((statusHistory.length / 6) * 100)) : 0;
                      return <span className="font-medium text-green-600">{pct}% Complete</span>;
                    })()}
                  </div>
                  <div className="relative">
                    {(() => {
                      const lastHistoryStatus = statusHistory[statusHistory.length - 1]?.status;
                      const currentStatus = shipment?.status || lastHistoryStatus;
                      // If shipment is DELIVERED, show 100% regardless of history length
                      const pct = currentStatus === 'DELIVERED' ? 100 : 
                                  statusHistory.length > 0 ? Math.min(90, Math.round((statusHistory.length / 6) * 100)) : 0;
                      return <Progress value={pct} className="h-3 transition-all duration-1000 ease-out" />;
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-20 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {statusHistory.length > 0 ? 'Live status from shipment history' : 'No history available'}
                  </div>
                </div>

                {/* Real Timeline from API */}
                <div className="space-y-4">
                  {statusHistory.map((evt, index) => {
                    const meta = statusMeta[evt.status] || { label: evt.status.replace(/_/g, ' '), icon: 'Info' };
                    const isDelivered = evt.status === 'DELIVERED';
                    return (
                      <div key={evt.id} className="flex items-start gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110 ${
                            isDelivered ? 'bg-green-100 border-green-500 text-green-600 shadow-sm' : 'bg-gray-100 border-gray-300 text-gray-600'
                          }`}>
                            <Icon name={meta.icon} size={18} />
                          </div>
                          {index < statusHistory.length - 1 && (
                            <div className={`w-0.5 h-8 mt-2 transition-all duration-300 ${
                              isDelivered ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="font-medium text-gray-900">
                            {meta.label}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(evt.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {statusHistory.length === 0 && (
                    <div className="text-sm text-gray-500">No tracking events recorded yet.</div>
                  )}
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
                    if (!shipment.billing) {
                      alert('No billing information available for this shipment.');
                      return;
                    }
                    
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
                {billingRecord ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="font-medium">{billingRecord.payment_status?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${parseFloat(billingRecord.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(parseFloat(billingRecord.tax_rate) * 100).toFixed(1)}%):</span>
                      <span>${parseFloat(billingRecord.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(parseFloat(billingRecord.amount))}</span>
                    </div>
                    {billingRecord.paid_at && (
                      <div className="flex justify-between text-sm">
                        <span>Paid at:</span>
                        <span>{new Date(billingRecord.paid_at).toLocaleString()}</span>
                      </div>
                    )}
                    {billingRecord.stripe_checkout_session_id && (
                      <div className="text-xs text-gray-500 break-all">Session: {billingRecord.stripe_checkout_session_id}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No billing information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Shipment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipment</DialogTitle>
            <DialogDescription>
              Update shipment details. Only DRAFT status shipments can be edited.
            </DialogDescription>
          </DialogHeader>
          
          {shipment && (
            <EditShipmentForm
              shipment={shipment}
              onSave={handleUpdateShipment}
              onCancel={() => setShowEditModal(false)}
              isSaving={isUpdatingShipment}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Shipment Form Component
function EditShipmentForm({ 
  shipment, 
  onSave, 
  onCancel, 
  isSaving 
}: { 
  shipment: DetailedShipment; 
  onSave: (data: UpdateShipmentRequest) => void; 
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<UpdateShipmentRequest>({
    sender_address: {
      contact_name: shipment.sender_address.contact_name,
      company_name: shipment.sender_address.company_name || '',
      street_address: shipment.sender_address.street_address,
      street_address_2: shipment.sender_address.street_address_2 || '',
      city: shipment.sender_address.city,
      province: shipment.sender_address.province,
      postal_code: shipment.sender_address.postal_code,
      country: shipment.sender_address.country,
      phone_number: shipment.sender_address.phone_number,
      email: shipment.sender_address.email,
    },
    receiver_address: {
      contact_name: shipment.receiver_address.contact_name,
      company_name: shipment.receiver_address.company_name || '',
      street_address: shipment.receiver_address.street_address,
      street_address_2: shipment.receiver_address.street_address_2 || '',
      city: shipment.receiver_address.city,
      province: shipment.receiver_address.province,
      postal_code: shipment.receiver_address.postal_code,
      country: shipment.receiver_address.country,
      phone_number: shipment.receiver_address.phone_number,
      email: shipment.receiver_address.email,
    },
    package: {
      package_type: shipment.package.package_type,
      weight: shipment.package.weight,
      length: shipment.package.length,
      width: shipment.package.width,
      height: shipment.package.height,
      declared_value: shipment.package.declared_value,
      contents_description: shipment.package.contents_description,
      fragile: shipment.package.fragile,
      requires_signature: shipment.package.requires_signature,
      special_instructions: shipment.package.special_instructions || '',
    },
    special_instructions: shipment.special_instructions || '',
    delivery_notes: shipment.delivery_notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (section: 'sender_address' | 'receiver_address' | 'package', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sender Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sender Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sender_contact_name">Contact Name *</Label>
            <Input
              id="sender_contact_name"
              value={formData.sender_address?.contact_name || ''}
              onChange={(e) => updateField('sender_address', 'contact_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_company">Company Name</Label>
            <Input
              id="sender_company"
              value={formData.sender_address?.company_name || ''}
              onChange={(e) => updateField('sender_address', 'company_name', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="sender_street">Street Address *</Label>
            <Input
              id="sender_street"
              value={formData.sender_address?.street_address || ''}
              onChange={(e) => updateField('sender_address', 'street_address', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="sender_street2">Street Address 2</Label>
            <Input
              id="sender_street2"
              value={formData.sender_address?.street_address_2 || ''}
              onChange={(e) => updateField('sender_address', 'street_address_2', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sender_city">City *</Label>
            <Input
              id="sender_city"
              value={formData.sender_address?.city || ''}
              onChange={(e) => updateField('sender_address', 'city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_province">Province *</Label>
            <Input
              id="sender_province"
              value={formData.sender_address?.province || ''}
              onChange={(e) => updateField('sender_address', 'province', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_postal">Postal Code *</Label>
            <Input
              id="sender_postal"
              value={formData.sender_address?.postal_code || ''}
              onChange={(e) => updateField('sender_address', 'postal_code', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_country">Country *</Label>
            <Input
              id="sender_country"
              value={formData.sender_address?.country || ''}
              onChange={(e) => updateField('sender_address', 'country', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_phone">Phone Number *</Label>
            <Input
              id="sender_phone"
              value={formData.sender_address?.phone_number || ''}
              onChange={(e) => updateField('sender_address', 'phone_number', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="sender_email">Email *</Label>
            <Input
              id="sender_email"
              type="email"
              value={formData.sender_address?.email || ''}
              onChange={(e) => updateField('sender_address', 'email', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Receiver Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Receiver Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="receiver_contact_name">Contact Name *</Label>
            <Input
              id="receiver_contact_name"
              value={formData.receiver_address?.contact_name || ''}
              onChange={(e) => updateField('receiver_address', 'contact_name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_company">Company Name</Label>
            <Input
              id="receiver_company"
              value={formData.receiver_address?.company_name || ''}
              onChange={(e) => updateField('receiver_address', 'company_name', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="receiver_street">Street Address *</Label>
            <Input
              id="receiver_street"
              value={formData.receiver_address?.street_address || ''}
              onChange={(e) => updateField('receiver_address', 'street_address', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="receiver_street2">Street Address 2</Label>
            <Input
              id="receiver_street2"
              value={formData.receiver_address?.street_address_2 || ''}
              onChange={(e) => updateField('receiver_address', 'street_address_2', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="receiver_city">City *</Label>
            <Input
              id="receiver_city"
              value={formData.receiver_address?.city || ''}
              onChange={(e) => updateField('receiver_address', 'city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_province">Province *</Label>
            <Input
              id="receiver_province"
              value={formData.receiver_address?.province || ''}
              onChange={(e) => updateField('receiver_address', 'province', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_postal">Postal Code *</Label>
            <Input
              id="receiver_postal"
              value={formData.receiver_address?.postal_code || ''}
              onChange={(e) => updateField('receiver_address', 'postal_code', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_country">Country *</Label>
            <Input
              id="receiver_country"
              value={formData.receiver_address?.country || ''}
              onChange={(e) => updateField('receiver_address', 'country', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_phone">Phone Number *</Label>
            <Input
              id="receiver_phone"
              value={formData.receiver_address?.phone_number || ''}
              onChange={(e) => updateField('receiver_address', 'phone_number', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receiver_email">Email *</Label>
            <Input
              id="receiver_email"
              type="email"
              value={formData.receiver_address?.email || ''}
              onChange={(e) => updateField('receiver_address', 'email', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Package Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="package_type">Package Type *</Label>
            <Select
              value={formData.package?.package_type || 'box'}
              onValueChange={(value) => updateField('package', 'package_type', value)}
            >
              <SelectTrigger id="package_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="envelope">Envelope</SelectItem>
                <SelectItem value="tube">Tube</SelectItem>
                <SelectItem value="pallet">Pallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0"
              value={formData.package?.weight || 0}
              onChange={(e) => updateField('package', 'weight', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label htmlFor="length">Length (cm) *</Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              min="0"
              value={formData.package?.length || 0}
              onChange={(e) => updateField('package', 'length', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label htmlFor="width">Width (cm) *</Label>
            <Input
              id="width"
              type="number"
              step="0.01"
              min="0"
              value={formData.package?.width || 0}
              onChange={(e) => updateField('package', 'width', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm) *</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0"
              value={formData.package?.height || 0}
              onChange={(e) => updateField('package', 'height', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label htmlFor="declared_value">Declared Value ($) *</Label>
            <Input
              id="declared_value"
              type="number"
              step="0.01"
              min="0"
              value={formData.package?.declared_value || 0}
              onChange={(e) => updateField('package', 'declared_value', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="contents_description">Contents Description *</Label>
            <Textarea
              id="contents_description"
              value={formData.package?.contents_description || ''}
              onChange={(e) => updateField('package', 'contents_description', e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fragile"
                checked={formData.package?.fragile || false}
                onChange={(e) => updateField('package', 'fragile', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="fragile">Fragile</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires_signature"
                checked={formData.package?.requires_signature || false}
                onChange={(e) => updateField('package', 'requires_signature', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="requires_signature">Requires Signature</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="special_instructions">Special Instructions</Label>
          <Textarea
            id="special_instructions"
            value={formData.special_instructions || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="delivery_notes">Delivery Notes</Label>
          <Textarea
            id="delivery_notes"
            value={formData.delivery_notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, delivery_notes: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}


