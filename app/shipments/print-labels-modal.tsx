"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Shipment } from "@/lib/mock/shipments";
import { shippingService } from "@/lib/api/shipping";

interface PrintLabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShipmentIds: string[];
  shipments: Shipment[];
}

const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  open,
  onOpenChange,
  selectedShipmentIds,
  shipments,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter shipments based on selected IDs
  const selectedShipments = useMemo(() => {
    return shipments.filter(shipment => selectedShipmentIds.includes(shipment.id));
  }, [shipments, selectedShipmentIds]);

  // Generate and download labels using real API
  const handleGenerateLabels = async () => {
    if (selectedShipments.length === 0) return;

    setIsGenerating(true);
    
    try {
      // Generate labels for each selected shipment using real API
      const labelPromises = selectedShipments.map(async (shipment) => {
        try {
          // Convert string ID to number for API call
          const shipmentId = parseInt(shipment.id, 10);
          if (isNaN(shipmentId)) {
            throw new Error(`Invalid shipment ID: ${shipment.id}`);
          }
          
          const labelResponse = await shippingService.generateLabel(shipmentId);
          if (labelResponse.label_url) {
            // Open each label in a new tab
            window.open(labelResponse.label_url, '_blank');
          }
          return labelResponse;
        } catch (error) {
          console.error(`Error generating label for shipment ${shipment.id}:`, error);
          throw error;
        }
      });
      
      await Promise.all(labelPromises);
      onOpenChange(false); // Close modal after successful generation
    } catch (error) {
      console.error('Error generating labels:', error);
      // Error handling - could show a toast notification here
      alert('Failed to generate some labels. Please try again.');
    } finally {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                Labels will be generated as a single PDF file
              </p>
            </div>
            <Button 
              onClick={handleGenerateLabels} 
              disabled={isGenerating || selectedShipments.length === 0}
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
            selectedShipments.map((shipment) => (
              <Card key={shipment.id} className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{shipment.trackingNumber}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(shipment.status)}`}
                        >
                          {formatStatus(shipment.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">To:</p>
                          <p className="font-medium">{shipment.recipient.name}</p>
                          <p className="text-gray-600">
                            {shipment.recipient.city}, {shipment.recipient.province || 'ON'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 mb-1">Service:</p>
                          <p className="font-medium">{shipment.service}</p>
                          <p className="text-gray-600">{shipment.weightKg} kg</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-sm font-medium">
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
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
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateLabels} 
                disabled={isGenerating || selectedShipments.length === 0}
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