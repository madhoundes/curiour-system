# Analytics Export Functionality

This document describes the CSV and PDF export functionality implemented for the Parcego Analytics Dashboard.

## Overview

The export functionality allows administrators to download comprehensive analytics reports in two formats:
- **CSV Export**: Well-formatted Excel/CSV files with organized tables and summary metrics
- **PDF Export**: Professionally styled PDF reports with logo, charts, and clean layouts

## Features

### CSV Export
- **Comprehensive Data**: Includes all analytics data in organized sections
- **Clear Headers**: Well-structured headers for easy analysis
- **Formatted Values**: Currency, percentages, and numbers properly formatted
- **Multiple Sections**: Summary, platform stats, revenue trends, shipment volumes, geographic distribution, and courier performance
- **Timestamp**: Automatic filename with current date

### PDF Export
- **Professional Styling**: Clean, modern design with proper typography
- **Logo Integration**: Parcego logo prominently displayed
- **Organized Layout**: Clear sections with proper spacing and hierarchy
- **Data Tables**: Well-formatted tables for all metrics
- **Chart Placeholders**: Visual indicators for chart data
- **Print-Ready**: Optimized for both screen viewing and printing

## Implementation Details

### Dependencies
- `@react-pdf/renderer`: For PDF generation
- `papaparse`: For CSV parsing and generation

### File Structure
```
lib/
├── export-utils.ts          # CSV export utilities and data formatting
└── pdf-export.ts            # PDF export utilities and validation

components/pdf/
└── AnalyticsReportPDF.tsx   # PDF document component with styling

app/admin/
└── page.tsx                 # Updated with export functionality
```

### Key Functions

#### CSV Export
```typescript
// Export comprehensive analytics data to CSV
exportAnalyticsToCSV(data: AnalyticsData): void

// Download CSV file with proper headers
downloadCSV(data: any[], filename: string, headers?: string[]): void

// Format currency values for CSV
formatCurrencyForCSV(value: number): string

// Format numbers for CSV
formatNumberForCSV(value: number): string
```

#### PDF Export
```typescript
// Export analytics data to PDF
exportAnalyticsToPDF(data: AnalyticsData): Promise<ExportResult>

// Generate PDF blob without downloading
generatePDFBlob(data: AnalyticsData): Promise<Blob>

// Validate analytics data before export
validateAnalyticsData(data: AnalyticsData): ValidationResult
```

## Usage

### In the Admin Dashboard

1. Navigate to the Analytics section in the admin dashboard
2. Select your desired date range and filters
3. Click the "CSV" button to download a CSV report
4. Click the "PDF" button to generate and download a PDF report
5. The buttons show loading states during export

### Programmatic Usage

```typescript
import { exportAnalyticsToCSV, AnalyticsData } from '@/lib/export-utils';
import { exportAnalyticsToPDF } from '@/lib/pdf-export';

// Prepare your analytics data
const analyticsData: AnalyticsData = {
  // ... your data
};

// Export to CSV
exportAnalyticsToCSV(analyticsData);

// Export to PDF
const result = await exportAnalyticsToPDF(analyticsData);
if (result.success) {
  console.log('PDF exported successfully:', result.filename);
} else {
  console.error('Export failed:', result.message);
}
```

## Data Structure

The `AnalyticsData` interface includes:

```typescript
interface AnalyticsData {
  revenueData: RevenueDataPoint[];
  shipmentData: ShipmentDataPoint[];
  geographicData: GeographicDataPoint[];
  courierData: CourierDataPoint[];
  platformStats: PlatformStatistics;
  kpis: KeyPerformanceIndicators;
  dateRange: DateRange;
  timeframe: string;
}
```

## File Naming

- **CSV Files**: `parcego-analytics-YYYY-MM-DD.csv`
- **PDF Files**: `parcego-analytics-report-YYYY-MM-DD.pdf`

## Error Handling

The export functionality includes comprehensive error handling:

- **Validation**: Data is validated before export
- **Fallbacks**: Missing data fields have default values
- **User Feedback**: Loading states and error messages
- **Console Logging**: Detailed error information for debugging

## Testing

### Manual Testing
1. Visit `/export-test` to test the export functionality with mock data
2. Check browser console for status messages
3. Verify files are downloaded to the default downloads folder

### Test Data
The test page includes comprehensive mock data covering all analytics sections.

## Browser Compatibility

- **CSV Export**: Works in all modern browsers
- **PDF Export**: Requires browsers with Blob and URL.createObjectURL support
- **File Downloads**: Uses standard HTML5 download attribute

## Performance Considerations

- **Large Datasets**: CSV export handles large datasets efficiently
- **PDF Generation**: PDF generation may take a few seconds for complex reports
- **Memory Usage**: Large exports are processed in chunks to prevent memory issues

## Future Enhancements

Potential improvements for future versions:

1. **Image Export**: Export charts as high-quality images
2. **Scheduled Exports**: Automated daily/weekly report generation
3. **Email Integration**: Send reports via email
4. **Custom Templates**: User-customizable report templates
5. **Batch Exports**: Export multiple date ranges simultaneously
6. **API Integration**: Server-side export for large datasets

## Troubleshooting

### Common Issues

1. **Export Button Not Working**
   - Check browser console for JavaScript errors
   - Ensure all dependencies are installed
   - Verify data structure matches AnalyticsData interface

2. **PDF Generation Fails**
   - Check browser compatibility
   - Verify font loading (Inter font)
   - Check for missing data fields

3. **CSV Format Issues**
   - Ensure data contains valid values
   - Check for special characters in data
   - Verify Papa Parse library is loaded

### Debug Mode

Enable debug logging by setting `console.log` statements in the export functions to see detailed processing information.

## Security Considerations

- **Data Privacy**: Export functions only process data passed to them
- **No Server Storage**: Files are generated client-side and downloaded directly
- **Input Validation**: All data is validated before processing
- **XSS Prevention**: Data is properly escaped in CSV and PDF outputs

## Support

For issues or questions regarding the export functionality:

1. Check the browser console for error messages
2. Verify the data structure matches the expected format
3. Test with the provided mock data at `/export-test`
4. Review this documentation for implementation details
