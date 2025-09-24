"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { shippingService } from "@/lib/api/shipping";

interface LabelGenerationSuccessContentProps {
  trackingNumber: string;
  shipmentId?: number;
  onClose: () => void;
  orderData?: {
    recipientName: string;
    recipientCity: string;
    recipientProvince: string;
    serviceType: string;
    selectedQuote?: {
      deliveryTime: string;
      price: string;
    };
  };
}

const LabelGenerationSuccessContent: React.FC<LabelGenerationSuccessContentProps> = ({
  trackingNumber,
  shipmentId,
  onClose,
  orderData
}) => {
  const handlePrint = () => {
    // Force a small delay to ensure DOM is ready for printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Generate and download PDF label using the real API
  const handleDownloadLabel = async () => {
    try {
      if (!shipmentId) {
        alert('Shipment ID is required to download the label. Please try again.');
        return;
      }

      const labelResponse = await shippingService.generateLabel(shipmentId);
      
      if (labelResponse.success && labelResponse.label_url) {
        // Open the label URL in a new tab
        window.open(labelResponse.label_url, '_blank');
      } else {
        throw new Error(labelResponse.message || 'Failed to generate label');
      }
      
    } catch (error) {
      console.error('Error generating label:', error);
      alert(`Failed to generate label: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="relative text-center p-4 border-b">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close label preview"
          id="parcego-label-success-close-btn"
        >
          <Icon name="X" size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Label Generated Successfully! 🎉
        </h1>
        <p className="text-gray-600">
          Your shipping label is ready for download and printing
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center shadow-lg">
            <Icon name="Check" size={40} className="text-green-700" />
          </div>
        </div>
        
        {/* Order Details - Left aligned as requested */}
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Order Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Tracking Number:</span>
              <p className="text-gray-900 font-mono text-base" id="parcego-label-tracking-display">{trackingNumber}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Recipient:</span>
              <p className="text-gray-900">{orderData?.recipientName || 'N/A'}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Destination:</span>
              <p className="text-gray-900">{orderData?.recipientCity || 'N/A'}, {orderData?.recipientProvince || 'N/A'}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Service:</span>
              <p className="text-gray-900 capitalize">{orderData?.serviceType || 'N/A'}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Delivery Time:</span>
              <p className="text-gray-900">{orderData?.selectedQuote?.deliveryTime || 'N/A'}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Total Paid:</span>
              <p className="text-gray-900 font-semibold text-base">${orderData?.selectedQuote?.price || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Next Steps */}
        <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 text-left">Next Steps:</h4>
          <ul className="text-sm text-blue-900 space-y-2">
            <li className="flex items-start text-left">
              <span className="text-blue-700 mr-2">•</span>
              Download your shipping label
            </li>
            <li className="flex items-start text-left">
              <span className="text-blue-700 mr-2">•</span>
              Print the label on 4x6 inch paper
            </li>
            <li className="flex items-start text-left">
              <span className="text-blue-700 mr-2">•</span>
              Attach the label to your package
            </li>
            <li className="flex items-start text-left">
              <span className="text-blue-700 mr-2">•</span>
              Drop off at any authorized location
            </li>
          </ul>
        </div>
        
        {/* Action Buttons - Only Print and Download */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium shadow-md transition-all duration-300 ease-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            id="parcego-label-success-print-btn"
            aria-label="Print shipping label on 4x6 inch paper"
          >
            <Icon name="Printer" size={18} className="mr-2" />
            Print Label
          </Button>
          
          <Button
            onClick={handleDownloadLabel}
            variant="outline"
            className="flex-1 border-green-700 text-green-700 hover:bg-green-100 h-12 text-base font-medium transition-all duration-300 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            id="parcego-label-success-download-btn"
            aria-label="Download shipping label as PDF file"
          >
            <Icon name="Download" size={18} className="mr-2" />
            Download Label (PDF)
          </Button>
        </div>
      </div>
    </>
  );
};

export default LabelGenerationSuccessContent;
