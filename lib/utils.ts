import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { jsPDF } from "jspdf"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Loads the Parcego logo for PDF generation
 * @returns Base64 encoded logo data
 */
export const loadLogoForPDF = async (): Promise<string> => {
  try {
    // Use the SVG logo and convert to base64
    const logoSvg = `<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="8" fill="#0091F5"/>
      <circle cx="20" cy="20" r="12" fill="white"/>
      <circle cx="35" cy="20" r="8" fill="rgba(255,255,255,0.8)"/>
      <text x="50" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">Parcego</text>
    </svg>`;
    
    // Convert SVG to base64
    const base64 = btoa(logoSvg);
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('Failed to load logo:', error);
    return '';
  }
};

/**
 * Adds logo to PDF at specified position
 */
export const addLogoToPDF = (
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  logoData: string
) => {
  try {
    if (logoData) {
      pdf.addImage(logoData, 'SVG', x, y, width, height);
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

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Tests if jsPDF autoTable plugin is available
 */
export const testPdfAutoTable = async (): Promise<boolean> => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const testPdf = new jsPDF() as jsPDFWithAutoTable;
    
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
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const pdf = new jsPDF() as jsPDFWithAutoTable;
    
    // Load and add logo
    try {
      const logoData = await loadLogoForPDF();
      if (logoData) {
        addLogoToPDF(pdf, 20, 20, 40, 13, logoData);
      }
    } catch (logoError) {
      console.warn('Could not load logo, continuing without it:', logoError);
    }
    
    // Add company info
    pdf.setFontSize(20);
    pdf.setTextColor(0, 145, 245);
    pdf.text('Parcego', 70, 30);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Professional Shipping Solutions', 70, 37);
    
    // Invoice title and number
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('INVOICE', 20, 60);
    
    pdf.setFontSize(12);
    pdf.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 70);
    pdf.text(`Issue Date: ${invoiceData.issueDate}`, 20, 78);
    pdf.text(`Due Date: ${invoiceData.dueDate}`, 20, 86);
    
    if (invoiceData.status) {
      pdf.text(`Status: ${invoiceData.status}`, 20, 94);
    }
    
    // Bill To section
    pdf.setFontSize(14);
    pdf.text('Bill To:', 20, 110);
    
    pdf.setFontSize(11);
    let yPos = 120;
    pdf.text(invoiceData.billTo.name, 20, yPos);
    yPos += 7;
    
    if (invoiceData.billTo.company) {
      pdf.text(invoiceData.billTo.company, 20, yPos);
      yPos += 7;
    }
    
    pdf.text(invoiceData.billTo.address, 20, yPos);
    yPos += 7;
    pdf.text(`${invoiceData.billTo.city}, ${invoiceData.billTo.province} ${invoiceData.billTo.postalCode}`, 20, yPos);
    yPos += 7;
    pdf.text(invoiceData.billTo.country, 20, yPos);
    
    // Shipment details if provided
    if (invoiceData.shipmentDetails) {
      pdf.setFontSize(14);
      pdf.text('Shipment Details:', 120, 110);
      
      pdf.setFontSize(11);
      let shipYPos = 120;
      
      if (invoiceData.shipmentDetails.trackingNumber) {
        pdf.text(`Tracking: ${invoiceData.shipmentDetails.trackingNumber}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.service) {
        pdf.text(`Service: ${invoiceData.shipmentDetails.service}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.weight) {
        pdf.text(`Weight: ${invoiceData.shipmentDetails.weight}`, 120, shipYPos);
        shipYPos += 7;
      }
      
      if (invoiceData.shipmentDetails.deliveryDate) {
        pdf.text(`Delivery: ${invoiceData.shipmentDetails.deliveryDate}`, 120, shipYPos);
      }
    }
    
    // Line items table
    const tableData = invoiceData.lineItems.map(item => [
      item.description,
      item.quantity?.toString() || '1',
      item.unitPrice ? `${invoiceData.currency}${item.unitPrice.toFixed(2)}` : '-',
      `${invoiceData.currency}${item.amount.toFixed(2)}`
    ]);
    
    pdf.autoTable({
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
    const finalY = pdf.lastAutoTable?.finalY || yPos + 80;
    const totalsX = 130;
    let totalsY = finalY + 20;
    
    pdf.setFontSize(11);
    pdf.text(`Subtotal: ${invoiceData.currency}${invoiceData.subtotal.toFixed(2)}`, totalsX, totalsY);
    totalsY += 8;
    pdf.text(`Tax: ${invoiceData.currency}${invoiceData.tax.toFixed(2)}`, totalsX, totalsY);
    totalsY += 8;
    
    // Total with emphasis
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total: ${invoiceData.currency}${invoiceData.total.toFixed(2)}`, totalsX, totalsY);
    
    // Notes
    if (invoiceData.notes) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Notes:', 20, totalsY + 20);
      
      // Split notes into multiple lines if needed
      const splitNotes = pdf.splitTextToSize(invoiceData.notes, 170);
      pdf.text(splitNotes, 20, totalsY + 28);
    }
    
    // Footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Thank you for your business!', 20, pageHeight - 20);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 12);
    
    // Save the PDF
    const filename = `${invoiceData.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    throw new Error('Failed to generate PDF invoice. Please try again.');
  }
};
