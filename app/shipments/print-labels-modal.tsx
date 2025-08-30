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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-semibold">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon name="Printer" size={24} className="text-blue-600" />
            </div>
            <span>Print Labels ({selectedShipments.length} selected)</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selected Shipments Summary - Enhanced Layout */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Shipments</h3>
            <div className="grid gap-3 max-h-48 overflow-y-auto pr-2">
              {selectedShipments.map((shipment, index) => (
                <Card 
                  key={shipment.id} 
                  className="parcego-shipment-card border border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-blue-50 transition-all duration-200 ease-in-out"
                >
                  <CardContent className="py-1 px-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <div className="font-mono font-semibold text-gray-900 text-sm">
                            {shipment.trackingNumber}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 font-medium">
                          To: {shipment.recipient.name} • {shipment.recipient.city}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className="parcego-service-badge bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium px-3 py-1"
                        >
                          {shipment.service}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="parcego-weight-badge bg-green-50 text-green-700 border-green-200 text-xs font-medium px-3 py-1"
                        >
                          {shipment.weightKg.toFixed(2)} kg
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons - Enhanced CTA Consistency */}
          <div className="flex items-center justify-center">
            <Button
              onClick={generateLabelsPDF}
              disabled={isGenerating || selectedShipments.length === 0}
              className="parcego-generate-labels-btn w-full max-w-md h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 ease-in-out focus:ring-4 focus:ring-blue-200"
              id="parcego-generate-labels-btn"
            >
              <Icon name="FileText" size={20} className="mr-3" />
              {isGenerating ? 'Generating Labels...' : 'Generate Labels'}
            </Button>
          </div>

          {/* Generated PDF Preview - Enhanced Success State */}
          {generatedPdfUrl && (
            <div className="space-y-6">
              <Card className="parcego-success-card border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-2">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Icon name="CheckCircle" size={24} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 text-lg mb-1">
                        Labels Generated Successfully!
                      </h4>
                      <p className="text-green-700 mb-4 text-sm">
                        {selectedShipments.length} label{selectedShipments.length > 1 ? 's' : ''} ready for printing
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={handlePrint} 
                          variant="default"
                          className="parcego-print-now-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-all duration-200 ease-in-out focus:ring-4 focus:ring-blue-200"
                          id="parcego-print-now-btn"
                        >
                          <Icon name="Printer" size={18} className="mr-2" />
                          Print Now
                        </Button>
                        <Button 
                          onClick={handleDownload} 
                          variant="outline"
                          className="parcego-download-pdf-btn border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-6 py-3 transition-all duration-200 ease-in-out focus:ring-4 focus:ring-gray-200"
                          id="parcego-download-pdf-btn"
                        >
                          <Icon name="Download" size={18} className="mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Preview - Enhanced Controls */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <span className="font-mono">1 / {selectedShipments.length}</span>
                    <span className="text-gray-300">•</span>
                    <span>Label Preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Icon name="ZoomOut" size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Icon name="ZoomIn" size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Icon name="RotateCw" size={16} />
                    </Button>
                  </div>
                </div>
                <iframe
                  src={generatedPdfUrl}
                  className="w-full h-96 border-0"
                  title="Generated Labels Preview"
                />
              </div>
            </div>
          )}

          {/* Instructions - Enhanced Visual Hierarchy */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Icon name="Info" size={18} className="mr-2 text-blue-600" />
                Printing Instructions
              </h4>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                <li>Ensure your printer supports 4x6 inch labels</li>
                <li>Use high-quality label paper for best results</li>
                <li>Test print on regular paper first</li>
                <li>Labels are optimized for thermal printers</li>
              </ul>
            </div>

            {/* Print Settings Guide - Enhanced Layout */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Icon name="Settings" size={18} className="mr-2 text-green-600" />
                🎯 Optimal Print Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800 text-sm">
                <div>
                  <strong className="text-green-900">Page Setup:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Paper Size: 4×6 inches</li>
                    <li>Orientation: Portrait</li>
                    <li>Margins: 0.1 inches</li>
                    <li>Scale: 100% (no scaling)</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-green-900">Print Quality:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Resolution: 300 DPI or higher</li>
                    <li>Color: Black & White or Color</li>
                    <li>Paper Type: Label paper</li>
                    <li>Print Mode: Normal</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-green-900 text-xs">
                <strong>💡 Tip:</strong> The print preview will open in a new window with these settings automatically configured.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintLabelsModal;
