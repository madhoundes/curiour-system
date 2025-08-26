"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { jsPDF } from "jspdf";
import type { Shipment } from "@/lib/mock/shipments";
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils";

interface PrintLabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShipmentIds: string[];
  shipments: Shipment[];
}

const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  open,
  onOpenChange,
  selectedShipmentIds,
  shipments,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  // Filter shipments based on selected IDs
  const selectedShipments = useMemo(() => {
    return shipments.filter(shipment => selectedShipmentIds.includes(shipment.id));
  }, [shipments, selectedShipmentIds]);

  // Generate barcode pattern from tracking number
  const generateBarcodePattern = (trackingNumber: string): number[] => {
    const seed = Array.from(trackingNumber).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return Array.from({ length: 64 }).map((_, i) => {
      const n = (seed * (i + 17)) % 5;
      return [1, 1, 2, 2, 3][n];
    });
  };

  // Generate PDF for a single shipment
  const generateShipmentLabel = async (shipment: Shipment): Promise<jsPDF> => {
    const pdf = new jsPDF('p', 'in', [4, 6]); // 4x6 inch label
    const pageWidth = 4;
    const pageHeight = 6;
    const margin = 0.1;

    // Set background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Load and add company logo with optimized dimensions for better balance
    const logoData = await loadLogoForPDF();
    // Further reduced logo size for optimal visual balance on 4x6 label
    const logoWidthInches = 1.4;  // Reduced from 1.6 inches
    const logoHeightInches = 0.3; // Reduced from 0.35 inches
    addLogoToPDF(pdf, margin, margin, logoWidthInches, logoHeightInches, logoData);

    // Service type badge
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Service: ${shipment.service}`, margin, margin + 0.5);

    // FROM section
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('FROM:', margin, margin + 0.6);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ashraf Courier', margin, margin + 0.8);
    pdf.text('123 Business Ave', margin, margin + 1.0);
    pdf.text('Toronto, ON M5V 2H1', margin, margin + 1.2);
    pdf.text('Canada', margin, margin + 1.4);

    // TO section
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('TO:', margin, margin + 1.9);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(shipment.recipient.name, margin, margin + 2.1);
    pdf.text(shipment.recipient.address1, margin, margin + 2.3);
    if (shipment.recipient.address2) {
      pdf.text(shipment.recipient.address2, margin, margin + 2.5);
    }
    pdf.text(`${shipment.recipient.city}, ${shipment.recipient.province || ''} ${shipment.recipient.postalCode}`, margin, margin + 2.7);
    pdf.text(shipment.recipient.country, margin, margin + 2.9);

    // Tracking information - significantly reduced prominence
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('Tracking:', margin, margin + 3.3);
    
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(shipment.trackingNumber, margin, margin + 3.5);

    // Package details
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Package:', margin, margin + 3.8);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Weight: ${shipment.weightKg.toFixed(2)} kg`, margin, margin + 4.0);
    pdf.text(`Cost: $${shipment.cost.toFixed(2)}`, margin, margin + 4.2);

    // Barcode area (simplified representation)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.01);
    const barcodeStartX = margin;
    const barcodeY = margin + 4.5;
    const barcodeHeight = 0.3;
    
    // Draw simple barcode pattern
    const barPattern = generateBarcodePattern(shipment.trackingNumber);
    let currentX = barcodeStartX;
    barPattern.forEach((width) => {
      if (currentX < pageWidth - margin) {
        pdf.line(currentX, barcodeY, currentX, barcodeY + barcodeHeight);
        currentX += width * 0.01; // Scale down the bars
      }
    });

    // QR Code area (simplified)
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Scan for tracking', margin, margin + 5.0);

    // Shipping terms - significantly reduced emphasis with smaller font
    pdf.setFontSize(4);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Ship by: 8/20/2025 • Non-hazardous • No signature required', margin, pageHeight - margin - 0.3);

    // Footer - reduced emphasis
    pdf.setFontSize(4);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Generated by Parcego Courier Platform', margin, pageHeight - margin - 0.1);

    return pdf;
  };

  // Generate combined PDF for all selected shipments
  const generateLabelsPDF = async () => {
    if (selectedShipments.length === 0) return;

    setIsGenerating(true);
    
    try {
      let combinedPdf: jsPDF;
      
      if (selectedShipments.length === 1) {
        // Single label
        combinedPdf = await generateShipmentLabel(selectedShipments[0]);
      } else {
        // Multiple labels - create new PDF with multiple pages
        combinedPdf = new jsPDF('p', 'in', [4, 6]);
        
        for (let index = 0; index < selectedShipments.length; index++) {
          const shipment = selectedShipments[index];
          
          if (index > 0) {
            combinedPdf.addPage([4, 6]);
          }
          
          // Generate individual label content for this page
          combinedPdf.setPage(index + 1);
          
          // Load and add company logo for each page with better balance
          const logoData = await loadLogoForPDF();
          addLogoToPDF(combinedPdf, 0.1, 0.1, 1.4, 0.3, logoData); // Reduced size for better balance

          // Service type badge
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.setTextColor(100, 100, 100);
          combinedPdf.text(`Service: ${shipment.service}`, 0.1, 0.5);

          // FROM section
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('FROM:', 0.1, 0.7);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text('Ashraf Courier', 0.1, 0.9);
          combinedPdf.text('123 Business Ave', 0.1, 1.1);
          combinedPdf.text('Toronto, ON M5V 2H1', 0.1, 1.3);
          combinedPdf.text('Canada', 0.1, 1.5);

          // TO section
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('TO:', 0.1, 2.0);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text(shipment.recipient.name, 0.1, 2.2);
          combinedPdf.text(shipment.recipient.address1, 0.1, 2.4);
          if (shipment.recipient.address2) {
            combinedPdf.text(shipment.recipient.address2, 0.1, 2.6);
          }
          combinedPdf.text(`${shipment.recipient.city}, ${shipment.recipient.province || ''} ${shipment.recipient.postalCode}`, 0.1, 2.8);
          combinedPdf.text(shipment.recipient.country, 0.1, 3.0);

          // Tracking information - significantly reduced prominence
          combinedPdf.setFontSize(6);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.setTextColor(80, 80, 80);
          combinedPdf.text('Tracking:', 0.1, 3.4);
          
          combinedPdf.setFontSize(5);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.setTextColor(100, 100, 100);
          combinedPdf.text(shipment.trackingNumber, 0.1, 3.6);

          // Package details
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('Package:', 0.1, 3.9);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text(`Weight: ${shipment.weightKg.toFixed(2)} kg`, 0.1, 4.1);
          combinedPdf.text(`Cost: $${shipment.cost.toFixed(2)}`, 0.1, 4.3);

          // Barcode area
          combinedPdf.setDrawColor(0, 0, 0);
          combinedPdf.setLineWidth(0.01);
          const barcodeStartX = 0.1;
          const barcodeY = 4.6;
          const barcodeHeight = 0.3;
          
          // Draw simple barcode pattern
          const barPattern = generateBarcodePattern(shipment.trackingNumber);
          let currentX = barcodeStartX;
          barPattern.forEach((width) => {
            if (currentX < 3.9) {
              combinedPdf.line(currentX, barcodeY, currentX, barcodeY + barcodeHeight);
              currentX += width * 0.01;
            }
          });

          // Shipping terms - significantly reduced emphasis with smaller font
          combinedPdf.setFontSize(4);
          combinedPdf.setTextColor(120, 120, 120);
          combinedPdf.text('Ship by: 8/20/2025 • Non-hazardous • No signature required', 0.1, 5.6);

          // Page indicator for multiple labels
          if (selectedShipments.length > 1) {
            combinedPdf.setFontSize(5);
            combinedPdf.setTextColor(120, 120, 120);
            combinedPdf.text(`Page ${index + 1} of ${selectedShipments.length}`, 3.0, 5.7);
          }

          // Footer - reduced emphasis
          combinedPdf.setFontSize(4);
          combinedPdf.setTextColor(120, 120, 120);
          combinedPdf.text('Generated by Parcego Courier Platform', 0.1, 5.8);
        }
      }

      // Generate PDF blob and URL
      const pdfBlob = combinedPdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(pdfUrl);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating labels. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced print function with better PDF handling
  const handlePrint = () => {
    if (generatedPdfUrl) {
      try {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (printWindow) {
          // Create print-optimized HTML content
          const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Parcego Shipping Labels - Print</title>
              <meta charset="utf-8">
              <style>
                @media print {
                  @page {
                    size: 4in 6in;
                    margin: 0.1in;
                  }
                  
                  body {
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  
                  .label-container {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  
                  .print-instructions {
                    display: none;
                  }
                  
                  .label-preview {
                    width: 100% !important;
                    height: auto !important;
                    border: none !important;
                  }
                }
                
                @media screen {
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 20px;
                    background: #f5f5f5;
                  }
                  
                  .label-container {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  
                  .print-instructions {
                    background: #e3f2fd;
                    border: 1px solid #2196f3;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                  }
                  
                  .print-button {
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    margin: 10px 5px;
                  }
                  
                  .print-button:hover {
                    background: #1976d2;
                  }
                }
                
                .label-preview {
                  width: 100%;
                  height: 600px;
                  border: none;
                }
                
                h1 {
                  color: #1976d2;
                  margin-bottom: 20px;
                }
                
                .instructions {
                  color: #666;
                  line-height: 1.6;
                }
                
                .print-status {
                  background: #e8f5e8;
                  border: 1px solid #4caf50;
                  border-radius: 6px;
                  padding: 12px;
                  margin: 10px 0;
                  color: #2e7d32;
                }
              </style>
            </head>
            <body>
              <h1>🚚 Parcego Shipping Labels</h1>
              
              <div class="print-instructions">
                <h3>📋 Print Instructions:</h3>
                <ul class="instructions">
                  <li><strong>Paper Size:</strong> 4×6 inches (4in × 6in)</li>
                  <li><strong>Orientation:</strong> Portrait</li>
                  <li><strong>Margins:</strong> 0.1 inches (minimum)</li>
                  <li><strong>Scale:</strong> 100% (no scaling)</li>
                  <li><strong>Paper Type:</strong> Label paper recommended</li>
                </ul>
                <button class="print-button" onclick="printLabels()">🖨️ Print Labels</button>
                <button class="print-button" onclick="window.close()">❌ Close Window</button>
              </div>
              
              <div class="label-container">
                <iframe 
                  src="${generatedPdfUrl}" 
                  class="label-preview"
                  title="Shipping Labels Preview"
                  onload="handleIframeLoad()"
                ></iframe>
              </div>
              
              <div id="print-status" class="print-status" style="display: none;">
                ✅ Labels loaded successfully. Ready for printing.
              </div>
              
              <script>
                let iframeLoaded = false;
                
                function handleIframeLoad() {
                  iframeLoaded = true;
                  const status = document.getElementById('print-status');
                  if (status) {
                    status.style.display = 'block';
                  }
                }
                
                function printLabels() {
                  if (!iframeLoaded) {
                    alert('Please wait for labels to load completely before printing.');
                    return;
                  }
                  
                  try {
                    // Hide print instructions before printing
                    const instructions = document.querySelector('.print-instructions');
                    if (instructions) instructions.style.display = 'none';
                    
                    // Print the window
                    window.print();
                    
                    // Show instructions again after printing
                    setTimeout(() => {
                      if (instructions) instructions.style.display = 'block';
                    }, 1000);
                  } catch (error) {
                    console.error('Print error:', error);
                    alert('Print failed. Please try again or download the PDF.');
                  }
                }
                
                // Auto-focus the print button
                window.onload = function() {
                  const printBtn = document.querySelector('.print-button');
                  if (printBtn) printBtn.focus();
                };
                
                // Handle print completion
                window.onafterprint = function() {
                  console.log('Print completed');
                  const status = document.getElementById('print-status');
                  if (status) {
                    status.textContent = '✅ Print completed successfully!';
                    status.style.background = '#e8f5e8';
                    status.style.borderColor = '#4caf50';
                    status.style.color = '#2e7d32';
                  }
                };
                
                // Handle print errors
                window.onerror = function(msg, url, line) {
                  console.error('Error:', msg, url, line);
                  const status = document.getElementById('print-status');
                  if (status) {
                    status.textContent = '❌ Error loading labels. Please refresh and try again.';
                    status.style.background = '#ffebee';
                    status.style.borderColor = '#f44336';
                    status.style.color = '#c62828';
                    status.style.display = 'block';
                  }
                };
              </script>
            </body>
            </html>
          `;
          
          // Write content to the new window
          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // Focus the new window
          printWindow.focus();
          
        } else {
          // Fallback: try to print directly
          console.warn('Popup blocked, attempting direct print...');
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = generatedPdfUrl;
          document.body.appendChild(iframe);
          
          iframe.onload = () => {
            try {
              iframe.contentWindow?.print();
              // Remove iframe after printing
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            } catch (error) {
              console.error('Direct print failed:', error);
              alert('Print failed. Please try downloading the PDF and printing from your PDF viewer.');
            }
          };
        }
      } catch (error) {
        console.error('Print error:', error);
        alert('Print failed. Please try downloading the PDF and printing from your PDF viewer.');
      }
    }
  };

  // Download the generated PDF
  const handleDownload = () => {
    if (generatedPdfUrl) {
      const link = document.createElement('a');
      link.href = generatedPdfUrl;
      link.download = `parcego-labels-${selectedShipments.length > 1 ? 'batch' : selectedShipments[0].trackingNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Clean up URL when modal closes
  useEffect(() => {
    if (!open && generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
    }
  }, [open, generatedPdfUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Printer" size={20} />
            Print Labels ({selectedShipments.length} selected)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Shipments Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Selected Shipments</h3>
            <div className="grid gap-3 max-h-40 overflow-y-auto">
              {selectedShipments.map((shipment) => (
                <Card key={shipment.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{shipment.trackingNumber}</div>
                        <div className="text-xs text-gray-600">
                          To: {shipment.recipient.name} • {shipment.recipient.city}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {shipment.service}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {shipment.weightKg.toFixed(2)} kg
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={generateLabelsPDF}
              disabled={isGenerating || selectedShipments.length === 0}
              className="flex-1"
            >
              <Icon name="FileText" size={16} className="mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Labels'}
            </Button>
          </div>

          {/* Generated PDF Preview */}
          {generatedPdfUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Labels Generated Successfully!</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedShipments.length} label{selectedShipments.length > 1 ? 's' : ''} ready for printing
                </p>
                
                <div className="flex items-center gap-3">
                  <Button onClick={handlePrint} variant="default">
                    <Icon name="Printer" size={16} className="mr-2" />
                    Print Now
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={generatedPdfUrl}
                  className="w-full h-96"
                  title="Generated Labels Preview"
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Printing Instructions:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Ensure your printer supports 4x6 inch labels</li>
              <li>Use high-quality label paper for best results</li>
              <li>Test print on regular paper first</li>
              <li>Labels are optimized for thermal printers</li>
            </ul>
          </div>

          {/* Print Settings Guide */}
          <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">🎯 Optimal Print Settings:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-green-800">
              <div>
                <strong>Page Setup:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Paper Size: 4×6 inches</li>
                  <li>Orientation: Portrait</li>
                  <li>Margins: 0.1 inches</li>
                  <li>Scale: 100% (no scaling)</li>
                </ul>
              </div>
              <div>
                <strong>Print Quality:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Resolution: 300 DPI or higher</li>
                  <li>Color: Black & White or Color</li>
                  <li>Paper Type: Label paper</li>
                  <li>Print Mode: Normal</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded text-green-900 text-xs">
              <strong>💡 Tip:</strong> The print preview will open in a new window with these settings automatically configured.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintLabelsModal;
