"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DetailedShipment } from "@/lib/api/types";
import { ShippingService } from "@/lib/api/shipping";
import { toast } from "sonner";

interface PrintLabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShipmentIds: number[];
  shipments: DetailedShipment[];
}

interface ShipmentGenerationResult {
  shipmentId: number;
  trackingCode: string;
  success: boolean;
  error?: string;
  labelUrl?: string;
}

// Statuses that are not eligible for label generation.
//
// `DRAFT` and `PENDING_PAYMENT` are pre-payment so the backend will refuse
// the label with HTTP 402. `CANCELLED` and the post-delivery terminal
// states are ones where printing a label would either be misleading
// (cancelled) or pointless (already delivered/returned).
const INELIGIBLE_STATUSES = [
  'DRAFT',
  'PENDING_PAYMENT',
  'CANCELLED',
  'DELIVERED',
  'UNDELIVERED',
  'RETURNED_TO_SENDER',
] as const;

// Check if a shipment is eligible for label generation
const isEligibleForLabelGeneration = (shipment: DetailedShipment): boolean => {
  if (INELIGIBLE_STATUSES.includes(shipment.status as any)) {
    return false;
  }

  return true;
};

// Get error message for ineligible shipment
const getIneligibleReason = (shipment: DetailedShipment): string => {
  if (shipment.status === 'DRAFT' || shipment.status === 'PENDING_PAYMENT') {
    return 'Shipment must be paid before generating a label';
  }
  if (INELIGIBLE_STATUSES.includes(shipment.status as any)) {
    return `Cannot generate label for ${shipment.status.toLowerCase().replace(/_/g, ' ')} shipment`;
  }
  return 'Shipment is not eligible for label generation';
};

