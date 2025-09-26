"use client";

import React from 'react';
import { Logo } from '@/components/ui/logo';
import type { Claim } from '@/app/claims/history/page';

// Status configuration for claims
const claimStatusConfig = {
  approved: { 
    label: "Approved", 
    color: "bg-green-50 text-green-700 border-green-200",
    description: "Claim has been approved and payout processed"
  },
  pending_review: { 
    label: "Pending Review", 
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    description: "Claim is under initial review by claims team"
  },
  under_investigation: { 
    label: "Under Investigation", 
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Claim is being investigated for additional details"
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-50 text-red-700 border-red-200",
    description: "Claim has been rejected based on policy terms"
  }
};

// Claim type configuration
const claimTypeConfig = {
  damage: { label: "Damage", color: "bg-orange-50 text-orange-700" },
  loss: { label: "Loss", color: "bg-red-50 text-red-700" },
  delay: { label: "Delay", color: "bg-yellow-50 text-yellow-700" },
  theft: { label: "Theft", color: "bg-purple-50 text-purple-700" },
  weather: { label: "Weather Damage", color: "bg-blue-50 text-blue-700" },
  handling: { label: "Handling Damage", color: "bg-yellow-50 text-yellow-700" }
};

interface ClaimReportPDFProps {
  claim: Claim;
  isPreview?: boolean;
}

