"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// This page implements the label-preview.mdc rule:
// - Client-only page
// - Print-ready 4x6 label canvas
// - Mock barcode/QR and shipment meta
// - Controls hidden during print

const DEFAULT_TRACKING = "PCG-TEST-000001";

const generateBarsFromTracking = (trackingNumber: string): number[] => {
  const seed = Array.from(trackingNumber).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  // Deterministic pattern of bar widths 1-3px for a simple mock barcode
  return Array.from({ length: 64 }).map((_, i) => {
    const n = (seed * (i + 17)) % 5;
    return [1, 1, 2, 2, 3][n];
  });
};

const LabelPreviewPage: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const trackingParam = params.get("tracking") || DEFAULT_TRACKING;

  const barWidths = useMemo(() => generateBarsFromTracking(trackingParam), [trackingParam]);

  const handlePrint = () => {
    // Force a small delay to ensure DOM is ready for printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Print-specific CSS to ensure consistency */}
      <style jsx>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #parcego-label-canvas {
            width: 4in !important;
            height: 6in !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          
          /* Logo print styles - ensure exact sizing and positioning */
          #parcego-label-canvas svg {
            width: 22px !important;
            height: 14px !important;
            min-width: 22px !important;
            min-height: 14px !important;
            max-width: 22px !important;
            max-height: 14px !important;
            display: block !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Watermark print styles - ensure visibility and correct sizing */
          #parcego-label-canvas > div:first-child {
            opacity: 0.03 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #parcego-label-canvas > div:first-child svg {
            width: 3in !important;
            height: 1.85in !important;
            min-width: 3in !important;
            min-height: 1.85in !important;
            max-width: 3in !important;
            max-height: 1.85in !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #parcego-label-barcode .bg-black {
            background-color: black !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #parcego-label-qr {
            border: 1px solid black !important;
            background: white !important;
            color: black !important;
          }
          
          .bg-black {
            background-color: black !important;
          }
          
          .text-black {
            color: black !important;
          }
          
          .border-black {
            border-color: black !important;
          }
          
          .bg-black\\/60 {
            background-color: rgba(0, 0, 0, 0.6) !important;
          }
          
          .text-black\\/70 {
            color: rgba(0, 0, 0, 0.7) !important;
          }
        }
      `}</style>

      {/* Controls (hidden in print) */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            id="parcego-label-preview-back-btn"
            aria-label="Go back"
          >
            <span aria-hidden className="mr-2 text-sm">←</span>
            Back
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm text-gray-600">Label Preview (4x6 inches)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/track-package?tracking=${encodeURIComponent(trackingParam)}`)}
            id="parcego-label-preview-track-btn"
            aria-label="Open tracking page"
          >
            <span aria-hidden className="mr-2 text-sm">📦</span>
            View Tracking
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            id="parcego-label-preview-print-btn"
            aria-label="Print label"
          >
            <span aria-hidden className="mr-2 text-sm">🖨️</span>
            Print
          </Button>
        </div>
      </div>

      {/* Centered preview container */}
      <div className="mx-auto max-w-5xl px-4 py-8 print:py-0 print:px-0">
        <div className="flex items-center justify-center">
          <div id="parcego-label-preview-container" className="bg-white shadow-lg ring-1 ring-gray-200 rounded-md overflow-hidden print:shadow-none print:ring-0 print:rounded-none">
            <div className="p-4 print:p-0">
              {/* The actual 4x6 canvas */}
              <div
                id="parcego-label-canvas"
                className="relative bg-white text-black border border-black print:border-0 print:bg-white"
                style={{ width: "4in", height: "6in" }}
              >
                {/* Large Watermark Logo - covers 75% of paper area with 3% opacity */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: 0.03 }}
                  aria-hidden="true"
                >
                  <svg 
                    width="3in" 
                    height="1.85in" 
                    viewBox="0 0 149 92" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="print:block"
                    style={{ 
                      printColorAdjust: 'exact',
                      WebkitPrintColorAdjust: 'exact'
                    }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <g clipPath="url(#clip0_9_46)">
                      <path d="M54.0828 2.98112C56.0155 1.11234 58.694 0.0682074 61.3811 0.100171C73.4568 0.0831236 85.5304 0.100171 97.6061 0.0937783C98.8995 0.080993 100.27 0.059681 101.435 0.703208C102.816 1.33608 103.728 2.81278 103.792 4.31293C103.775 14.3984 103.798 24.486 103.788 34.5715C103.592 36.794 102.612 38.9782 100.979 40.5167C99.1744 42.3322 97.3461 44.1242 95.5327 45.9312C94.1349 47.6274 91.8697 48.3072 89.7346 48.2901C86.0375 48.3285 82.3426 48.2859 78.6455 48.3008C77.1475 48.2603 75.6473 48.3754 74.1536 48.2326C73.2373 48.1644 72.3849 47.4548 72.1932 46.5492C71.8884 45.5093 72.4638 44.3118 73.4632 43.8941C74.5627 43.4317 75.7858 43.6853 76.9408 43.6235C76.9344 40.3845 76.9536 37.1456 76.9323 33.9067C75.9861 34.9529 74.9633 35.9225 73.9298 36.8792C70.97 39.8881 68.0699 42.9523 65.0739 45.9227C63.7122 47.4207 61.7028 48.3221 59.6721 48.2752C55.7683 48.288 51.8603 48.3605 47.9565 48.2433C46.6588 48.2774 45.4442 47.1927 45.4356 45.8737C45.4442 42.4856 45.4165 39.0932 45.4335 35.7051C40.7307 35.7499 36.0257 35.6923 31.3228 35.7243C30.5727 35.7499 29.9633 35.2044 29.5968 34.5992C28.9277 33.3121 29.7864 31.4199 31.3228 31.3858C36.7949 31.3816 42.2691 31.3794 47.7413 31.373C48.8174 31.2473 49.9318 32.1956 49.8807 33.2972C49.9041 36.728 49.9702 40.1587 49.9062 43.5894C52.9513 43.6448 55.9984 43.6043 59.0435 43.6192C59.5847 43.632 60.1814 43.5766 60.5649 43.1483C63.22 40.538 65.7153 37.77 68.3597 35.149C69.8598 33.6382 71.2811 32.0507 72.7706 30.5292C70.9594 30.5058 69.1481 30.5484 67.3369 30.4994C66.4163 30.493 65.4447 30.0966 64.9652 29.2762C64.2833 28.1511 64.7926 26.5317 65.9774 25.9712C66.655 25.5813 67.4519 25.6047 68.2063 25.6218C71.9758 25.6367 75.7432 25.6069 79.5106 25.6346C80.7913 25.6878 81.7523 26.9472 81.5968 28.1959C81.3858 30.5292 81.4732 32.8732 81.4561 35.2129C81.4412 38.0065 81.4881 40.8022 81.4391 43.5979C83.7873 43.6405 86.1355 43.5979 88.4838 43.6256C88.4582 34.124 88.4667 24.6203 88.4838 15.1186C75.6154 15.1549 62.747 15.0995 49.8785 15.1442C49.8785 18.6325 49.8764 22.1207 49.8785 25.609C42.6996 25.5749 35.5206 25.5983 28.3417 25.5983C27.6832 25.6026 27.0056 25.3746 26.5667 24.8674C25.6248 23.9384 25.7889 22.1016 26.9758 21.4495C27.5703 21.0425 28.3119 21.1618 28.9895 21.1469C34.4595 21.1512 39.9294 21.149 45.3994 21.1469C45.4463 18.3192 45.2929 15.483 45.5337 12.6617C45.5678 11.8584 46.0685 11.1914 46.6289 10.6608C49.1711 8.15705 51.5385 5.48278 54.0828 2.98112ZM57.441 6.35005C56.0304 7.69038 54.7561 9.16922 53.3093 10.4712C65.5022 10.5223 77.6951 10.4861 89.8902 10.4904C91.7717 8.46603 93.9474 6.72935 95.7863 4.66879C84.1773 4.6901 72.5682 4.67092 60.9591 4.67731C59.5869 4.61339 58.4127 5.48065 57.441 6.35005ZM97.5571 9.38656C96.0271 10.891 94.4993 12.4018 93.0098 13.9445C92.9906 23.2927 93.0481 32.6558 93.0034 42.0104C94.2478 40.8768 95.39 39.6366 96.6131 38.4774C97.2929 37.7913 98.0642 37.1541 98.4989 36.2719C99.0615 35.2385 99.2682 34.0473 99.2703 32.8817C99.2852 24.5627 99.2447 16.2438 99.2234 7.92478C98.5884 8.31686 98.0898 8.87515 97.5571 9.38656Z" fill="#0091F5"/>
                      <path d="M33.3322 10.7908C33.6412 10.6544 33.9907 10.7162 34.3188 10.6992C36.1706 10.7354 38.0244 10.6651 39.8762 10.7226C41.0119 10.9932 41.7087 12.4401 41.2016 13.5034C40.9224 14.2045 40.232 14.7862 39.4521 14.7521C37.5961 14.6967 35.7401 14.767 33.8841 14.7585C32.563 14.7692 31.6467 13.1667 32.173 11.999C32.3776 11.4599 32.8059 11.0209 33.3322 10.7908Z" fill="#0091F5"/>
                      <path d="M0.655222 57.5872C4.27346 57.5872 7.89171 57.5872 11.5099 57.5872C13.5535 57.5488 15.6801 57.8173 17.4807 58.8487C20.2295 60.4298 22.1196 63.5451 21.9747 66.75C22.045 68.1308 21.6274 69.4796 21.0691 70.7283C20.1422 72.6461 18.4865 74.142 16.5516 75.0072C13.3297 76.3155 9.79246 75.8148 6.40861 75.9128C6.40861 78.5274 6.40861 81.142 6.40861 83.7566C4.49508 83.7076 2.57728 83.7225 0.663744 83.7544C0.644566 75.0327 0.661615 66.3089 0.655222 57.5872ZM6.40861 62.4435C6.40861 65.3095 6.40861 68.1755 6.40861 71.0437C8.18577 70.9904 9.96293 71.048 11.7401 71.0096C12.4497 70.999 13.1273 70.7603 13.7964 70.5451C16.8606 69.3497 17.1099 64.2462 14.0031 62.957C13.4064 62.7759 12.8077 62.5756 12.1854 62.5031C10.2613 62.4499 8.33493 62.4861 6.40861 62.4435Z" fill="#0A0E14"/>
                      <path d="M28.0009 64.2377C30.249 63.2383 32.7677 63.168 35.182 63.3406C37.3427 63.5324 39.5801 64.3208 40.9865 66.0468C42.2565 67.5256 42.5548 69.5436 42.6315 71.4273C42.6379 75.4525 42.5783 79.482 42.8382 83.5051C41.1484 83.584 39.4523 83.535 37.7667 83.6756C37.6389 82.9959 37.4812 82.3204 37.266 81.6641C35.8873 83.3432 33.6669 84.0762 31.5595 84.2211C29.1345 84.3255 26.5199 83.6202 24.8813 81.7344C23.3854 80.0723 23.2149 77.5344 24.1269 75.5463C25.1157 73.6413 27.1677 72.6078 29.207 72.2541C31.8322 71.7959 34.498 71.6084 37.1509 71.4273C37.2042 70.0465 36.6416 68.4654 35.2629 67.922C33.5582 67.2145 31.4465 67.402 29.9421 68.4995C29.3689 68.9001 29.0088 69.5159 28.5038 69.9847C27.1698 69.1643 25.6867 68.6124 24.3272 67.8325C25.0688 66.2322 26.4112 64.9792 28.0009 64.2377ZM32.7933 75.3332C31.8535 75.4888 30.8307 75.4994 30.0359 76.1003C28.9896 76.9122 29.0642 78.7043 30.1233 79.482C31.4913 80.5432 33.473 80.2918 34.905 79.4884C36.4925 78.6084 37.4343 76.8035 37.3022 74.9987C35.7935 75.0285 34.2977 75.2181 32.7933 75.3332Z" fill="#0A0E14"/>
                      <path d="M54.6219 64.4443C56.1071 63.511 57.9865 63.0337 59.704 63.5579C59.6678 65.3329 59.6806 67.108 59.6699 68.8851C58.3381 68.3844 56.8209 68.2352 55.455 68.6827C54.0998 69.1366 53.2133 70.3959 52.7318 71.683C52.1159 73.3024 52.2246 75.0625 52.2225 76.763C52.2225 79.0963 52.2225 81.4296 52.2225 83.763C50.4475 83.7033 48.6682 83.7182 46.8931 83.7523C46.8718 77.0911 46.9635 70.4279 46.8015 63.7667C48.5574 63.7625 50.3132 63.7752 52.0669 63.7603C52.2246 64.7533 52.2161 65.7591 52.2651 66.7606C53.0024 65.9466 53.6438 65.0069 54.6219 64.4443Z" fill="#0A0E14"/>
                      <path d="M66.9982 64.0245C69.8621 62.925 73.2076 62.9527 75.9991 64.2675C77.8316 65.09 79.2295 66.6413 80.0968 68.4291C78.6371 69.2218 77.2009 70.0571 75.7412 70.8498C74.5991 67.9518 70.4588 67.0333 68.0871 68.9554C67.5011 69.3965 67.1175 70.0358 66.7659 70.6665C66.1245 72.1134 66.1139 73.7392 66.3099 75.2841C66.621 77.0315 67.7888 78.6872 69.5105 79.2689C71.895 80.1617 74.8143 79.0111 75.884 76.6777C77.3777 77.4513 78.8779 78.2184 80.3823 78.9727C79.7175 80.1063 78.961 81.2187 77.9083 82.0284C73.9236 85.0905 67.7653 84.9711 63.9915 81.6107C62.8664 80.6177 62.0119 79.3499 61.4323 77.9733C60.3839 75.2522 60.3818 72.1113 61.4345 69.3922C62.4722 66.9396 64.6074 65.107 66.9982 64.0245Z" fill="#0A0E14"/>
                      <path d="M89.1061 63.4855C91.7804 62.9613 94.7146 63.2447 97.0543 64.7299C99.2151 66.0255 100.662 68.3268 101.161 70.7688C101.374 72.2391 101.421 73.7393 101.21 75.2138C96.4513 75.1776 91.693 75.2117 86.9348 75.1883C86.9838 76.584 87.5932 78.0011 88.7524 78.8278C91.1497 80.5432 94.9746 80.0616 96.6239 77.528C96.7091 77.4406 96.8775 77.2659 96.9606 77.1785C98.3052 77.9478 99.6604 78.7042 101.037 79.4181C99.7755 81.6513 97.5402 83.2089 95.0684 83.812C92.3131 84.5748 89.2617 84.2893 86.7366 82.9298C84.5503 81.7663 82.8626 79.7015 82.1573 77.3256C81.3199 74.6705 81.4669 71.732 82.5302 69.1621C83.6937 66.3941 86.1293 64.1205 89.1061 63.4855ZM87.4227 70.4492C87.2523 70.8988 87.1308 71.3655 87.0946 71.8492C90.0523 71.7661 93.0163 71.7959 95.9761 71.8343C95.9569 70.2105 95.0875 68.4419 93.483 67.8708C92.7009 67.4958 91.8188 67.6002 90.9835 67.6173C89.3746 67.8026 88.0663 69.0108 87.4227 70.4492Z" fill="#0A0E14"/>
                      <path d="M110.391 63.5089C112.588 63.023 115.058 63.153 116.967 64.4529C117.694 64.8854 118.205 65.5758 118.87 66.0873C118.772 65.3159 118.689 64.5424 118.696 63.7667C120.534 63.7667 122.373 63.7667 124.212 63.7667C124.085 69.2324 124.131 74.7024 124.142 80.1703C124.117 82.0987 124.14 84.1017 123.364 85.9087C122.16 88.7343 119.399 90.7693 116.379 91.2296C113.571 91.6707 110.59 91.643 107.922 90.5605C106.716 90.0171 105.657 89.2265 104.7 88.3252C105.552 87.1447 106.353 85.9215 107.304 84.8199C108.58 86.3221 110.626 86.9806 112.548 87.0509C114.376 87.1681 116.471 86.8698 117.715 85.3824C118.821 84.1422 118.766 82.38 118.864 80.8245L118.745 80.7009C118.199 81.1888 117.741 81.7834 117.102 82.1584C115.386 83.2941 113.23 83.3219 111.25 83.1706C108.124 82.885 105.371 80.6646 104.257 77.7539C103.33 75.3204 103.249 72.5843 103.899 70.072C104.711 66.946 107.212 64.2611 110.391 63.5089ZM111.742 68.4952C110.63 69.1493 109.68 70.1679 109.324 71.4315C109.006 72.3243 109.096 73.2875 109.117 74.2187C109.237 75.9319 110.289 77.5749 111.883 78.2738C113.854 79.1581 116.439 78.7085 117.833 76.9974C118.953 75.6272 119.054 73.7244 118.838 72.0431C118.57 70.2766 117.189 68.7594 115.48 68.2735C114.257 67.8474 112.917 67.9901 111.742 68.4952Z" fill="#0A0E14"/>
                      <path d="M135.421 63.4535C138.225 62.9804 141.244 63.3128 143.723 64.781C145.349 65.7122 146.691 67.1229 147.533 68.7977C148.624 70.9798 148.994 73.5304 148.515 75.9256C148.004 78.3207 146.695 80.6199 144.667 82.0433C140.213 85.3547 133.22 84.8987 129.512 80.6625C126.767 77.5898 126.266 72.8933 127.924 69.1813C127.978 69.0726 128.084 68.8531 128.137 68.7445C129.552 65.9509 132.361 64.0033 135.421 63.4535ZM134.509 69.1387C132.985 70.4066 132.395 72.5353 132.668 74.4552C132.749 76.0001 133.411 77.5578 134.656 78.5188C135.87 79.5054 137.535 79.7249 139.037 79.45C140.652 79.107 142.058 77.9691 142.73 76.4604C143.401 74.76 143.405 72.8017 142.723 71.1055C142.672 70.9947 142.57 70.7731 142.519 70.6623C141.732 69.2772 140.343 68.1819 138.728 68.02C137.249 67.8282 135.638 68.1073 134.509 69.1387Z" fill="#0A0E14"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_9_46">
                        <rect width="148.31" height="91.5748" fill="white" transform="translate(0.548584)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-3 pt-3">
                  <div className="flex items-center gap-2">
                    <svg 
                      width="22" 
                      height="14" 
                      viewBox="0 0 41 25" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 print:block"
                      aria-hidden="true"
                      style={{ 
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact'
                      }}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <g clipPath="url(#clip0_35_54)">
                        <path d="M36.7788 0.29657C37.4253 0.290178 38.1103 0.279704 38.6929 0.601257C39.3833 0.917694 39.8396 1.65685 39.8716 2.40692C39.8631 7.44951 39.875 12.4932 39.8696 17.5358C39.7716 18.647 39.2814 19.7392 38.4653 20.5085C37.5629 21.4162 36.6484 22.312 35.7417 23.2155C35.0428 24.0636 33.9099 24.4037 32.8423 24.3952C30.9939 24.4144 29.1467 24.3926 27.2983 24.4001C26.5494 24.3798 25.7991 24.4373 25.0522 24.3659C24.5942 24.3318 24.1678 23.9777 24.0718 23.5251C23.9194 23.0053 24.207 22.4059 24.7065 22.197C25.2563 21.9658 25.8683 22.0931 26.4458 22.0622C26.4426 20.4429 26.4525 18.8231 26.4419 17.2038C25.9688 17.7269 25.4567 18.2118 24.9399 18.6901C23.4602 20.1944 22.0101 21.7265 20.5122 23.2116C19.8314 23.9605 18.8263 24.4108 17.811 24.3874C15.8593 24.3938 13.9054 24.4304 11.9536 24.3718C11.3049 24.3888 10.6973 23.8466 10.6929 23.1872C10.6971 21.4931 10.6834 19.7963 10.6919 18.1022C8.34069 18.1246 5.98842 18.096 3.63721 18.112C3.26217 18.1248 2.95718 17.8521 2.77393 17.5495C2.43939 16.906 2.86903 15.9601 3.63721 15.9431C6.37311 15.9409 9.11029 15.9394 11.8462 15.9362C12.3842 15.8735 12.9411 16.3484 12.9155 16.8991C12.9272 18.6143 12.9602 20.3294 12.9282 22.0446C14.4507 22.0723 15.975 22.0518 17.4976 22.0593C17.768 22.0656 18.0657 22.0379 18.2573 21.8239C19.5847 20.5189 20.8327 19.1353 22.1548 17.8249C22.9049 17.0695 23.6161 16.2751 24.3608 15.5143C23.4553 15.5026 22.5496 15.5242 21.644 15.4997C21.1838 15.4965 20.6972 15.2986 20.4575 14.8884C20.1166 14.3258 20.372 13.5162 20.9644 13.236C21.3031 13.0411 21.7015 13.0527 22.0786 13.0612C23.9633 13.0687 25.8473 13.0532 27.731 13.0671C28.3711 13.0939 28.8517 13.7241 28.7739 14.3483C28.6685 15.5148 28.7121 16.6865 28.7036 17.8561C28.6962 19.2528 28.7193 20.6508 28.6948 22.0485C29.8689 22.0698 31.0432 22.0493 32.2173 22.0632C32.2045 17.3124 32.2088 12.5601 32.2173 7.80927C25.7831 7.82738 19.3488 7.79959 12.9146 7.82196C12.9146 9.56605 12.9135 11.3103 12.9146 13.0544C9.3251 13.0373 5.73545 13.0495 2.146 13.0495C1.81684 13.0516 1.47774 12.9368 1.2583 12.6833C0.78784 12.2186 0.870102 11.3002 1.46338 10.9743C1.76058 10.7711 2.13152 10.8314 2.47021 10.8239C5.20516 10.826 7.94035 10.825 10.6753 10.8239C10.6987 9.41007 10.6213 7.9914 10.7417 6.58075C10.7567 6.22927 10.9511 5.93034 11.187 5.68329L11.7632 5.10712C12.8585 3.99551 13.9041 2.83527 15.0171 1.74091C15.9834 0.806605 17.3221 0.284588 18.6655 0.300476C24.7034 0.291953 30.7409 0.299766 36.7788 0.29657ZM37.5874 4.21259C37.2699 4.40863 37.0198 4.68735 36.7534 4.94305C35.9885 5.69522 35.2247 6.45101 34.48 7.22235C34.4704 11.8964 34.4994 16.5783 34.4771 21.2556C35.0992 20.6888 35.6702 20.0685 36.2817 19.489C36.6216 19.1459 37.0077 18.8274 37.2251 18.3864C37.5063 17.8697 37.6097 17.2738 37.6108 16.6911C37.6183 12.5317 37.5981 8.37201 37.5874 4.21259ZM5.13525 5.5993C6.06101 5.6174 6.98782 5.58226 7.91357 5.61102C8.48142 5.74633 8.83014 6.47 8.57666 7.00165C8.43709 7.35217 8.0916 7.64271 7.70166 7.62567C6.77366 7.59797 5.84548 7.63384 4.91748 7.62958C4.25708 7.63478 3.79911 6.83349 4.06201 6.24969C4.16429 5.98014 4.37893 5.76027 4.64209 5.6452C4.79648 5.57724 4.97131 5.60782 5.13525 5.5993ZM35.8687 2.58466C30.0641 2.59531 24.2591 2.58537 18.4546 2.58856C17.7686 2.55675 17.1816 2.99085 16.6958 3.42548C15.9906 4.09557 15.3537 4.83512 14.6304 5.48602C20.7267 5.51159 26.823 5.49268 32.9204 5.49481C33.8611 4.48275 34.9492 3.61484 35.8687 2.58466Z" fill="#0091F5"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_35_54">
                          <rect width="39.5" height="24.5" fill="white" transform="translate(0.75 0.25)"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="font-semibold text-[11px]">Parcego</span>
                  </div>
                  <div className="text-[11px] font-mono" id="parcego-label-tracking">
                    {trackingParam}
                  </div>
                </div>

                <div className="my-2 h-px bg-black" />

                {/* From / To blocks */}
                <div className="px-3 space-y-2">
                  <div>
                    <div className="text-[9px] font-semibold">FROM</div>
                    <div className="text-[10px] leading-tight">
                      John&apos;s Electronics Store<br />
                      123 Business St, Suite 100<br />
                      New York, NY 10001
                    </div>
                  </div>
                  <div className="h-px bg-black/60" />
                  <div>
                    <div className="text-[9px] font-semibold">TO</div>
                    <div className="text-[10px] leading-tight" id="parcego-label-to-address">
                      Sarah Johnson<br />
                      456 Customer Ave, Apt 2B<br />
                      Los Angeles, CA 90210
                    </div>
                  </div>
                </div>

                {/* Service badge */}
                <div className="px-3 mt-3">
                  <div className="border border-black px-2 py-1 rounded-sm">
                    <div className="text-[11px] font-bold tracking-wide">STANDARD</div>
                    <div className="text-[9px]">3-5 Business Days</div>
                  </div>
                </div>

                {/* Mock barcode - Enhanced for print compatibility */}
                <div className="px-3 mt-4">
                  <div aria-label="Barcode" className="flex items-end gap-[2px] h-14" id="parcego-label-barcode">
                    {barWidths.map((w, i) => (
                      <div 
                        key={`parcego-label-bar-${i}`} 
                        className="bg-black h-full print:bg-black" 
                        style={{ 
                          width: w, 
                          minWidth: w,
                          backgroundColor: 'black',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact'
                        }} 
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-center text-[10px] font-mono tracking-wider">{trackingParam}</div>
                </div>

                {/* QR + meta */}
                <div className="px-3 mt-4 grid grid-cols-[1fr_56px] gap-2 items-start">
                  <div className="space-y-1">
                    <div className="text-[9px]">Weight: 2.5 lb • Dim: 12x8x6 in</div>
                    <div className="text-[9px]">Ref: WEB-ORDER-12345</div>
                    <div className="text-[9px]">Carrier: Parcego</div>
                  </div>
                  <div 
                    aria-label="QR" 
                    id="parcego-label-qr" 
                    className="aspect-square w-14 border border-black grid place-items-center text-[10px] font-mono print:border-black print:bg-white print:text-black"
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }}
                  >
                    QR
                  </div>
                </div>

                {/* Footer notes */}
                <div className="absolute bottom-2 left-3 right-3 text-[8px] text-black/70 print:text-black/70">
                  Ship by: {new Date().toLocaleDateString()} • Non-hazardous • No signature required
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Helper (hidden when printing) */}
        <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
          Use the Print button. Ensure paper size 4x6 inches and scale 100%.
        </div>
      </div>
    </div>
  );
};

export default LabelPreviewPage;
