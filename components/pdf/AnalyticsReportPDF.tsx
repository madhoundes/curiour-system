"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { AnalyticsData } from '@/lib/export-utils';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
});

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1f2937'
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb'
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginLeft: 12
  },
  
  reportInfo: {
    alignItems: 'flex-end'
  },
  
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  
  reportDate: {
    fontSize: 10,
    color: '#6b7280'
  },
  
  // Section styles
  section: {
    marginBottom: 25
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  
  // KPI Cards
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  
  kpiCard: {
    width: '48%',
    marginRight: '4%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5'
  },
  
  kpiTitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
    fontWeight: 'medium'
  },
  
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3
  },
  
  kpiSubtitle: {
    fontSize: 8,
    color: '#6b7280'
  },
  
  // Table styles
  table: {
    marginBottom: 20
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db'
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151'
  },
  
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  
  // Chart placeholder
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  
  chartText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  
  footerText: {
    fontSize: 8,
    color: '#6b7280'
  },
  
  // Utility classes
  textCenter: {
    textAlign: 'center'
  },
  
  textRight: {
    textAlign: 'right'
  },
  
  bold: {
    fontWeight: 'bold'
  },
  
  colorGreen: {
    color: '#059669'
  },
  
  colorRed: {
    color: '#dc2626'
  },
  
  colorBlue: {
    color: '#2563eb'
  }
});

interface AnalyticsReportPDFProps {
  data: AnalyticsData;
}

const AnalyticsReportPDF: React.FC<AnalyticsReportPDFProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Parcego</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Analytics Dashboard Report</Text>
            <Text style={styles.reportDate}>
              {formatDate(data.dateRange.from)} - {formatDate(data.dateRange.to)}
            </Text>
          </View>
        </View>

        {/* KPI Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Total Revenue</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.kpis.totalRevenue)}</Text>
              <Text style={styles.kpiSubtitle}>
                Trend: {data.kpis.revenueTrend >= 0 ? '+' : ''}{formatPercentage(data.kpis.revenueTrend)}
              </Text>
            </View>
            
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Total Shipments</Text>
              <Text style={styles.kpiValue}>{formatNumber(data.kpis.totalShipments)}</Text>
              <Text style={styles.kpiSubtitle}>Period: {data.timeframe}</Text>
            </View>
            
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Delivery Rate</Text>
              <Text style={styles.kpiValue}>{formatPercentage(data.kpis.avgDeliveryRate)}</Text>
              <Text style={styles.kpiSubtitle}>Target: 95%</Text>
            </View>
            
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Active Couriers</Text>
              <Text style={styles.kpiValue}>{formatNumber(data.kpis.activeCouriers)}</Text>
              <Text style={styles.kpiSubtitle}>
                Utilization: {Math.round((data.kpis.activeCouriers / 10) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Platform Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Metric</Text>
              <Text style={styles.tableHeaderCell}>Value</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Merchants</Text>
              <Text style={styles.tableCell}>{formatNumber(data.platformStats.totalMerchants)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Active Couriers</Text>
              <Text style={styles.tableCell}>{formatNumber(data.platformStats.activeCouriers)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Shipments</Text>
              <Text style={styles.tableCell}>{formatNumber(data.platformStats.totalShipments)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Monthly Revenue</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.platformStats.monthlyRevenue)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>System Health</Text>
              <Text style={styles.tableCell}>{formatPercentage(data.platformStats.systemHealth)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Pending Approvals</Text>
              <Text style={styles.tableCell}>{formatNumber(data.platformStats.pendingApprovals)}</Text>
            </View>
          </View>
        </View>

        {/* Revenue Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Revenue Chart - {data.revenueData.length} data points</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Revenue</Text>
              <Text style={styles.tableHeaderCell}>Target</Text>
              <Text style={styles.tableHeaderCell}>Growth</Text>
            </View>
            {data.revenueData.slice(-10).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.date}</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.revenue)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.target)}</Text>
                <Text style={[styles.tableCell, item.growth >= 0 ? styles.colorGreen : styles.colorRed]}>
                  {item.growth >= 0 ? '+' : ''}{formatPercentage(item.growth * 100)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shipment Volumes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Volumes</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Shipment Volume Chart - {data.shipmentData.length} data points</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Total</Text>
              <Text style={styles.tableHeaderCell}>Delivered</Text>
              <Text style={styles.tableHeaderCell}>Pending</Text>
              <Text style={styles.tableHeaderCell}>Failed</Text>
              <Text style={styles.tableHeaderCell}>Rate</Text>
            </View>
            {data.shipmentData.slice(-10).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.date}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.totalShipments)}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.delivered)}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.pending)}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.failed)}</Text>
                <Text style={[styles.tableCell, styles.colorGreen]}>
                  {formatPercentage((item.delivered / item.totalShipments) * 100)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Geographic Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geographic Distribution</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Region</Text>
              <Text style={styles.tableHeaderCell}>Shipments</Text>
              <Text style={styles.tableHeaderCell}>Revenue</Text>
              <Text style={styles.tableHeaderCell}>Growth</Text>
            </View>
            {data.geographicData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.region}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.shipments)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.revenue)}</Text>
                <Text style={[styles.tableCell, item.growth >= 0 ? styles.colorGreen : styles.colorRed]}>
                  {item.growth >= 0 ? '+' : ''}{formatPercentage(item.growth)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Courier Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Courier Performance</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Courier</Text>
              <Text style={styles.tableHeaderCell}>Deliveries</Text>
              <Text style={styles.tableHeaderCell}>Rating</Text>
              <Text style={styles.tableHeaderCell}>Earnings</Text>
              <Text style={styles.tableHeaderCell}>Status</Text>
            </View>
            {data.courierData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>{formatNumber(item.deliveries)}</Text>
                <Text style={styles.tableCell}>{item.rating.toFixed(1)} ⭐</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.earnings)}</Text>
                <Text style={[styles.tableCell, item.status === 'active' ? styles.colorGreen : styles.colorBlue]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <Text style={styles.footerText}>Parcego Analytics Dashboard</Text>
        </View>
      </Page>
    </Document>
  );
};

export default AnalyticsReportPDF;
