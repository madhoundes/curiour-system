import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { jsPDF } from "jspdf"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Loads the PNG logo and converts it to a format suitable for PDF rendering
 * @returns Promise<string> - Base64 encoded PNG data or fallback text
 */
export const loadLogoForPDF = async (): Promise<string> => {
  try {
    // Try to load the PNG file from the public directory
    const response = await fetch('/Logo/Horizontal-logo.png');
    if (!response.ok) {
      throw new Error('Failed to load logo');
    }
    
    // Convert PNG to base64 for PDF compatibility
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('Could not load logo, falling back to text:', error);
    // Fallback to text representation
    return 'PARCEGO';
  }
};

/**
 * Adds the company logo to a PDF document with exact dimensions to prevent distortion
 * @param pdf - jsPDF instance
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Logo width (in document units)
 * @param height - Logo height (in document units)
 * @param logoData - Logo data (PNG base64 or text)
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
    if (logoData.startsWith('data:image/png')) {
      // Add PNG logo with exact dimensions to maintain aspect ratio and prevent distortion
      // PNG format is well-supported in jsPDF and preserves image quality
      pdf.addImage(logoData, 'PNG', x, y, width, height);
    } else {
      // Fallback to text representation
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 145, 245); // Blue color
      pdf.text(logoData, x + width/2, y + height/2, { align: 'center' });
    }
  } catch (error) {
    console.warn('Could not add logo to PDF, using text fallback:', error);
    // Fallback to text
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 145, 245); // Blue color
    pdf.text('PARCEGO', x + width/2, y + height/2, { align: 'center' });
  }
};

/**
 * Downloads a file using browser's native download capabilities
 * @param content - File content as string, Blob, or ArrayBuffer
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file (default: 'text/plain')
 */
export const downloadFile = (
  content: string | Blob | ArrayBuffer,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  try {
    let blob: Blob;
    
    if (typeof content === 'string') {
      blob = new Blob([content], { type: mimeType });
    } else if (content instanceof ArrayBuffer) {
      blob = new Blob([content], { type: mimeType });
    } else {
      blob = content;
    }
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    // Fallback: try to open in new tab
    try {
      const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      alert('Download failed. Please try again.');
    }
  }
};

/**
 * Generates a mock invoice content for demonstration purposes
 * @param shipmentData - Shipment information
 * @returns Formatted invoice content as string
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
  const invoiceNumber = `INV-${shipmentData.trackingNumber.replace('-', '')}`;
  const issueDate = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  const baseCost = Math.max(0, shipmentData.cost - 4.5);
  const taxAmount = 4.5;
  
  return `INVOICE

Invoice Number: ${invoiceNumber}
Issue Date: ${issueDate}
Due Date: ${dueDate}

BILL TO:
${shipmentData.recipient.name}
${shipmentData.recipient.address1}
${shipmentData.recipient.city}, ${shipmentData.recipient.province} ${shipmentData.recipient.postalCode}
${shipmentData.recipient.country}

SHIPMENT DETAILS:
Tracking Number: ${shipmentData.trackingNumber}
Service: ${shipmentData.service}
Courier: ${shipmentData.courier}
Weight: ${shipmentData.weightKg.toFixed(2)} kg
Shipment Date: ${new Date(shipmentData.createdAt).toLocaleDateString()}

CHARGES:
Base Shipping Cost: $${baseCost.toFixed(2)}
Taxes & Fees: $${taxAmount.toFixed(2)}
Total Amount: $${shipmentData.cost.toFixed(2)}

TERMS:
Payment is due within 30 days of invoice date.
Late payments may incur additional charges.

Thank you for choosing Parcego!
For questions, contact support@parcego.com`;
};

/**
 * Converts SVG to canvas data URL for PDF embedding
 * @param svgPath - Path to the SVG file
 * @returns Promise<string> - Canvas data URL or fallback text
 */
