"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { ShippingLabelData } from "@/components/pdf/polished-shipping-label";

interface LabelGenerationSuccessContentProps {
  trackingNumber: string;
  onClose: () => void;
}

// Mock order data generator
const generateMockOrderData = (trackingNumber: string) => {
  // Use tracking number to generate consistent mock data
  const hash = trackingNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const recipients = ["Sarah Johnson", "John Smith", "Emily Davis", "Michael Brown"];
  const cities = ["Toronto", "Vancouver", "Montreal", "Calgary"];
  const provinces = ["ON", "BC", "QC", "AB"];
  
  return {
    recipientName: recipients[hash % recipients.length],
    recipientCompany: "ABC Corp",
    recipientAddress: "456 Customer Ave, Apt 2B",
    recipientCity: cities[hash % cities.length],
    recipientProvince: provinces[hash % provinces.length],
    recipientPostalCode: "M5V3A8",
    recipientPhone: "(555) 987-6543",
    recipientEmail: "customer@email.com",
    serviceType: "standard",
    selectedQuote: {
      deliveryTime: "3-5 business days",
      price: 15.99
    }
  };
};

const LabelGenerationSuccessContent: React.FC<LabelGenerationSuccessContentProps> = ({
  trackingNumber,
  onClose
}) => {
  const mockOrderData = useMemo(() => generateMockOrderData(trackingNumber), [trackingNumber]);

  const handlePrint = () => {
    // Force a small delay to ensure DOM is ready for printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Generate and download PDF label using the polished React-PDF version
  const handleDownloadLabel = async () => {
    try {
      // Prepare data for the polished shipping label
      const shippingData: ShippingLabelData = {
        trackingNumber,
        sender: {
          name: "John's Electronics Store",
          address: '123 Business St, Suite 100',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
        },
        recipient: {
          name: mockOrderData.recipientName,
          company: mockOrderData.recipientCompany,
          address: mockOrderData.recipientAddress,
          city: mockOrderData.recipientCity,
          state: mockOrderData.recipientProvince,
          postalCode: mockOrderData.recipientPostalCode,
          phone: mockOrderData.recipientPhone,
          email: mockOrderData.recipientEmail,
        },
        service: {
          type: mockOrderData.serviceType.toUpperCase(),
          description: mockOrderData.selectedQuote.deliveryTime,
        },
        package: {
          weight: "2.5 lbs",
          dimensions: '12" × 8" × 6" in',
          type: "box",
        },
        shipDate: new Date().toLocaleDateString(),
        logoUrl: '/Logo/Horizontal-logo.svg',
      };

      // Dynamically import and generate the polished PDF to avoid chunk loading issues
      const { generatePolishedShippingLabel } = await import('@/lib/pdf-generator');
      await generatePolishedShippingLabel(shippingData);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
              <p className="text-gray-900">{mockOrderData.recipientName}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Destination:</span>
              <p className="text-gray-900">{mockOrderData.recipientCity}, {mockOrderData.recipientProvince}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Service:</span>
              <p className="text-gray-900 capitalize">{mockOrderData.serviceType}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Delivery Time:</span>
              <p className="text-gray-900">{mockOrderData.selectedQuote.deliveryTime}</p>
            </div>
            <div className="space-y-1 text-left">
              <span className="font-medium text-gray-800">Total Paid:</span>
              <p className="text-gray-900 font-semibold text-base">${mockOrderData.selectedQuote.price}</p>
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
