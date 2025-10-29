"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { shippingService } from '@/lib/api/shipping';

interface ShippingLabelReadyProps {
  shipmentId?: number;
  trackingNumber?: string;
  shipmentData?: any;
  onPreview?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ShippingLabelReady({
  shipmentId,
  trackingNumber,
  shipmentData,
  onPreview,
  onDownload,
  className = ""
}: ShippingLabelReadyProps) {
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreviewPDF = async () => {
    if (onPreview) {
      onPreview();
      return;
    }

    if (!shipmentId) {
      alert('Shipment ID is required to preview the label. Please try again.');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const labelResponse = await shippingService.generateLabel(shipmentId);
      
      if (labelResponse.success && labelResponse.label_url) {
        // Open the label URL in a new tab for preview
        window.open(labelResponse.label_url, '_blank');
      } else {
        throw new Error(labelResponse.message || 'Failed to generate label preview');
      }
    } catch (error) {
      console.error('Error generating label preview:', error);
      alert(`Failed to generate label preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    if (!shipmentId) {
      alert('Shipment ID is required to download the label. Please try again.');
      return;
    }

    setIsDownloading(true);
    try {
      const labelResponse = await shippingService.generateLabel(shipmentId);
      
      if (labelResponse.success && labelResponse.label_url) {
        // Create a temporary link to download the PDF
        const link = document.createElement('a');
        link.href = labelResponse.label_url;
        link.download = `shipping-label-${trackingNumber || shipmentId}.pdf`;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(labelResponse.message || 'Failed to generate label');
      }
    } catch (error) {
      console.error('Error downloading label:', error);
      alert(`Failed to download label: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Icon name="Package" size={20} />
          <span>Shipping Label Ready</span>
        </CardTitle>
        <CardDescription className="text-blue-600">
          Your complete shipping label is ready for preview and download. All package details, addresses, and handling instructions are included.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tracking Number Display */}
        {trackingNumber && (
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                <p className="text-lg font-mono font-bold text-gray-900">{trackingNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {(() => {
                    const date = new Date();
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shipment Summary */}
        {shipmentData && (
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">From</p>
                <p className="text-gray-900">{shipmentData.sender?.name || 'N/A'}</p>
                <p className="text-gray-600">{shipmentData.sender?.city || 'N/A'}, {shipmentData.sender?.state || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">To</p>
                <p className="text-gray-900">{shipmentData.recipient?.name || 'N/A'}</p>
                <p className="text-gray-600">{shipmentData.recipient?.city || 'N/A'}, {shipmentData.recipient?.state || 'N/A'}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Weight</p>
                  <p className="text-gray-900">{shipmentData.package?.weight || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Service</p>
                  <p className="text-gray-900 capitalize">{shipmentData.service?.type || 'Standard'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Dimensions</p>
                  <p className="text-gray-900">{shipmentData.package?.dimensions || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePreviewPDF}
            disabled={isGeneratingPreview || isDownloading}
            variant="outline"
            className="flex-1 bg-white hover:bg-blue-50 border-blue-300"
          >
            {isGeneratingPreview ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <Icon name="Eye" size={16} className="mr-2" />
                Preview PDF
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPreview || isDownloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isDownloading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Downloading...</span>
              </div>
            ) : (
              <>
                <Icon name="Download" size={16} className="mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        {/* Success Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              All Details Complete - Ready for Label Generation
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ShippingLabelReady;