const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  open,
  onOpenChange,
  selectedShipmentIds,
  shipments,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<Map<number, ShipmentGenerationResult>>(new Map());
  const shippingService = new ShippingService();

  // Filter shipments based on selected IDs
  const selectedShipments = useMemo(() => {
    if (!Array.isArray(shipments)) return [];
    return shipments.filter(shipment => selectedShipmentIds.includes(shipment.id));
  }, [shipments, selectedShipmentIds]);

  // Separate eligible and ineligible shipments
  const { eligibleShipments, ineligibleShipments } = useMemo(() => {
    const eligible: DetailedShipment[] = [];
    const ineligible: DetailedShipment[] = [];
    
    selectedShipments.forEach(shipment => {
      if (isEligibleForLabelGeneration(shipment)) {
        eligible.push(shipment);
      } else {
        ineligible.push(shipment);
      }
    });
    
    return { eligibleShipments: eligible, ineligibleShipments: ineligible };
  }, [selectedShipments]);

  // Reset results when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGenerationResults(new Map());
    }
    onOpenChange(newOpen);
  };

  // Generate and download labels using real API
  const handleGenerateLabels = async () => {
    if (eligibleShipments.length === 0) {
      toast.error('No eligible shipments selected', {
        description: 'All selected shipments are ineligible for label generation (cancelled, delivered, etc.)',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationResults(new Map());
    
    // Pre-populate results for ineligible shipments
    const results = new Map<number, ShipmentGenerationResult>();
    ineligibleShipments.forEach(shipment => {
      results.set(shipment.id, {
        shipmentId: shipment.id,
        trackingCode: shipment.tracking_code,
        success: false,
        error: getIneligibleReason(shipment),
      });
    });

    try {
      // Generate labels for each eligible shipment using Promise.allSettled
      // This allows us to handle partial failures gracefully
      const labelPromises = eligibleShipments.map(async (shipment) => {
        try {
          const labelResponse = await shippingService.generateLabel(shipment.id);
          
          if (labelResponse.label_url) {
            // Open each label in a new tab
            window.open(labelResponse.label_url, '_blank');
            
            return {
              shipmentId: shipment.id,
              trackingCode: shipment.tracking_code,
              success: true,
              labelUrl: labelResponse.label_url,
            } as ShipmentGenerationResult;
          } else {
            throw new Error('No label URL received from API');
          }
        } catch (error: any) {
          // Extract error message
          let errorMessage = 'Failed to generate label';
          
          // Check for 402 status (payment required) - often indicates DRAFT status
          if (error?.status === 402 || error?.response?.status === 402) {
            // Prioritize details field for 402 errors (contains specific API message)
            if (error?.details && typeof error.details === 'string') {
              errorMessage = error.details;
            } else if (error?.response?.data?.details && typeof error.response.data.details === 'string') {
              errorMessage = error.response.data.details;
            } else if (error?.message && error.message.includes('paid')) {
              // Use message if it mentions payment
              errorMessage = error.message;
            } else if (error?.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (typeof detail === 'string') {
                errorMessage = detail;
              } else if (Array.isArray(detail) && detail.length > 0) {
                errorMessage = detail[0].msg || errorMessage;
              }
            } else {
              errorMessage = 'Shipment must be paid before generating a label';
            }
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.response?.data?.detail) {
            // Handle API error responses
            const detail = error.response.data.detail;
            if (typeof detail === 'string') {
              errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
              errorMessage = detail[0].msg || errorMessage;
            }
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data?.details) {
            errorMessage = error.response.data.details;
          }
          
          console.error(`Error generating label for shipment ${shipment.id}:`, error);
          
          return {
            shipmentId: shipment.id,
            trackingCode: shipment.tracking_code,
            success: false,
            error: errorMessage,
          } as ShipmentGenerationResult;
        }
      });
      
      // Wait for all promises to settle (both success and failure)
      const settledResults = await Promise.allSettled(labelPromises);
      
      // Process settled results
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(result.value.shipmentId, result.value);
        } else {
          // Handle unexpected promise rejection
          const shipment = eligibleShipments[index];
          results.set(shipment.id, {
            shipmentId: shipment.id,
            trackingCode: shipment.tracking_code,
            success: false,
            error: result.reason?.message || 'Unexpected error occurred',
          });
        }
      });

      setGenerationResults(results);

      // Count successes and failures
      const successful = Array.from(results.values()).filter(r => r.success).length;
      const failed = Array.from(results.values()).filter(r => !r.success).length;

      // Show summary toast
      if (successful > 0 && failed === 0) {
        toast.success(`Successfully generated ${successful} label${successful !== 1 ? 's' : ''}`, {
          description: 'Labels have been opened in new tabs',
        });
        // Close modal after a short delay if all succeeded
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } else if (successful > 0 && failed > 0) {
        toast.warning(`Generated ${successful} label${successful !== 1 ? 's' : ''}, ${failed} failed`, {
          description: 'Some shipments could not be processed. Check the list below for details.',
          duration: 5000,
        });
      } else {
        toast.error(`Failed to generate labels`, {
          description: 'None of the selected shipments could be processed. Check the errors below.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Unexpected error during label generation:', error);
      toast.error('An unexpected error occurred', {
        description: 'Please try again or contact support if the issue persists',
      });
    } finally {
      // Always resolve the generating state
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'SCANNED':
        return 'bg-purple-100 text-purple-800';
      case 'LABEL_CREATED':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Print Shipping Labels
          </DialogTitle>
        </DialogHeader>

        {/* Selected Shipments Summary */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {selectedShipments.length} shipment{selectedShipments.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-gray-600">
                {eligibleShipments.length > 0 ? (
                  <>
                    {eligibleShipments.length} eligible for label generation
                    {ineligibleShipments.length > 0 && (
                      <span className="text-amber-600"> • {ineligibleShipments.length} ineligible (will be skipped)</span>
                    )}
                  </>
                ) : (
                  'All selected shipments are ineligible for label generation'
                )}
              </p>
            </div>
            <Button 
              onClick={handleGenerateLabels} 
              disabled={isGenerating || eligibleShipments.length === 0}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} />
                  Generate & Download
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Shipments List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedShipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Icon name="Package" size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No shipments selected</p>
              <p className="text-sm">Select shipments from the main list to print labels</p>
            </div>
          ) : (
            selectedShipments.map((shipment) => {
              const isEligible = isEligibleForLabelGeneration(shipment);
              const result = generationResults.get(shipment.id);
              const isProcessing = isGenerating && isEligible && !result;
              
              return (
                <Card 
                  key={shipment.id} 
                  className={`p-4 transition-all ${
                    !isEligible 
                      ? 'opacity-60 border-gray-300' 
                      : result?.success 
                        ? 'border-green-300 bg-green-50/30' 
                        : result?.success === false 
                          ? 'border-red-300 bg-red-50/30' 
                          : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium truncate">{shipment.tracking_code}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(shipment.status)}`}
                          >
                            {formatStatus(shipment.status)}
                          </Badge>
                          {!isEligible && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              Ineligible
                            </Badge>
                          )}
                          {result?.success && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              <Icon name="CheckCircle" size={12} className="mr-1" />
                              Generated
                            </Badge>
                          )}
                          {result?.success === false && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                              <Icon name="XCircle" size={12} className="mr-1" />
                              Failed
                            </Badge>
                          )}
                          {isProcessing && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                              <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                              Processing
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">To:</p>
                            <p className="font-medium">{shipment.receiver_address.contact_name}</p>
                            <p className="text-gray-600">
                              {shipment.receiver_address.city}, {shipment.receiver_address.province}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600 mb-1">Service:</p>
                            <p className="font-medium">Standard</p>
                            <p className="text-gray-600">{shipment.package.weight} kg</p>
                          </div>
                        </div>
                        
                        {/* Error message display */}
                        {result?.success === false && result.error && (
                          <Alert variant="destructive" className="mt-3">
                            <Icon name="AlertCircle" size={16} />
                            <AlertDescription className="text-sm">
                              {result.error}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {/* Ineligible reason */}
                        {!isEligible && !result && (
                          <Alert className="mt-3 border-amber-300 bg-amber-50/50">
                            <Icon name="AlertTriangle" size={16} className="text-amber-600" />
                            <AlertDescription className="text-sm text-amber-800">
                              {getIneligibleReason(shipment)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>✓ Unified Parcego branding</p>
              <p>✓ Professional 4×6 inch labels</p>
              <p>✓ Ready for shipping</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateLabels} 
                disabled={isGenerating || eligibleShipments.length === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} />
                    Generate Labels
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintLabelsModal;