import Papa from 'papaparse';

// Types for analytics data
export interface AnalyticsData {
  revenueData: Array<{
    date: string;
    fullDate: Date;
    revenue: number;
    target: number;
    growth: number;
  }>;
  shipmentData: Array<{
    date: string;
    fullDate: Date;
    totalShipments: number;
    delivered: number;
    pending: number;
    failed: number;
  }>;
  geographicData: Array<{
    region: string;
    shipments: number;
    revenue: number;
    growth: number;
  }>;
  courierData: Array<{
    name: string;
    deliveries: number;
    rating: number;
    earnings: number;
    status: string;
  }>;
  platformStats: {
    totalMerchants: number;
    activeCouriers: number;
    totalShipments: number;
    monthlyRevenue: number;
    systemHealth: number;
    pendingApprovals: number;
  };
  kpis: {
    totalRevenue: number;
    totalShipments: number;
    avgDeliveryRate: number;
    activeCouriers: number;
    revenueTrend: number;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
  timeframe: string;
}

/**
 * Formats currency values for CSV export
 */
export const formatCurrencyForCSV = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats numbers for CSV export
 */
export const formatNumberForCSV = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Formats percentage values for CSV export
 */
export const formatPercentageForCSV = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Downloads CSV file with proper headers and formatting
 */
export const downloadCSV = (data: any[], filename: string, headers?: string[]) => {
  const csv = Papa.unparse(data, {
    header: true,
    delimiter: ',',
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    newline: '\n'
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Exports comprehensive analytics data to CSV
 */
export const exportAnalyticsToCSV = (data: AnalyticsData) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `parcego-analytics-${timestamp}.csv`;
  
  // Prepare summary data
  const summaryData = [
    {
      'Metric': 'Total Revenue',
      'Value': formatCurrencyForCSV(data.kpis.totalRevenue),
      'Period': data.timeframe,
      'Date Range': `${formatDateForCSV(data.dateRange.from)} - ${formatDateForCSV(data.dateRange.to)}`
    },
    {
      'Metric': 'Total Shipments',
      'Value': formatNumberForCSV(data.kpis.totalShipments),
      'Period': data.timeframe,
      'Date Range': `${formatDateForCSV(data.dateRange.from)} - ${formatDateForCSV(data.dateRange.to)}`
    },
    {
      'Metric': 'Average Delivery Rate',
      'Value': formatPercentageForCSV(data.kpis.avgDeliveryRate),
      'Period': data.timeframe,
      'Date Range': `${formatDateForCSV(data.dateRange.from)} - ${formatDateForCSV(data.dateRange.to)}`
    },
    {
      'Metric': 'Active Couriers',
      'Value': formatNumberForCSV(data.kpis.activeCouriers),
      'Period': data.timeframe,
      'Date Range': `${formatDateForCSV(data.dateRange.from)} - ${formatDateForCSV(data.dateRange.to)}`
    },
    {
      'Metric': 'Revenue Trend',
      'Value': formatPercentageForCSV(data.kpis.revenueTrend),
      'Period': data.timeframe,
      'Date Range': `${formatDateForCSV(data.dateRange.from)} - ${formatDateForCSV(data.dateRange.to)}`
    }
  ];

  // Prepare revenue data
  const revenueCSVData = data.revenueData.map(item => ({
    'Date': item.date,
    'Revenue': formatCurrencyForCSV(item.revenue),
    'Target': formatCurrencyForCSV(item.target),
    'Growth': formatPercentageForCSV(item.growth * 100)
  }));

  // Prepare shipment data
  const shipmentCSVData = data.shipmentData.map(item => ({
    'Date': item.date,
    'Total Shipments': formatNumberForCSV(item.totalShipments),
    'Delivered': formatNumberForCSV(item.delivered),
    'Pending': formatNumberForCSV(item.pending),
    'Failed': formatNumberForCSV(item.failed),
    'Delivery Rate': formatPercentageForCSV((item.delivered / item.totalShipments) * 100)
  }));

  // Prepare geographic data
  const geographicCSVData = data.geographicData.map(item => ({
    'Region': item.region,
    'Shipments': formatNumberForCSV(item.shipments),
    'Revenue': formatCurrencyForCSV(item.revenue),
    'Growth': formatPercentageForCSV(item.growth)
  }));

  // Prepare courier performance data
  const courierCSVData = data.courierData.map(item => ({
    'Courier Name': item.name,
    'Deliveries': formatNumberForCSV(item.deliveries),
    'Rating': item.rating.toFixed(1),
    'Earnings': formatCurrencyForCSV(item.earnings),
    'Status': item.status.charAt(0).toUpperCase() + item.status.slice(1)
  }));

  // Prepare platform stats
  const platformStatsData = [
    {
      'Metric': 'Total Merchants',
      'Value': formatNumberForCSV(data.platformStats.totalMerchants)
    },
    {
      'Metric': 'Active Couriers',
      'Value': formatNumberForCSV(data.platformStats.activeCouriers)
    },
    {
      'Metric': 'Total Shipments',
      'Value': formatNumberForCSV(data.platformStats.totalShipments)
    },
    {
      'Metric': 'Monthly Revenue',
      'Value': formatCurrencyForCSV(data.platformStats.monthlyRevenue)
    },
    {
      'Metric': 'System Health',
      'Value': formatPercentageForCSV(data.platformStats.systemHealth)
    },
    {
      'Metric': 'Pending Approvals',
      'Value': formatNumberForCSV(data.platformStats.pendingApprovals)
    }
  ];

  // Combine all data into a comprehensive CSV
  const combinedData = [
    // Summary section
    { 'Section': 'ANALYTICS SUMMARY', 'Metric': '', 'Value': '', 'Period': '', 'Date Range': '' },
    ...summaryData.map(item => ({ 'Section': '', ...item })),
    
    // Separator
    { 'Section': '', 'Metric': '', 'Value': '', 'Period': '', 'Date Range': '' },
    
    // Platform stats section
    { 'Section': 'PLATFORM STATISTICS', 'Metric': '', 'Value': '', 'Period': '', 'Date Range': '' },
    ...platformStatsData.map(item => ({ 'Section': '', ...item, 'Period': '', 'Date Range': '' })),
    
    // Separator
    { 'Section': '', 'Metric': '', 'Value': '', 'Period': '', 'Date Range': '' },
    
    // Revenue section
    { 'Section': 'REVENUE TRENDS', 'Date': '', 'Revenue': '', 'Target': '', 'Growth': '' },
    ...revenueCSVData.map(item => ({ 'Section': '', ...item })),
    
    // Separator
    { 'Section': '', 'Date': '', 'Revenue': '', 'Target': '', 'Growth': '' },
    
    // Shipment section
    { 'Section': 'SHIPMENT VOLUMES', 'Date': '', 'Total Shipments': '', 'Delivered': '', 'Pending': '', 'Failed': '', 'Delivery Rate': '' },
    ...shipmentCSVData.map(item => ({ 'Section': '', ...item })),
    
    // Separator
    { 'Section': '', 'Date': '', 'Total Shipments': '', 'Delivered': '', 'Pending': '', 'Failed': '', 'Delivery Rate': '' },
    
    // Geographic section
    { 'Section': 'GEOGRAPHIC DISTRIBUTION', 'Region': '', 'Shipments': '', 'Revenue': '', 'Growth': '' },
    ...geographicCSVData.map(item => ({ 'Section': '', ...item })),
    
    // Separator
    { 'Section': '', 'Region': '', 'Shipments': '', 'Revenue': '', 'Growth': '' },
    
    // Courier performance section
    { 'Section': 'COURIER PERFORMANCE', 'Courier Name': '', 'Deliveries': '', 'Rating': '', 'Earnings': '', 'Status': '' },
    ...courierCSVData.map(item => ({ 'Section': '', ...item }))
  ];

  downloadCSV(combinedData, filename);
};

/**
 * Exports individual data sections to separate CSV files
 */
export const exportDataSectionToCSV = (
  data: any[], 
  sectionName: string, 
  filename?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `parcego-${sectionName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.csv`;
  
  downloadCSV(data, filename || defaultFilename);
};

/**
 * Formats date for CSV export in UTC
 */
export const formatDateForCSV = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

/**
 * Formats timestamp for CSV export in UTC
 */
export const formatTimestampForCSV = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
};
