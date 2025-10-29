
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { AnalyticsData } from './export-utils';

/**
 * Format date in UTC for display
 */
const formatUTCDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

/**
 * Downloads a PDF file with proper filename and MIME type
 * Improved version to prevent page reloads and UI flicker
 */
export const downloadPDF = (pdfBlob: Blob, filename: string) => {
  try {
    // Validate blob
    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Invalid PDF blob provided');
    }
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    link.setAttribute('data-testid', 'pdf-download-link');
    
    // Add to DOM, trigger download, and remove immediately
    document.body.appendChild(link);
    
    // Use a small delay to ensure the download starts
    setTimeout(() => {
      try {
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      } catch (cleanupError) {
        console.warn('Error during PDF download cleanup:', cleanupError);
        // Still try to clean up the URL
        try {
          URL.revokeObjectURL(url);
        } catch (revokeError) {
          console.warn('Error revoking URL:', revokeError);
        }
      }
    }, 10);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF file');
  }
};

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  kpiItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    minWidth: 120,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
  },
});

/**
 * Creates a PDF document component for analytics data
 */
const createAnalyticsPDF = (data: AnalyticsData) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Parcego Analytics Report</Text>
        
        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Report Period: {formatUTCDate(data.dateRange.from)} - {formatUTCDate(data.dateRange.to)}
          </Text>
        </View>

        {/* KPIs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>${data.kpis.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.kpis.totalShipments.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Total Shipments</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.kpis.avgDeliveryRate.toFixed(1)}%</Text>
              <Text style={styles.kpiLabel}>Avg Delivery Rate</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.kpis.activeCouriers}</Text>
              <Text style={styles.kpiLabel}>Active Couriers</Text>
            </View>
          </View>
        </View>

        {/* Platform Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Statistics</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.platformStats.totalMerchants}</Text>
              <Text style={styles.kpiLabel}>Total Merchants</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.platformStats.activeCouriers}</Text>
              <Text style={styles.kpiLabel}>Active Couriers</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{data.platformStats.totalShipments.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Total Shipments</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>${data.platformStats.monthlyRevenue.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            </View>
          </View>
        </View>

        {/* Revenue Data Table */}
        {data.revenueData && data.revenueData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Data (Last 7 Days)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Date</Text>
                <Text style={styles.tableCell}>Revenue</Text>
                <Text style={styles.tableCell}>Growth</Text>
              </View>
              {data.revenueData.slice(-7).map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.date}</Text>
                  <Text style={styles.tableCell}>${item.revenue.toLocaleString()}</Text>
                  <Text style={styles.tableCell}>{(item.growth * 100).toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Geographic Data */}
        {/* Top Regions section hidden from PDF export as per requirements */}
      </Page>
    </Document>
  );
};

/**
 * Exports analytics data to a professionally formatted PDF report
 * Improved version to prevent page reloads and UI flicker
 */
