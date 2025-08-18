"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils";

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create new PDF document (4x6 inches = 288x432 points)
      const pdf = new jsPDF('p', 'pt', [288, 432]);
      
      // Set background to white
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 288, 432, 'F');
      
      // Add border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(2);
      pdf.rect(10, 10, 268, 412);
      
          // Load and add company logo with exact pixel dimensions to prevent distortion
    const logoData = await loadLogoForPDF();
    // Convert 157px × 33px to points for PDF (72 DPI)
    const logoWidthPoints = 157;  // 157 points
    const logoHeightPoints = 33;  // 33 points
    addLogoToPDF(pdf, 94, 15, logoWidthPoints, logoHeightPoints, logoData);
      
      // Subtitle
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Test Shipping Label', 144, 50, { align: 'center' });
      
      // Test Tracking Number
      const testTrackingNumber = 'PCG-TEST-123456';
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Tracking:', 20, 80);
      pdf.setFontSize(14);
      pdf.text(testTrackingNumber, 20, 95);
      
      // Test Content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This is a test PDF to verify functionality.', 20, 120);
      pdf.text('FROM: Test Sender', 20, 140);
      pdf.text('TO: Test Recipient', 20, 160);
      pdf.text('Package: Test Package', 20, 180);
      
      // Add Barcode
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 60;
        
        JsBarcode(canvas, testTrackingNumber, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: false,
          background: "#ffffff",
          lineColor: "#000000"
        });
        
        const barcodeImageData = canvas.toDataURL('image/png');
        pdf.addImage(barcodeImageData, 'PNG', 150, 80, 100, 50);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Scan to track', 200, 135, { align: 'center' });
      } catch (error) {
        console.warn('Could not generate barcode:', error);
        pdf.text('Barcode: ' + testTrackingNumber, 150, 110);
      }
      
      // Add QR Code
      try {
        const qrCodeDataURL = await QRCode.toDataURL(testTrackingNumber, {
          width: 60,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        pdf.addImage(qrCodeDataURL, 'PNG', 170, 150, 60, 60);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('QR Code', 200, 215, { align: 'center' });
      } catch (error) {
        console.warn('Could not generate QR code:', error);
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Test PDF generated successfully!', 144, 420, { align: 'center' });
      
      // Save the PDF
      const filename = `test-shipping-label-${Date.now()}.pdf`;
      pdf.save(filename);
      
      console.log('Test PDF generated successfully:', filename);
      
    } catch (error) {
      console.error('Error generating test PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          PDF Generation Test
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Click the button below to test the PDF generation functionality with barcode and QR code.
        </p>
        
        <Button
          onClick={generateTestPDF}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Test PDF...
            </>
          ) : (
            'Generate Test PDF'
          )}
        </Button>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          This will generate a 4x6 inch shipping label PDF with barcode and QR code.
        </div>
      </div>
    </div>
  );
}