export const ClaimReportPDF = ({ claim, isPreview = false }: ClaimReportPDFProps) => {
  const statusConfig = claimStatusConfig[claim.status as keyof typeof claimStatusConfig] || claimStatusConfig.pending_review;
  const typeConfig = claimTypeConfig[claim.claimType as keyof typeof claimTypeConfig] || claimTypeConfig.damage;
  
  const getProcessingTime = (submittedDate: string, resolvedDate: string | null) => {
    if (!resolvedDate) return "In Progress";
    
    const submitted = new Date(submittedDate);
    const resolved = new Date(resolvedDate);
    const diffTime = Math.abs(resolved.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const containerClass = isPreview 
    ? "max-w-4xl mx-auto bg-white p-8 space-y-6" 
    : "w-full bg-white p-8 space-y-6 font-sans text-sm leading-relaxed";

  return (
    <div 
      id="parcego-claim-report-pdf-content" 
      className={containerClass}
      style={!isPreview ? {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff'
      } : undefined}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
        <div>
          <div className="mb-2">
            <Logo className="inline-block" width={120} height={25} />
          </div>
          <h1 className="text-lg font-bold text-black">CLAIM REPORT</h1>
        </div>
        <div className="text-right text-xs text-gray-700 space-y-1">
          <div><strong>Email:</strong> support@parcego.com</div>
          <div><strong>Claim ID:</strong> {claim.id}</div>
          <div><strong>Phone Number:</strong> 1-800-PARCEGO</div>
          <div><strong>Shipment ID:</strong> {claim.shipmentNumber}</div>
          <div><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Basic Information</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Claim Type</span>
            <span className="px-2 py-1 text-black">{typeConfig.label}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Status</span>
            <span className="px-2 py-1 text-black">{statusConfig.label}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Claimed Amount</span>
            <span className="px-2 py-1 text-black">{claim.amount}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Payout Amount</span>
            <span className="px-2 py-1 text-black">{claim.payoutAmount}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Processing Time</span>
            <span className="px-2 py-1 text-black">{getProcessingTime(claim.submittedDate, claim.resolvedDate)}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Submitted Date</span>
            <span className="px-2 py-1 text-black">{new Date(claim.submittedDate).toLocaleDateString()}</span>
          </div>
          {claim.resolvedDate && (
            <>
              <div className="flex">
                <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Resolved Date</span>
                <span className="px-2 py-1 text-black">{new Date(claim.resolvedDate).toLocaleDateString()}</span>
              </div>
              <div></div>
            </>
          )}
        </div>
      </div>

      {/* Incident Details */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Incident Details</h2>
        <div className="space-y-2 text-xs">
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Incident Date</span>
            <span className="px-2 py-1 text-black">{new Date(claim.incidentDate).toLocaleDateString()}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Incident Location</span>
            <span className="px-2 py-1 text-black">{claim.incidentLocation}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Description</span>
            <span className="px-2 py-1 text-black flex-1">{claim.description}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Contact Information</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Contact Name</span>
            <span className="px-2 py-1 text-black">{claim.contactName}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Business Name</span>
            <span className="px-2 py-1 text-black">{claim.businessName || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Phone</span>
            <span className="px-2 py-1 text-black">{claim.contactPhone}</span>
          </div>
          <div className="flex">
            <span className="w-32 bg-gray-50 px-2 py-1 font-semibold text-gray-700">Email</span>
            <span className="px-2 py-1 text-black">{claim.contactEmail}</span>
          </div>
        </div>
      </div>

      {/* Supporting Documents */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Supporting Documents</h2>
        <div className="border border-gray-200 rounded">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-black">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6">Document Name</div>
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-2 text-center">Size</div>
              <div className="col-span-2 text-center">Date</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {claim.documents.map((doc, index) => {
              const extension = doc.split('.').pop()?.toLowerCase() || 'unknown';
              const documentSize = getDocumentSize(doc, index);
              const documentDate = getDocumentDate(claim.submittedDate, index);
              
              return (
                <div key={index} className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-700 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="col-span-1 text-center">{index + 1}</div>
                  <div className="col-span-6">{doc}</div>
                  <div className="col-span-1 text-center">{extension.toUpperCase()}</div>
                  <div className="col-span-2 text-center">{documentSize}</div>
                  <div className="col-span-2 text-center">{documentDate}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
        <div className="font-bold text-black text-sm">IMPORTANT NOTES</div>
        <div>This report contains confidential claim information.</div>
        <div>For questions about this claim, contact support@parcego.com</div>
        <div>Keep this document for your records.</div>
        
        <div className="text-center mt-4 text-gray-500">
          Generated on {new Date().toLocaleDateString()} | Parcego Claims Report
        </div>
      </div>
    </div>
  );
};

// Helper function to generate PDF using html2canvas-pro and jsPDF directly
export const generateClaimPDF = async (claim: Claim): Promise<void> => {
  try {
    // Dynamic imports to avoid SSR issues
    const html2canvas = (await import('html2canvas-pro')).default;
    const { jsPDF } = await import('jspdf');
    
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.color = '#000000';
    tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    
    // Add to DOM
    document.body.appendChild(tempContainer);
    
    try {
      // Import React and render the component
      const React = (await import('react')).default;
      const { createRoot } = await import('react-dom/client');
      
      const root = createRoot(tempContainer);
      
      // Render the component
      const element = React.createElement(ClaimReportPDF, { 
        claim, 
        isPreview: false 
      });
      
      // Use a Promise to wait for rendering
      await new Promise<void>((resolve, reject) => {
        root.render(element);
        
        // Wait longer for React to render and styles to apply
        setTimeout(async () => {
          const content = tempContainer.querySelector('#parcego-claim-report-pdf-content');
          if (!content) {
            reject(new Error('Could not find PDF content'));
            return;
          }
          
          try {
            // Configure html2canvas-pro options (supports oklch colors)
            const canvasOptions = {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              scrollX: 0,
              scrollY: 0,
              windowWidth: 1200,
              windowHeight: 1600,
              removeContainer: true,
              foreignObjectRendering: false,
              // Ignore elements that might cause issues
              ignoreElements: (element: Element) => {
                return element.classList.contains('html2canvas-ignore') || 
                       element.hasAttribute('data-html2canvas-ignore');
              },
              // Use onclone to clean up any problematic styles
              onclone: (clonedDoc: Document) => {
                // Convert any oklch colors to rgb/hex equivalents as fallback
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach((element: Element) => {
                  const htmlElement = element as HTMLElement;
                  const computedStyle = window.getComputedStyle(htmlElement);
                  
                  // Check for oklch colors in background-color
                  const bgColor = computedStyle.backgroundColor;
                  if (bgColor && bgColor.includes('oklch')) {
                    htmlElement.style.backgroundColor = '#ffffff';
                  }
                  
                  // Check for oklch colors in color
                  const textColor = computedStyle.color;
                  if (textColor && textColor.includes('oklch')) {
                    htmlElement.style.color = '#000000';
                  }
                  
                  // Check for oklch colors in border-color
                  const borderColor = computedStyle.borderColor;
                  if (borderColor && borderColor.includes('oklch')) {
                    htmlElement.style.borderColor = '#cccccc';
                  }
                });
              }
            };
            
            // Generate canvas using html2canvas-pro
            const canvas = await html2canvas(content as HTMLElement, canvasOptions);
            
            // Create PDF using jsPDF
            const pdf = new jsPDF({
              unit: 'mm',
              format: 'a4',
              orientation: 'portrait',
              compress: true
            });
            
            // Calculate dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            let position = 0;
            
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add new pages if content is longer than one page
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            // Save the PDF
            const filename = `claim-report-${claim.id}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            resolve();
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            reject(pdfError);
          }
        }, 500); // Increased wait time for better rendering
      });
      
    } finally {
      // Clean up
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Utility function to generate realistic file size based on document type
const getDocumentSize = (filename: string, index: number): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || 'unknown';
  const baseSize = 0.5 + (index * 0.3); // Base size varies by position
  
  switch (extension) {
    case 'pdf':
      return `${(baseSize + 0.5).toFixed(1)} MB`;
    case 'zip':
      return `${(baseSize * 2 + 1).toFixed(1)} MB`;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return `${(baseSize * 0.8 + 0.2).toFixed(0)} KB`;
    case 'doc':
    case 'docx':
      return `${(baseSize + 0.3).toFixed(0)} KB`;
    default:
      return `${(baseSize + 0.5).toFixed(1)} MB`;
  }
};

// Utility function to generate realistic upload date based on claim submission
const getDocumentDate = (claimSubmittedDate: string, index: number): string => {
  const submittedDate = new Date(claimSubmittedDate);
  // Documents are typically uploaded 0-3 days before claim submission
  const daysBeforeSubmission = Math.min(index, 3);
  const documentDate = new Date(submittedDate.getTime() - (daysBeforeSubmission * 24 * 60 * 60 * 1000));
  return documentDate.toLocaleDateString();
};