export const exportAnalyticsToPDF = async (data: AnalyticsData) => {
  try {
    // Generate timestamp for filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `parcego-analytics-report-${timestamp}.pdf`;
    
    // Validate data before processing
    const validation = validateAnalyticsData(data);
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Prepare data for PDF generation
    const preparedData = prepareDataForPDF(data);
    
    // Create the PDF document
    const pdfDocument = createAnalyticsPDF(preparedData);
    
    // Generate PDF blob asynchronously to prevent blocking
    const pdfBlob = await generatePDFBlob(preparedData);
    
    // Download the PDF without blocking the UI
    await new Promise<void>((resolve) => {
      try {
        downloadPDF(pdfBlob, filename);
        // Small delay to ensure download starts before resolving
        setTimeout(resolve, 50);
      } catch (error) {
        console.error('Download error:', error);
        resolve(); // Resolve anyway to prevent hanging
      }
    });
    
    return {
      success: true,
      filename,
      message: 'PDF report generated successfully'
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      filename: null,
      message: `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Generates a PDF blob without downloading (useful for preview or server upload)
 * Improved version with better error handling
 */
export const generatePDFBlob = async (data: AnalyticsData): Promise<Blob> => {
  try {
    // Validate data first
    const validation = validateAnalyticsData(data);
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Prepare data
    const preparedData = prepareDataForPDF(data);
    const pdfDocument = createAnalyticsPDF(preparedData);
    
    // Generate PDF blob with timeout to prevent hanging
    return await Promise.race([
      pdf(pdfDocument).toBlob(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
      )
    ]);
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};

/**
 * Generates PDF in chunks to prevent UI blocking
 * This is a more advanced approach for large datasets
 */
export const generatePDFInChunks = async (data: AnalyticsData): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleWork = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 5000 });
      } else {
        setTimeout(callback, 0);
      }
    };

    scheduleWork(async () => {
      try {
        const blob = await generatePDFBlob(data);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Exports a simplified PDF with just key metrics
 * Improved version to prevent page reloads and UI flicker
 */
export const exportQuickSummaryPDF = async (data: AnalyticsData) => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `parcego-quick-summary-${timestamp}.pdf`;
    
    // Create a simplified version of the data
    const simplifiedData: AnalyticsData = {
      ...data,
      revenueData: data.revenueData.slice(-7), // Last 7 days only
      shipmentData: data.shipmentData.slice(-7), // Last 7 days only
      geographicData: data.geographicData.slice(0, 5), // Top 5 regions only
      courierData: data.courierData.slice(0, 5) // Top 5 couriers only
    };
    
    // Validate simplified data
    const validation = validateAnalyticsData(simplifiedData);
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Prepare data for PDF generation
    const preparedData = prepareDataForPDF(simplifiedData);
    
    const pdfDocument = createAnalyticsPDF(preparedData);
    
    // Generate PDF blob asynchronously
    const pdfBlob = await generatePDFBlob(preparedData);
    
    // Download the PDF without blocking the UI
    await new Promise<void>((resolve) => {
      try {
        downloadPDF(pdfBlob, filename);
        setTimeout(resolve, 50);
      } catch (error) {
        console.error('Download error:', error);
        resolve();
      }
    });
    
    return {
      success: true,
      filename,
      message: 'Quick summary PDF generated successfully'
    };
  } catch (error) {
    console.error('Error generating quick summary PDF:', error);
    return {
      success: false,
      filename: null,
      message: `Failed to generate quick summary PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Validates analytics data before PDF export
 */
export const validateAnalyticsData = (data: AnalyticsData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.kpis) {
    errors.push('KPI data is missing');
  }
  
  if (!data.revenueData || data.revenueData.length === 0) {
    errors.push('Revenue data is missing or empty');
  }
  
  if (!data.shipmentData || data.shipmentData.length === 0) {
    errors.push('Shipment data is missing or empty');
  }
  
  if (!data.platformStats) {
    errors.push('Platform statistics are missing');
  }
  
  if (!data.dateRange || !data.dateRange.from || !data.dateRange.to) {
    errors.push('Date range is missing or invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats data for PDF export with proper error handling
 */
export const prepareDataForPDF = (rawData: any): AnalyticsData => {
  // Ensure all required fields exist with fallback values
  const data: AnalyticsData = {
    kpis: {
      totalRevenue: rawData.kpis?.totalRevenue || 0,
      totalShipments: rawData.kpis?.totalShipments || 0,
      avgDeliveryRate: rawData.kpis?.avgDeliveryRate || 0,
      activeCouriers: rawData.kpis?.activeCouriers || 0,
      revenueTrend: rawData.kpis?.revenueTrend || 0
    },
    platformStats: {
      totalMerchants: rawData.platformStats?.totalMerchants || 0,
      activeCouriers: rawData.platformStats?.activeCouriers || 0,
      totalShipments: rawData.platformStats?.totalShipments || 0,
      monthlyRevenue: rawData.platformStats?.monthlyRevenue || 0,
      systemHealth: rawData.platformStats?.systemHealth || 0,
      pendingApprovals: rawData.platformStats?.pendingApprovals || 0
    },
    revenueData: rawData.revenueData || [],
    shipmentData: rawData.shipmentData || [],
    geographicData: rawData.geographicData || [],
    courierData: rawData.courierData || [],
    dateRange: {
      from: rawData.dateRange?.from || new Date(),
      to: rawData.dateRange?.to || new Date()
    },
    timeframe: rawData.timeframe || '30d'
  };
  
  return data;
};
