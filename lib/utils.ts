import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Loads the Parcego logo for PDF generation
 * @returns Base64 encoded PNG logo data
 */
export const loadLogoForPDF = async (): Promise<string> => {
  try {
    // Create SVG content
    const logoSvg = `<svg width="240" height="80" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="80" rx="12" fill="#0091F5"/>
      <circle cx="40" cy="40" r="18" fill="white"/>
      <circle cx="70" cy="40" r="14" fill="rgba(255,255,255,0.8)"/>
      <text x="100" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">Parcego</text>
    </svg>`;
    
    // Convert SVG to PNG using canvas
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 80;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(''); // Return empty string if canvas not available
            return;
          }
          
          ctx.drawImage(img, 0, 0, 240, 80);
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
        } catch (error) {
          console.error('Error converting SVG to PNG:', error);
          resolve(''); // Return empty string on error
        }
      };
      
      img.onerror = () => {
        console.error('Error loading SVG image');
        resolve(''); // Return empty string on error
      };
      
      // Convert SVG to data URL
      const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
      
      // Clean up object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  } catch (error) {
    console.error('Failed to load logo:', error);
    return '';
  }
};

/**
 * Adds logo to PDF at specified position
 */
export const addLogoToPDF = (
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number,
  logoData: string
) => {
  try {
    if (logoData && logoData.startsWith('data:image/png')) {
      pdf.addImage(logoData, 'PNG', x, y, width, height);
    }
  } catch (error) {
    console.error('Failed to add logo to PDF:', error);
    // Continue without logo if it fails
  }
};

/**
 * Downloads a file using browser's native download capabilities
 * @param content - File content as string, Blob, or ArrayBuffer
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file (default: 'text/plain')
 * @deprecated This function is deprecated and should not be used in production
 */
export const downloadFile = (
  content: string | Blob | ArrayBuffer,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  console.warn('downloadFile is deprecated and should not be used');
  alert('File download is not available. Please use the proper API endpoints.');
};

/**
 * Generates a mock invoice content for demonstration purposes
 * @param shipmentData - Shipment information
 * @returns Formatted invoice content as string
 * @deprecated This function is deprecated and should not be used in production
 */
export const generateMockInvoice = (shipmentData: {
  trackingNumber: string;
  recipient: { name: string; address1: string; city: string; province: string; postalCode: string; country: string };
  service: string;
  courier: string;
  weightKg: number;
  cost: number;
  createdAt: string;
}): string => {
  console.warn('generateMockInvoice is deprecated and should not be used');
  return 'Mock invoice generation is no longer supported. Please use the real API endpoints.';
};

interface jsPDFWithAutoTable {
  autoTable: (options: any) => void;
  lastAutoTable?: {
    finalY: number;
  };
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => void;
  setFontSize: (size: number) => void;
  setTextColor: (...args: number[]) => void;
  setFont: (fontName: string, fontStyle: string) => void;
  text: (text: string | string[], x: number, y: number) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  save: (filename: string) => void;
  internal: {
    pageSize: {
      height: number;
      width: number;
    };
  };
}

/**
 * Tests if jsPDF autoTable plugin is available
 */
export const testPdfAutoTable = async (): Promise<boolean> => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const testPdf = new jsPDF() as unknown as jsPDFWithAutoTable;
    
    if (typeof testPdf.autoTable === 'function') {
      console.log('jsPDF autoTable plugin is available');
      return true;
    } else {
      console.warn('jsPDF autoTable plugin is not available');
      return false;
    }
  } catch (error) {
    console.error('Error testing jsPDF autoTable:', error);
    return false;
  }
};

/**
 * Loads SVG as Canvas Data URL for PDF generation
 */
