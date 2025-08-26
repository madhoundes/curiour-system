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
    const blob = await pdf(MyDocument).toBlob();
    
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
  try {
    // Dynamically import React-PDF to avoid SSR issues and chunk loading problems
    const { pdf } = await import('@react-pdf/renderer');
    const { default: PolishedShippingLabel } = await import('@/components/pdf/polished-shipping-label');
    
    const doc = React.createElement(PolishedShippingLabel, { data });
    return await pdf(doc).toBlob();
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error('Failed to generate PDF blob.');
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
  logoUrl: '/logo-horizontal.png', // Adjust path as needed
};
