"use client";

import React from 'react';
import type { ShippingLabelData } from '@/components/pdf/polished-shipping-label';

/**
 * Generate and download a polished shipping label PDF
 */
export async function generatePolishedShippingLabel(data: ShippingLabelData): Promise<void> {
  try {
    // Dynamically import React-PDF to avoid SSR issues and chunk loading problems
    const { pdf } = await import('@react-pdf/renderer');
    const { default: PolishedShippingLabel } = await import('@/components/pdf/polished-shipping-label');
    
    // Create the PDF document
    const MyDocument = React.createElement(PolishedShippingLabel, { data });
    
    // Generate blob
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(MyDocument as any).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shipping-label-${data.trackingNumber}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Polished PDF generated successfully!');
  } catch (error) {
    console.error('Error generating polished PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generate shipping label blob for preview or external use
 */
export async function generateShippingLabelBlob(data: ShippingLabelData): Promise<Blob> {
  console.log('generateShippingLabelBlob: Starting PDF generation with data:', data);
  
  try {
    console.log('generateShippingLabelBlob: Importing React-PDF modules...');
    
    // Dynamically import React-PDF to avoid SSR issues and chunk loading problems
    const { pdf } = await import('@react-pdf/renderer');
    const { default: PolishedShippingLabel } = await import('@/components/pdf/polished-shipping-label');
    
    console.log('generateShippingLabelBlob: Modules imported successfully');
    
    // Validate required data
    if (!data.trackingNumber) {
      throw new Error('Tracking number is required');
    }
    if (!data.sender?.name) {
      throw new Error('Sender information is incomplete');
    }
    if (!data.recipient?.name) {
      throw new Error('Recipient information is incomplete');
    }
    
    console.log('generateShippingLabelBlob: Data validation passed');
    
    const doc = React.createElement(PolishedShippingLabel, { data });
    console.log('generateShippingLabelBlob: React element created');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(doc as any).toBlob();
    
    console.log('generateShippingLabelBlob: PDF blob generated, size:', blob?.size || 'unknown');
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated PDF blob is empty');
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Cannot resolve module')) {
        throw new Error('PDF generation dependencies not found. Please check your build configuration.');
      }
      if (error.message.includes('Font')) {
        throw new Error('Font loading error. Please check your font configuration.');
      }
      throw new Error(`PDF generation failed: ${error.message}`);
    }
    
    throw new Error('Failed to generate PDF blob due to unknown error.');
  }
}

/**
 * Sample data for testing the polished shipping label
 */
export const sampleShippingData: ShippingLabelData = {
  trackingNumber: 'PCG120496E3V',
  sender: {
    name: "John's Electronics Store",
    address: '123 Business St, Suite 100',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    phone: '(555) 123-4567',
    email: 'john@electronics.com',
  },
  recipient: {
    name: 'Sarah Johnson',
    company: 'ABC Corp',
    address: '456 Customer Ave, Apt 2B',
    city: 'Toronto',
    state: 'ON',
    postalCode: 'M5V3A8',
    phone: '(555) 987-6543',
    email: 'customer@email.com',
  },
  service: {
    type: 'STANDARD',
    description: '3-5 business days',
  },
  package: {
    weight: '2.5 lbs',
    dimensions: '12" × 8" × 6" in',
    type: 'box',
  },
  shipDate: '8/25/2025',
  logoUrl: '/Logo/Horizontal-logo.svg', // Updated to use custom SVG logo
};