export const loadSvgAsCanvasDataUrl = async (svgPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element
      const img = new Image();
      
      img.onload = () => {
        try {
          // Create a canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas size to match image
          canvas.width = img.naturalWidth || img.width || 200;
          canvas.height = img.naturalHeight || img.height || 200;
          
          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (error) {
          console.error('Error converting SVG to canvas:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading SVG image:', error);
        reject(new Error('Failed to load SVG image'));
      };
      
      // Handle SVG content
      if (svgPath.startsWith('<svg')) {
        // It's SVG content, convert to data URL
        const svgBlob = new Blob([svgPath], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
        
        // Clean up the object URL after loading
        img.onload = () => {
          URL.revokeObjectURL(url);
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            canvas.width = img.naturalWidth || img.width || 200;
            canvas.height = img.naturalHeight || img.height || 200;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (error) {
            console.error('Error converting SVG to canvas:', error);
            reject(error);
          }
        };
      } else {
        // It's a path, load directly
        img.src = svgPath;
      }
    } catch (error) {
      console.error('Error in loadSvgAsCanvasDataUrl:', error);
      reject(error);
    }
  });
};

/**
 * Generates a PDF invoice using jsPDF
 */
export const generatePdfInvoice = async (invoiceData: {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billTo: {
    name: string;
    company?: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  lineItems: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status?: string;
  notes?: string;
  shipmentDetails?: {
    trackingNumber?: string;
    service?: string;
    weight?: string;
    deliveryDate?: string;
  };
}): Promise<void> => {
  try {
    // Import jsPDF and autoTable - they must be imported together
    const { jsPDF } = await import('jspdf');
    
    // Import autoTable which extends jsPDF prototype
    const autoTableModule = await import('jspdf-autotable');
    
    // Create PDF instance after autoTable import
    const pdf = new jsPDF();
    
    // TypeScript type assertion for autoTable method
    const pdfWithAutoTable = pdf as unknown as jsPDFWithAutoTable;
    
    // Check if autoTable is available
    if (typeof pdfWithAutoTable.autoTable !== 'function') {
      // Try using the default export as a function
      const autoTableFn = (autoTableModule as any).default || autoTableModule;
      if (typeof autoTableFn === 'function') {
        // Use autotable as a standalone function: autoTable(pdf, options)
        pdfWithAutoTable.autoTable = (options: any) => autoTableFn(pdf, options);
      } else {
        console.error('Cannot initialize autoTable plugin');
        console.log('autoTable module:', autoTableModule);
        throw new Error('PDF table generation plugin not loaded correctly');
      }
    }
    
    // Load and add logo
    try {
      const logoData = await loadLogoForPDF();
      if (logoData) {
        addLogoToPDF(pdfWithAutoTable, 20, 20, 40, 13, logoData);
      }
    } catch (logoError) {
      console.warn('Could not load logo, continuing without it:', logoError);
    }
    
    // Add company info
    pdfWithAutoTable.setFontSize(20);
    pdfWithAutoTable.setTextColor(0, 145, 245);
    pdfWithAutoTable.text('Parcego', 70, 30);
    
    pdfWithAutoTable.setFontSize(10);
    pdfWithAutoTable.setTextColor(100, 100, 100);
    pdfWithAutoTable.text('Professional Shipping Solutions', 70, 37);
    
    // Invoice title and number
    pdfWithAutoTable.setFontSize(24);
    pdfWithAutoTable.setTextColor(0, 0, 0);
    pdfWithAutoTable.text('INVOICE', 20, 60);
    
    pdfWithAutoTable.setFontSize(12);
    pdfWithAutoTable.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 70);
    pdfWithAutoTable.text(`Issue Date: ${invoiceData.issueDate}`, 20, 78);
    pdfWithAutoTable.text(`Due Date: ${invoiceData.dueDate}`, 20, 86);
    
    if (invoiceData.status) {
      pdfWithAutoTable.text(`Status: ${invoiceData.status}`, 20, 94);
    }
    
    // Bill To section
    pdfWithAutoTable.setFontSize(14);
    pdfWithAutoTable.text('Bill To:', 20, 110);
    
    pdfWithAutoTable.setFontSize(11);
    let yPos = 120;
    pdfWithAutoTable.text(invoiceData.billTo.name, 20, yPos);
    yPos += 7;
    
    if (invoiceData.billTo.company) {
      pdfWithAutoTable.text(invoiceData.billTo.company, 20, yPos);
      yPos += 7;
    }
    
    pdfWithAutoTable.text(invoiceData.billTo.address, 20, yPos);
    yPos += 7;
    pdfWithAutoTable.text(`${invoiceData.billTo.city}, ${invoiceData.billTo.province} ${invoiceData.billTo.postalCode}`, 20, yPos);
    yPos += 7;
    pdfWithAutoTable.text(invoiceData.billTo.country, 20, yPos);
    
    // Shipment details if provided
    if (invoiceData.shipmentDetails) {
      pdfWithAutoTable.setFontSize(14);
      pdfWithAutoTable.text('Shipment Details:', 120, 110);
      
      pdfWithAutoTable.setFontSize(11);
      let shipYPos = 120;
      
      if (invoiceData.shipmentDetails.trackingNumber) {
        pdfWithAutoTable.text(`Tracking: ${invoiceData.shipmentDetails.trackingNumber}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.service) {
        pdfWithAutoTable.text(`Service: ${invoiceData.shipmentDetails.service}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.weight) {
        pdfWithAutoTable.text(`Weight: ${invoiceData.shipmentDetails.weight}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.deliveryDate) {
        pdfWithAutoTable.text(`Delivery: ${invoiceData.shipmentDetails.deliveryDate}`, 120, shipYPos);
      }
    }
    
    // Line items table
    const tableData = invoiceData.lineItems.map(item => [
      item.description,
      item.quantity?.toString() || '1',
      item.unitPrice ? `${invoiceData.currency}${item.unitPrice.toFixed(2)}` : '-',
      `${invoiceData.currency}${item.amount.toFixed(2)}`
    ]);
    
    pdfWithAutoTable.autoTable({
      startY: yPos + 20,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 145, 245],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });
    
    // Totals
    const finalY = pdfWithAutoTable.lastAutoTable?.finalY || yPos + 80;
    const totalsX = 130;
    let totalsY = finalY + 20;
    
    pdfWithAutoTable.setFontSize(11);
    pdfWithAutoTable.text(`Subtotal: ${invoiceData.currency}${invoiceData.subtotal.toFixed(2)}`, totalsX, totalsY);
    totalsY += 8;
    pdfWithAutoTable.text(`Tax: ${invoiceData.currency}${invoiceData.tax.toFixed(2)}`, totalsX, totalsY);
    totalsY += 8;
    
    // Total with emphasis
    pdfWithAutoTable.setFontSize(12);
    pdfWithAutoTable.setFont('helvetica', 'bold');
    pdfWithAutoTable.text(`Total: ${invoiceData.currency}${invoiceData.total.toFixed(2)}`, totalsX, totalsY);
    
    // Notes
    if (invoiceData.notes) {
      pdfWithAutoTable.setFont('helvetica', 'normal');
      pdfWithAutoTable.setFontSize(10);
      pdfWithAutoTable.text('Notes:', 20, totalsY + 20);
      
      // Split notes into multiple lines if needed
      const splitNotes = pdfWithAutoTable.splitTextToSize(invoiceData.notes, 170);
      pdfWithAutoTable.text(splitNotes, 20, totalsY + 28);
    }
    
    // Footer
    const pageHeight = pdfWithAutoTable.internal.pageSize.height;
    pdfWithAutoTable.setFontSize(8);
    pdfWithAutoTable.setTextColor(100, 100, 100);
    pdfWithAutoTable.text('Thank you for your business!', 20, pageHeight - 20);
    const date = new Date();
    const formattedDate = `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}/${date.getUTCFullYear()}`;
    pdfWithAutoTable.text(`Generated on ${formattedDate}`, 20, pageHeight - 12);
    
    // Save the PDF
    const filename = `${invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdfWithAutoTable.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    throw new Error('Failed to generate PDF invoice. Please try again.');
  }
};
