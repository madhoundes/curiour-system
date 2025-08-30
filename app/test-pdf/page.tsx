"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils";
import { sampleShippingData } from "@/lib/pdf-generator";

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPolished, setIsGeneratingPolished] = useState(false);

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

  const handlePolishedPDF = async () => {
    setIsGeneratingPolished(true);
    
    try {
      // Dynamically import the PDF generator to avoid chunk loading issues
      const { generatePolishedShippingLabel } = await import('@/lib/pdf-generator');
      await generatePolishedShippingLabel(sampleShippingData);
      console.log('Polished PDF generated successfully!');
    } catch (error) {
      console.error('Error generating polished PDF:', error);
      alert('Failed to generate polished PDF. Please check the console for details.');
    } finally {
      setIsGeneratingPolished(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 -mt-4">PDF Generation Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test PDF Generation</h2>
          
          <p className="text-gray-600 mb-6">
            This page tests the PDF generation functionality for shipping labels. 
            Choose between the legacy jsPDF version or the new polished React-PDF version.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={handleTestPDF}
              disabled={isGenerating || isGeneratingPolished}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  <span>Generating Legacy PDF...</span>
                </div>
              ) : (
                <span>Generate Legacy PDF (jsPDF)</span>
              )}
            </Button>

            <Button
              onClick={handlePolishedPDF}
              disabled={isGenerating || isGeneratingPolished}
              className="w-full"
              size="lg"
            >
              {isGeneratingPolished ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Polished PDF...</span>
                </div>
              ) : (
                <span>Generate Polished PDF (React-PDF)</span>
              )}
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What these tests do:</h3>
            <div className="text-sm text-blue-800 space-y-3">
              <div>
                <p className="font-medium">Legacy PDF (jsPDF):</p>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Uses jsPDF library for PDF generation</li>
                  <li>• Basic layout with manual positioning</li>
                  <li>• Downloads as &ldquo;test-shipping-label.pdf&rdquo;</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Polished PDF (React-PDF):</p>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Uses React-PDF for modern PDF generation</li>
                  <li>• Professional typography with Inter font</li>
                  <li>• Consistent spacing and visual hierarchy</li>
                  <li>• Better layout structure and accessibility</li>
                  <li>• Downloads as &ldquo;shipping-label-PCG120496E3V.pdf&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
            <h3 className="font-medium text-emerald-900 mb-2">Polished PDF Features:</h3>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• ✨ Modern Inter font family for better readability</li>
              <li>• 📐 Consistent spacing and visual hierarchy</li>
              <li>• 🎨 Professional typography with proper font weights</li>
              <li>• 📋 Clear section separation with subtle dividers</li>
              <li>• 📱 Optimized for 4x6 inch label printing</li>
              <li>• 🔍 Better contrast and accessibility compliance</li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <h3 className="font-medium text-amber-900 mb-2">Expected result:</h3>
            <p className="text-sm text-amber-800">
              Both PDFs should download successfully. The polished version should show 
              significantly improved typography, spacing, and overall professional appearance 
              compared to the legacy version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