export const loadSvgAsCanvasDataUrl = async (svgPath: string): Promise<string> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Not in browser environment, returning fallback text');
    return 'PARCEGO';
  }
  
  try {
    console.log('Loading SVG from path:', svgPath);
    
    const response = await fetch(svgPath);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
    }
    
    const svgText = await response.text();
    console.log('SVG loaded successfully, length:', svgText.length);
    
    // Method 1: Try using canvg library for better SVG support
    try {
      console.log('Attempting to use canvg library...');
      const { Canvg } = await import('canvg');
      const canvas = document.createElement('canvas');
      canvas.width = 200; // Logo width
      canvas.height = 40; // Logo height
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use canvg to render SVG
        const v = Canvg.fromString(ctx, svgText);
        await v.render();
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        console.log('SVG converted successfully using canvg');
        return dataUrl;
      }
    } catch (canvgError) {
      console.warn('Canvg method failed, trying fallback:', canvgError);
    }
    
    // Method 2: Fallback to native canvas method
    console.log('Attempting native canvas method...');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = 200; // Logo width
    canvas.height = 40; // Logo height
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Draw SVG to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png');
          
          // Clean up
          URL.revokeObjectURL(url);
          console.log('SVG converted successfully using native canvas');
          resolve(dataUrl);
        } catch (drawError) {
          URL.revokeObjectURL(url);
          reject(new Error(`Failed to draw SVG to canvas: ${drawError}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };
      
      img.src = url;
    });
    
  } catch (error) {
    console.warn('Could not load SVG, creating text-based logo canvas:', error);
    
    // Create a text-based logo as canvas
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 200;
        canvas.height = 40;
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text logo
        ctx.fillStyle = '#0091f5'; // Parcego blue
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PARCEGO', canvas.width / 2, canvas.height / 2);
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Text-based logo canvas created successfully');
        return dataUrl;
      }
    } catch (canvasError) {
      console.warn('Failed to create text logo canvas:', canvasError);
    }
    
    return 'PARCEGO'; // Final fallback text
  }
};

/**
 * Generates a professional PDF invoice with organized layout and logo
 * @param invoiceData - Invoice information including shipment details, line items, etc.
 * @returns Promise<void> - Downloads the PDF file
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
    console.log('Starting PDF invoice generation...');
    
    // Dynamic imports to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    console.log('jsPDF and autotable imported successfully');

    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    console.log('PDF document created successfully');
    
    // Load logo
    let logoData: string;
    try {
      logoData = await loadSvgAsCanvasDataUrl('/Logo/Horizontal-logo.svg');
    } catch {
      logoData = 'PARCEGO'; // Fallback
    }

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Add logo and company header
    let yPosition = margin;
    
    try {
      if (logoData.startsWith('data:image/')) {
        // Add image logo (PNG converted from SVG or text-based canvas)
        const imageFormat = logoData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(logoData, imageFormat, margin, yPosition, 40, 8);
        console.log('Logo added to PDF successfully');
      } else {
        // Fallback text logo
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 145, 245);
        doc.text(logoData, margin, yPosition + 6);
        console.log('Text logo added to PDF as fallback');
      }
    } catch (logoError) {
      console.warn('Failed to add logo to PDF, using text fallback:', logoError);
      // Fallback text logo
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 145, 245);
      doc.text('PARCEGO', margin, yPosition + 6);
    }

    // Company information (right side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const companyInfo = [
      'Parcego Courier Services',
      'professional@parcego.com',
      '1-800-PARCEGO',
      'www.parcego.com'
    ];
    
    const companyYPos = yPosition;
    companyInfo.forEach((line, index) => {
      doc.text(line, pageWidth - margin - 50, companyYPos + (index * 4) + 6);
    });

    yPosition += 25;

    // Invoice title and details
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', margin, yPosition);

    // Invoice details (right side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const invoiceDetails = [
      `Invoice #: ${invoiceData.invoiceNumber}`,
      `Issue Date: ${invoiceData.issueDate}`,
      `Due Date: ${invoiceData.dueDate}`,
      ...(invoiceData.status ? [`Status: ${invoiceData.status.toUpperCase()}`] : [])
    ];

    const detailsYPos = yPosition - 15;
    invoiceDetails.forEach((line, index) => {
      doc.text(line, pageWidth - margin - 50, detailsYPos + (index * 5) + 5);
    });

    yPosition += 15;

    // Bill To section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BILL TO:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const billToLines = [
      invoiceData.billTo.name,
      ...(invoiceData.billTo.company ? [invoiceData.billTo.company] : []),
      invoiceData.billTo.address,
      `${invoiceData.billTo.city}, ${invoiceData.billTo.province} ${invoiceData.billTo.postalCode}`,
      invoiceData.billTo.country
    ];

    billToLines.forEach((line, index) => {
      doc.text(line, margin, yPosition + (index * 5));
    });

    yPosition += (billToLines.length * 5) + 10;

    // Shipment details (if provided)
    if (invoiceData.shipmentDetails) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SHIPMENT DETAILS:', margin, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const shipmentLines = [
        ...(invoiceData.shipmentDetails.trackingNumber ? [`Tracking #: ${invoiceData.shipmentDetails.trackingNumber}`] : []),
        ...(invoiceData.shipmentDetails.service ? [`Service: ${invoiceData.shipmentDetails.service}`] : []),
        ...(invoiceData.shipmentDetails.weight ? [`Weight: ${invoiceData.shipmentDetails.weight}`] : []),
        ...(invoiceData.shipmentDetails.deliveryDate ? [`Delivery Date: ${invoiceData.shipmentDetails.deliveryDate}`] : [])
      ];

      shipmentLines.forEach((line, index) => {
        doc.text(line, margin, yPosition + (index * 5));
      });

      yPosition += (shipmentLines.length * 5) + 15;
    } else {
      yPosition += 10;
    }

    // Line items table using autoTable
    const tableData = invoiceData.lineItems.map(item => [
      item.description,
      item.quantity?.toString() || '1',
      item.unitPrice ? `${invoiceData.currency} ${item.unitPrice.toFixed(2)}` : '-',
      `${invoiceData.currency} ${item.amount.toFixed(2)}`
    ]);

    (doc as Record<string, unknown>).autoTable({
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: [60, 60, 60],
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    // Get final Y position from table
    yPosition = (doc as Record<string, unknown>).lastAutoTable.finalY + 15;

    // Summary section
    const summaryX = pageWidth - margin - 60;
    const summaryLines = [
      ['Subtotal:', `${invoiceData.currency} ${invoiceData.subtotal.toFixed(2)}`],
      ['Tax:', `${invoiceData.currency} ${invoiceData.tax.toFixed(2)}`],
      ['Total:', `${invoiceData.currency} ${invoiceData.total.toFixed(2)}`]
    ];

    summaryLines.forEach((line, index) => {
      const isTotal = index === summaryLines.length - 1;
      
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      doc.setFontSize(isTotal ? 12 : 10);
      doc.setTextColor(0, 0, 0);
      
      // Draw line above total
      if (isTotal) {
        doc.line(summaryX, yPosition + (index * 7) - 2, summaryX + 55, yPosition + (index * 7) - 2);
      }
      
      doc.text(line[0], summaryX, yPosition + (index * 7) + 2);
      doc.text(line[1], summaryX + 55, yPosition + (index * 7) + 2, { align: 'right' });
    });

    yPosition += (summaryLines.length * 7) + 20;

    // Notes section
    if (invoiceData.notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('NOTES:', margin, yPosition);

      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      const noteLines = doc.splitTextToSize(invoiceData.notes, pageWidth - (margin * 2));
      noteLines.forEach((line: string, index: number) => {
        doc.text(line, margin, yPosition + (index * 5));
      });

      yPosition += (noteLines.length * 5) + 15;
    }

    // Footer
    const footerY = pageHeight - 30;
    
    // Terms section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TERMS & CONDITIONS', margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const terms = [
      'Payment is due within 30 days of invoice date.',
      'Late payments may incur additional charges.',
      'For questions, contact support@parcego.com'
    ];

    terms.forEach((term, index) => {
      doc.text(term, margin, footerY + 5 + (index * 4));
    });

    // Page footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Parcego Courier Services`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save the PDF
    const filename = `invoice-${invoiceData.invoiceNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error('Failed to generate PDF invoice:', error);
    // Fallback to text download
    const invoiceContent = generateMockInvoice({
      trackingNumber: invoiceData.shipmentDetails?.trackingNumber || invoiceData.invoiceNumber,
      recipient: {
        name: invoiceData.billTo.name,
        address1: invoiceData.billTo.address,
        city: invoiceData.billTo.city,
        province: invoiceData.billTo.province,
        postalCode: invoiceData.billTo.postalCode,
        country: invoiceData.billTo.country
      },
      service: invoiceData.shipmentDetails?.service || 'Standard',
      courier: 'Parcego',
      weightKg: parseFloat(invoiceData.shipmentDetails?.weight || '0'),
      cost: invoiceData.total,
      createdAt: invoiceData.issueDate
    });
    
    const filename = `invoice-${invoiceData.invoiceNumber}-${new Date().toISOString().split('T')[0]}.txt`;
    downloadFile(invoiceContent, filename, 'text/plain');
  }
};