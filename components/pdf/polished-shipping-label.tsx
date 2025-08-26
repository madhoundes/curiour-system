"use client";

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Use built-in fonts only - no custom font registration needed
// React PDF has built-in support for Helvetica, Times-Roman, and Courier
// This eliminates fontkit loading issues in browser environment

// Define consistent styles
const styles = StyleSheet.create({
  page: {
    width: 288, // 4 inches
    height: 432, // 6 inches
    padding: 16,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1pt solid #e5e7eb',
  },
  
  logo: {
    width: 80,
    height: 24,
  },
  
  trackingNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1f2937',
    letterSpacing: '0.5pt',
  },
  
  // Section styles
  section: {
    marginBottom: 12,
  },
  
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 6,
    letterSpacing: '0.3pt',
    textTransform: 'uppercase',
  },
  
  sectionContent: {
    paddingLeft: 0,
  },
  
  // Text styles
  primaryText: {
    fontSize: 10,
    fontWeight: 400,
    color: '#1f2937',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  
  secondaryText: {
    fontSize: 9,
    fontWeight: 400,
    color: '#4b5563',
    marginBottom: 2,
    lineHeight: 1.3,
  },
  
  labelText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.2pt',
  },
  
  // Service box
  serviceContainer: {
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  
  serviceBox: {
    border: '1.5pt solid #1f2937',
    borderRadius: 4,
    padding: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  
  serviceType: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: '0.3pt',
  },
  
  serviceDescription: {
    fontSize: 7,
    fontWeight: 400,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Package details grid
  detailsContainer: {
    marginTop: 8,
  },
  
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  
  detailLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: '#6b7280',
    width: 60,
    textTransform: 'uppercase',
    letterSpacing: '0.2pt',
  },
  
  detailValue: {
    fontSize: 9,
    fontWeight: 400,
    color: '#1f2937',
    flex: 1,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingTop: 8,
    borderTop: '0.5pt solid #e5e7eb',
  },
  
  footerText: {
    fontSize: 7,
    fontWeight: 400,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  
  // Divider
  divider: {
    borderBottom: '0.5pt solid #e5e7eb',
    marginVertical: 8,
  },
  
  // Address container
  addressContainer: {
    minHeight: 50,
  },
  
  // Contact info
  contactInfo: {
    marginTop: 4,
  },
});

export interface ShippingLabelData {
  trackingNumber: string;
  sender: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone?: string;
    email?: string;
  };
  recipient: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  service: {
    type: string;
    description: string;
  };
  package: {
    weight: string;
    dimensions: string;
    type: string;
  };
  shipDate: string;
  logoUrl?: string;
}

interface PolishedShippingLabelProps {
  data: ShippingLabelData;
}

const PolishedShippingLabel: React.FC<PolishedShippingLabelProps> = ({ data }) => {
  return (
    <Document>
      <Page size={[288, 432]} style={styles.page}>
        {/* Header with logo and tracking number */}
        <View style={styles.header}>
          <View>
            {data.logoUrl && (
              <Image
                src={data.logoUrl}
                style={styles.logo}
                alt="Company Logo"
              />
            )}
          </View>
          <Text style={styles.trackingNumber}>
            {data.trackingNumber}
          </Text>
        </View>

        {/* FROM Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From</Text>
          <View style={[styles.sectionContent, styles.addressContainer]}>
            <Text style={styles.primaryText}>{data.sender.name}</Text>
            {data.sender.company && (
              <Text style={styles.secondaryText}>{data.sender.company}</Text>
            )}
            <Text style={styles.secondaryText}>{data.sender.address}</Text>
            <Text style={styles.secondaryText}>
              {data.sender.city}, {data.sender.state} {data.sender.postalCode}
            </Text>
            {data.sender.phone && (
              <View style={styles.contactInfo}>
                <Text style={styles.secondaryText}>Phone: {data.sender.phone}</Text>
              </View>
            )}
            {data.sender.email && (
              <Text style={styles.secondaryText}>Email: {data.sender.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* TO Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To</Text>
          <View style={[styles.sectionContent, styles.addressContainer]}>
            <Text style={styles.primaryText}>{data.recipient.name}</Text>
            {data.recipient.company && (
              <Text style={styles.secondaryText}>{data.recipient.company}</Text>
            )}
            <Text style={styles.secondaryText}>{data.recipient.address}</Text>
            <Text style={styles.secondaryText}>
              {data.recipient.city}, {data.recipient.state} {data.recipient.postalCode}
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.secondaryText}>Phone: {data.recipient.phone}</Text>
              <Text style={styles.secondaryText}>Email: {data.recipient.email}</Text>
            </View>
          </View>
        </View>

        {/* Service Type */}
        <View style={styles.serviceContainer}>
          <View style={styles.serviceBox}>
            <Text style={styles.serviceType}>{data.service.type}</Text>
            <Text style={styles.serviceDescription}>{data.service.description}</Text>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{data.package.weight}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dimensions:</Text>
            <Text style={styles.detailValue}>{data.package.dimensions}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Package:</Text>
            <Text style={styles.detailValue}>{data.package.type}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ship by: {data.shipDate} • Non-hazardous • No signature required
          </Text>
          <Text style={styles.footerText}>
            Generated by Parcego Courier Platform
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PolishedShippingLabel;
