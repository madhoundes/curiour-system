"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { ShippingLabelData } from '@/components/pdf/polished-shipping-label';

// Types for shipment form data
export interface ShipmentFormData {
  // Recipient data
  recipientName: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientCity: string;
  recipientProvince: string;
  recipientPostalCode: string;
  recipientPhone: string;
  recipientEmail: string;
  
  // Package basics
  packageType: string;
  serviceType: string;
  specialInstructions: string;
  
  // Package details
  weight: string;
  weightUnit: string;
  length: string;
  width: string;
  height: string;
  dimensionUnit: string;
  fragile: boolean;
  valuable: boolean;
  insurance: boolean;
  insuranceAmount?: string;
  
  // Selected quote information
  selectedQuote?: {
    id: string;
    name: string;
    description: string;
    price: number;
    deliveryTime: string;
    features: string[];
  };
}

// Context interface
interface ShipmentContextType {
  formData: ShipmentFormData;
  updateFormField: (field: keyof ShipmentFormData, value: string | boolean) => void;
  updateMultipleFields: (updates: Partial<ShipmentFormData>) => void;
  resetForm: () => void;
  getFormData: () => ShipmentFormData;
  isFormValid: () => boolean;
  generateTrackingNumber: () => string;
  getShippingLabelData: () => Promise<ShippingLabelData>; // For PDF generation - now async
}

// Create context
const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

// Default form data
const defaultFormData: ShipmentFormData = {
  // Recipient data
  recipientName: "Sarah Johnson",
  recipientCompany: "ABC Corp",
  recipientAddress: "456 Customer Ave, Apt 2B",
  recipientCity: "Toronto",
  recipientProvince: "ON",
  recipientPostalCode: "M5V3A8",
  recipientPhone: "(555) 987-6543",
  recipientEmail: "customer@email.com",
  
  // Package basics
  packageType: "box",
  serviceType: "standard",
  specialInstructions: "Handle with care – demo run",
  
  // Package details
  weight: "2.5",
  weightUnit: "lbs",
  length: "12",
  width: "8",
  height: "6",
  dimensionUnit: "in",
  fragile: false,
  valuable: false,
  insurance: false
};

// Provider component
export const ShipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<ShipmentFormData>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('parcego-shipment-form-data');
      if (saved) {
        try {
          return { ...defaultFormData, ...JSON.parse(saved) };
        } catch (error) {
          console.warn('Failed to parse saved form data:', error);
        }
      }
    }
    return defaultFormData;
  });

  // Update single field
  const updateFormField = useCallback((field: keyof ShipmentFormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('parcego-shipment-form-data', JSON.stringify(updated));
      }
      
      return updated;
    });
  }, []);

  // Update multiple fields at once
  const updateMultipleFields = useCallback((updates: Partial<ShipmentFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('parcego-shipment-form-data', JSON.stringify(updated));
      }
      
      return updated;
    });
  }, []);

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('parcego-shipment-form-data');
    }
  }, []);

  // Get current form data
  const getFormData = useCallback(() => formData, [formData]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    return !!(
      formData.recipientName &&
      formData.recipientAddress &&
      formData.recipientCity &&
      formData.recipientProvince &&
      formData.recipientPostalCode &&
      formData.recipientPhone &&
      formData.weight &&
      formData.length &&
      formData.width &&
      formData.height
    );
  }, [formData]);

  // Generate tracking number
  const generateTrackingNumber = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ASH-${timestamp}-${random.toUpperCase()}`;
  }, []);

  // Get data formatted for shipping label PDF
  const getShippingLabelData = useCallback(async () => {
    const { getSenderFromProfile } = await import('@/lib/shipping-label-service');
    const trackingNumber = generateTrackingNumber();
    const date = new Date();
    const currentDate = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;

    // Get sender information from profile
    const senderInfo = await getSenderFromProfile();

    return {
      trackingNumber,
      sender: senderInfo,
      recipient: {
        name: formData.recipientName,
        company: formData.recipientCompany || undefined,
        address: formData.recipientAddress,
        city: formData.recipientCity,
        state: formData.recipientProvince,
        postalCode: formData.recipientPostalCode,
        phone: formData.recipientPhone,
        email: formData.recipientEmail || "customer@email.com"
      },
      service: {
        type: formData.serviceType.toUpperCase(),
        description: formData.serviceType === 'standard' ? '3-5 business days' : 'Express delivery'
      },
      package: {
        weight: `${formData.weight} ${formData.weightUnit}`,
        dimensions: `${formData.length}" × ${formData.width}" × ${formData.height}" ${formData.dimensionUnit}`,
        type: formData.packageType
      },
      shipDate: currentDate
    };
  }, [formData, generateTrackingNumber]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    formData,
    updateFormField,
    updateMultipleFields,
    resetForm,
    getFormData,
    isFormValid,
    generateTrackingNumber,
    getShippingLabelData
  }), [
    formData,
    updateFormField,
    updateMultipleFields,
    resetForm,
    getFormData,
    isFormValid,
    generateTrackingNumber,
    getShippingLabelData
  ]);

  return (
    <ShipmentContext.Provider value={contextValue}>
      {children}
    </ShipmentContext.Provider>
  );
};

// Custom hook to use the shipment context
export const useShipment = (): ShipmentContextType => {
  const context = useContext(ShipmentContext);
  if (context === undefined) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
};
