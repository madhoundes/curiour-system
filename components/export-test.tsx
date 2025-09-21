"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { exportAnalyticsToCSV, AnalyticsData } from '@/lib/export-utils';
import { exportAnalyticsToPDF } from '@/lib/pdf-export';

// Mock data for testing
const mockAnalyticsData: AnalyticsData = {
  revenueData: [
    {
      date: 'Jan 01',
      fullDate: new Date('2025-01-01'),
      revenue: 15000,
      target: 20000,
      growth: 0.05
    },
    {
      date: 'Jan 02',
      fullDate: new Date('2025-01-02'),
      revenue: 18000,
      target: 20000,
      growth: 0.08
    }
  ],
  shipmentData: [
    {
      date: 'Jan 01',
      fullDate: new Date('2025-01-01'),
      totalShipments: 150,
      delivered: 135,
      pending: 12,
      failed: 3
    },
    {
      date: 'Jan 02',
      fullDate: new Date('2025-01-02'),
      totalShipments: 180,
      delivered: 162,
      pending: 15,
      failed: 3
    }
  ],
  geographicData: [
    {
      region: 'New York',
      shipments: 2450,
      revenue: 48750,
      growth: 12.5
    },
    {
      region: 'California',
      shipments: 1890,
      revenue: 35680,
      growth: 8.3
    }
  ],
  courierData: [
    {
      name: 'David Rodriguez',
      deliveries: 245,
      rating: 4.8,
      earnings: 1840,
      status: 'active'
    },
    {
      name: 'Lisa Thompson',
      deliveries: 198,
      rating: 4.9,
      earnings: 1560,
      status: 'active'
    }
  ],
  platformStats: {
    totalMerchants: 1248,
    activeCouriers: 342,
    totalShipments: 25678,
    monthlyRevenue: 145890,
    systemHealth: 99.2,
    pendingApprovals: 23
  },
  kpis: {
    totalRevenue: 150000,
    totalShipments: 1500,
    avgDeliveryRate: 95.5,
    activeCouriers: 342,
    revenueTrend: 8.5
  },
  dateRange: {
    from: new Date('2025-01-01'),
    to: new Date('2025-01-31')
  },
  timeframe: '30d'
};

export default function ExportTest() {
  const handleCSVExport = () => {
    try {
      exportAnalyticsToCSV(mockAnalyticsData);
      console.log('CSV export initiated successfully');
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  };

  const handlePDFExport = async () => {
    try {
      const result = await exportAnalyticsToPDF(mockAnalyticsData);
      if (result.success) {
        console.log('PDF export successful:', result.filename);
      } else {
        console.error('PDF export failed:', result.message);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Export Functionality Test</h2>
      <div className="flex gap-4">
        <Button onClick={handleCSVExport} id="test-csv-export">
          Test CSV Export
        </Button>
        <Button onClick={handlePDFExport} id="test-pdf-export">
          Test PDF Export
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        Check the browser console for export status messages and check your downloads folder for the generated files.
      </div>
    </div>
  );
}
