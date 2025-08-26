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
