"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils";

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTestPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create new PDF document with 4x6 inch dimensions (288x432 points)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [288, 432] // 4x6 inches in points
      });
      
      // Set background to white
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 288, 432, 'F');
      
      // Load logo for PDF
      const logoData = await loadLogoForPDF();
      
      // Add company logo at top left
      addLogoToPDF(pdf, 20, 20, 80, 25, logoData);
      
      // Add tracking number at top right
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('ASH-TEST-123456', 200, 35, { align: 'right' });
      
      // Add divider line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(20, 60, 268, 60);
      
      // FROM section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FROM', 20, 85);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('John\'s Electronics Store', 20, 105);
      pdf.text('123 Business St, Suite 100', 20, 120);
      pdf.text('New York, NY 10001', 20, 135);
      
      // Add divider line
      pdf.line(20, 155, 268, 155);
      
      // TO section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TO', 20, 175);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sarah Johnson', 20, 195);
      pdf.text('ABC Corp', 20, 210);
      pdf.text('456 Customer Ave, Apt 2B', 20, 225);
      pdf.text('Toronto, ON M5V3A8', 20, 240);
      pdf.text('(555) 987-6543', 20, 255);
      pdf.text('customer@email.com', 20, 270);
      
      // Service badge
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.rect(20, 290, 60, 25);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STANDARD', 25, 305);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('3-5 business days', 25, 320);
      
      // Package details
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Weight: 2.5 lbs', 20, 350);
      pdf.text('Dimensions: 12&quot; × 8&quot; × 6&quot; in', 20, 365);
      pdf.text('Package Type: box', 20, 380);
      
      // Add footer notes
      pdf.setFontSize(8);
      pdf.text(`Ship by: ${new Date().toLocaleDateString()} • Non-hazardous • No signature required`, 20, 410);
      
      // Save the PDF
      pdf.save('test-shipping-label.pdf');
      
      console.log('PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">PDF Generation Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test PDF Generation</h2>
          
          <p className="text-gray-600 mb-6">
            This page tests the PDF generation functionality for shipping labels. 
            Click the button below to generate a test PDF with a 4x6 inch shipping label.
          </p>
          
          <Button
            onClick={handleTestPDF}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </div>
            ) : (
              <span>Generate Test PDF</span>
            )}
          </Button>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What this test does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates a PDF with 4x6 inch dimensions (288x432 points)</li>
              <li>• Adds company logo and tracking number</li>
              <li>• Includes FROM/TO address sections</li>
              <li>• Shows service type and package details</li>
              <li>• Downloads the PDF as &quot;test-shipping-label.pdf&quot;</li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">Expected result:</h3>
            <p className="text-sm text-amber-800">
              A valid PDF file should download with a properly formatted shipping label. 
              The PDF should open correctly in any PDF viewer and contain all the label information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

