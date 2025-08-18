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

    // Load and add company logo with exact pixel dimensions to prevent distortion
    const logoData = await loadLogoForPDF();
    // Convert 157px × 33px to inches for 4x6 label (72 DPI)
    const logoWidthInches = 157 / 72;  // 2.18 inches
    const logoHeightInches = 33 / 72;  // 0.46 inches
    addLogoToPDF(pdf, margin, margin, logoWidthInches, logoHeightInches, logoData);

    // Service type badge
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Service: ${shipment.service}`, margin, margin + 0.6);

    // FROM section
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('FROM:', margin, margin + 0.7);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ashraf Courier', margin, margin + 0.9);
    pdf.text('123 Business Ave', margin, margin + 1.1);
    pdf.text('Toronto, ON M5V 2H1', margin, margin + 1.3);
    pdf.text('Canada', margin, margin + 1.5);

    // TO section
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('TO:', margin, margin + 2.0);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(shipment.recipient.name, margin, margin + 2.2);
    pdf.text(shipment.recipient.address1, margin, margin + 2.4);
    if (shipment.recipient.address2) {
      pdf.text(shipment.recipient.address2, margin, margin + 2.6);
    }
    pdf.text(`${shipment.recipient.city}, ${shipment.recipient.province || ''} ${shipment.recipient.postalCode}`, margin, margin + 2.8);
    pdf.text(shipment.recipient.country, margin, margin + 3.0);

    // Tracking information
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Tracking:', margin, margin + 3.4);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(shipment.trackingNumber, margin, margin + 3.6);

    // Package details
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Package:', margin, margin + 3.9);
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Weight: ${shipment.weightKg.toFixed(2)} kg`, margin, margin + 4.1);
    pdf.text(`Cost: $${shipment.cost.toFixed(2)}`, margin, margin + 4.3);

    // Barcode area (simplified representation)
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.01);
    const barcodeStartX = margin;
    const barcodeY = margin + 4.6;
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
    pdf.text('Scan for tracking', margin, margin + 5.1);

    // Footer
    pdf.setFontSize(6);
    pdf.setTextColor(100, 100, 100);
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
          
          // Load and add company logo for each page
          const logoData = await loadLogoForPDF();
          addLogoToPDF(combinedPdf, 0.1, 0.1, 1.8, 0.5, logoData); // Optimized dimensions for 4x6 label

          // Service type badge
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.setTextColor(100, 100, 100);
          combinedPdf.text(`Service: ${shipment.service}`, 0.1, 0.6);

          // FROM section
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('FROM:', 0.1, 0.8);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text('Ashraf Courier', 0.1, 1.0);
          combinedPdf.text('123 Business Ave', 0.1, 1.2);
          combinedPdf.text('Toronto, ON M5V 2H1', 0.1, 1.4);
          combinedPdf.text('Canada', 0.1, 1.6);

          // TO section
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('TO:', 0.1, 2.1);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text(shipment.recipient.name, 0.1, 2.3);
          combinedPdf.text(shipment.recipient.address1, 0.1, 2.5);
          if (shipment.recipient.address2) {
            combinedPdf.text(shipment.recipient.address2, 0.1, 2.7);
          }
          combinedPdf.text(`${shipment.recipient.city}, ${shipment.recipient.province || ''} ${shipment.recipient.postalCode}`, 0.1, 2.9);
          combinedPdf.text(shipment.recipient.country, 0.1, 3.1);

          // Tracking information
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('Tracking:', 0.1, 3.5);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text(shipment.trackingNumber, 0.1, 3.7);

          // Package details
          combinedPdf.setFontSize(8);
          combinedPdf.setFont('helvetica', 'bold');
          combinedPdf.setTextColor(0, 0, 0);
          combinedPdf.text('Package:', 0.1, 4.0);
          
          combinedPdf.setFontSize(7);
          combinedPdf.setFont('helvetica', 'normal');
          combinedPdf.text(`Weight: ${shipment.weightKg.toFixed(2)} kg`, 0.1, 4.2);
          combinedPdf.text(`Cost: $${shipment.cost.toFixed(2)}`, 0.1, 4.4);

          // Barcode area
          combinedPdf.setDrawColor(0, 0, 0);
          combinedPdf.setLineWidth(0.01);
          const barcodeStartX = 0.1;
          const barcodeY = 4.7;
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

          // Page indicator for multiple labels
          if (selectedShipments.length > 1) {
            combinedPdf.setFontSize(6);
            combinedPdf.setTextColor(100, 100, 100);
            combinedPdf.text(`Page ${index + 1} of ${selectedShipments.length}`, 3.0, 5.8);
          }

          // Footer
          combinedPdf.setFontSize(6);
          combinedPdf.setTextColor(100, 100, 100);
          combinedPdf.text('Generated by Parcego Courier Platform', 0.1, 5.9);
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

  // Print the generated PDF
  const handlePrint = () => {
    if (generatedPdfUrl) {
      const printWindow = window.open(generatedPdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintLabelsModal;
