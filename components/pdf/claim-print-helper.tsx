"use client";

// import { ClaimReportPDF } from './claim-report-pdf';
import type { Claim } from '@/app/claims/history/page';

// Helper function to generate print-friendly content
export const generatePrintContent = (claim: Claim): string => {
  // Basic HTML structure with embedded styles for printing
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Claim Report - ${claim.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: #fff;
          padding: 20px;
        }
        
        .print-container {
          max-width: 100%;
          margin: 0 auto;
          background: #fff;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .logo {
          margin-bottom: 8px;
          display: inline-block;
        }
        
        .logo svg {
          width: 120px;
          height: 25px;
        }
        
        .title {
          font-size: 16px;
          font-weight: bold;
          color: #000;
        }
        
        .contact-info {
          text-align: right;
          font-size: 10px;
          color: #666;
          line-height: 1.3;
        }
        
        .contact-info div {
          margin-bottom: 2px;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 4px;
        }
        
        .info-label {
          width: 150px;
          background-color: #f8f9fa;
          padding: 4px 8px;
          font-weight: bold;
          color: #666;
          font-size: 11px;
        }
        
        .info-value {
          flex: 1;
          padding: 4px 8px;
          color: #000;
          font-size: 11px;
        }
        
        .documents-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10px;
        }
        
        .documents-table th {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
          font-weight: bold;
        }
        
        .documents-table td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        
        .documents-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          font-size: 9px;
          color: #666;
        }
        
        .footer-title {
          font-weight: bold;
          color: #000;
          margin-bottom: 8px;
          font-size: 11px;
        }
        
        .footer-center {
          text-align: center;
          margin-top: 15px;
          color: #888;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="logo">
              <svg width="163" height="33" viewBox="0 0 163 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_36_40)">
                  <path d="M47.585 0.584473C48.444 0.575981 49.3548 0.561365 50.1289 0.98877C51.0458 1.4091 51.6508 2.39007 51.6934 3.38623C51.682 10.0846 51.6985 16.7846 51.6914 23.4829C51.5612 24.959 50.9093 26.4093 49.8252 27.4312C48.6265 28.6369 47.4124 29.8277 46.208 31.0278C45.2796 32.1542 43.7754 32.6056 42.3574 32.5942C39.902 32.6197 37.4476 32.5912 34.9922 32.6011C33.9974 32.5742 33.0008 32.651 32.0088 32.5562C31.4004 32.5107 30.8344 32.0394 30.707 31.438C30.5048 30.7474 30.8871 29.9517 31.5508 29.6743C32.281 29.3674 33.0934 29.5357 33.8604 29.4946C33.8561 27.3436 33.8686 25.1925 33.8545 23.0415C33.2261 23.7364 32.5467 24.3807 31.8604 25.0161C29.8947 27.0144 27.9683 29.0492 25.9785 31.022C25.0743 32.0167 23.7401 32.6155 22.3916 32.5845C19.799 32.593 17.203 32.6408 14.6104 32.563C13.7485 32.5856 12.9413 31.8657 12.9355 30.9897C12.9412 28.7395 12.9232 26.4861 12.9346 24.2358C9.81112 24.2656 6.68595 24.2273 3.5625 24.2485C3.06441 24.2654 2.65941 23.9033 2.41602 23.5015C1.97176 22.6467 2.54226 21.3905 3.5625 21.3677C7.19674 21.3648 10.8326 21.3631 14.4668 21.3589C15.1815 21.2754 15.9217 21.9055 15.8877 22.6372C15.9033 24.9155 15.9477 27.1938 15.9053 29.4722C17.9276 29.509 19.9513 29.4818 21.9736 29.4917C22.3331 29.5002 22.7296 29.4637 22.9844 29.1792C24.7477 27.4456 26.4049 25.6074 28.1611 23.8667C29.1575 22.8633 30.1016 21.8088 31.0908 20.7983C29.8879 20.7828 28.6844 20.8114 27.4814 20.7788C26.8702 20.7745 26.2246 20.5111 25.9062 19.9663C25.4534 19.2191 25.7922 18.1432 26.5791 17.771C27.0291 17.5122 27.5587 17.5273 28.0596 17.5386C30.563 17.5485 33.0654 17.529 35.5674 17.5474C36.4178 17.5829 37.0554 18.4193 36.9521 19.2485C36.812 20.7981 36.8707 22.3549 36.8594 23.9087C36.8495 25.7641 36.8802 27.6212 36.8477 29.478C38.4072 29.5063 39.9669 29.4782 41.5264 29.4966C41.5094 23.186 41.515 16.8736 41.5264 10.563C32.9798 10.587 24.4333 10.5508 15.8867 10.5806C15.8867 12.8972 15.8853 15.2141 15.8867 17.5308C11.1188 17.5081 6.35089 17.5229 1.58301 17.5229C1.1457 17.5258 0.695838 17.3744 0.404297 17.0376C-0.221242 16.4206 -0.112511 15.2011 0.675781 14.7681C1.07054 14.4979 1.56276 14.5768 2.0127 14.5669C5.64563 14.5697 9.27917 14.5683 12.9121 14.5669C12.9432 12.6889 12.8411 10.8049 13.001 8.93115C13.0237 8.39783 13.3565 7.95533 13.7285 7.60303C15.4168 5.94022 16.989 4.16385 18.6787 2.50244C19.9623 1.26127 21.7417 0.56715 23.5264 0.588379C31.5464 0.577058 39.565 0.588718 47.585 0.584473ZM48.6592 5.78564C48.2376 6.04604 47.9064 6.41679 47.5527 6.75635C46.5366 7.75548 45.5215 8.75908 44.5322 9.78369C44.5195 15.9922 44.558 22.2106 44.5283 28.4233C45.3547 27.6705 46.1136 26.8474 46.9258 26.0776C47.3772 25.622 47.89 25.1986 48.1787 24.6128C48.5523 23.9264 48.689 23.135 48.6904 22.3608C48.7003 16.8358 48.6733 11.3107 48.6592 5.78564ZM5.55273 7.62842C6.78258 7.65248 8.01429 7.60583 9.24414 7.64404C9.99822 7.82403 10.4608 8.78464 10.124 9.49072C9.9386 9.95629 9.47986 10.3425 8.96191 10.3198C7.72931 10.283 6.49627 10.3294 5.26367 10.3237C4.38649 10.3305 3.77852 9.26712 4.12793 8.4917C4.26378 8.13366 4.54793 7.84182 4.89746 7.68896C5.10264 7.5984 5.33482 7.63972 5.55273 7.62842ZM46.377 3.62256C38.6667 3.63671 30.9563 3.62417 23.2461 3.62842C22.3347 3.58596 21.5545 4.16233 20.9092 4.73975C19.9724 5.62988 19.1259 6.6124 18.165 7.47705C26.2631 7.51102 34.3615 7.48692 42.4609 7.48975C43.7106 6.14526 45.1556 4.9911 46.377 3.62256Z" fill="#0091F5"/>
                  <path d="M136.577 9.26721C138.036 8.94465 139.677 9.03095 140.945 9.89417C141.427 10.1815 141.767 10.6405 142.208 10.9801C142.143 10.4678 142.088 9.95326 142.092 9.43811H145.756C145.671 13.0681 145.702 16.7012 145.709 20.3326C145.692 21.6134 145.708 22.944 145.193 24.1442C144.393 26.0207 142.559 27.3726 140.554 27.6783C138.689 27.9713 136.709 27.9529 134.937 27.234C134.136 26.8731 133.433 26.3473 132.797 25.7487C133.363 24.9648 133.896 24.153 134.527 23.4215C135.374 24.4189 136.733 24.8562 138.009 24.903C139.223 24.9808 140.614 24.7823 141.441 23.7946C142.175 22.9709 142.139 21.8003 142.204 20.7672L142.124 20.6852C141.762 21.0092 141.458 21.4039 141.033 21.653C139.894 22.4072 138.462 22.4263 137.148 22.3258C135.072 22.1362 133.242 20.6614 132.502 18.7281C131.887 17.1121 131.833 15.2951 132.265 13.6266C132.804 11.5504 134.466 9.76679 136.577 9.26721ZM81.8557 9.75159C83.3487 9.08788 85.0219 9.0403 86.6252 9.15491C88.0603 9.28228 89.5466 9.80641 90.4807 10.9528C91.3241 11.9349 91.5225 13.275 91.5735 14.526C91.5777 17.1993 91.5376 19.8756 91.7102 22.5475C90.588 22.5998 89.4614 22.5674 88.342 22.6608C88.2571 22.2094 88.1529 21.7606 88.01 21.3248C87.0944 22.4399 85.6195 22.9268 84.22 23.0231C82.6094 23.0924 80.8728 22.6242 79.7844 21.3717C78.791 20.2679 78.6779 18.5827 79.2834 17.2623C79.9401 15.9971 81.3031 15.3107 82.6575 15.0758C84.4009 14.7716 86.1711 14.6463 87.9329 14.526C87.9682 13.609 87.5945 12.5587 86.679 12.1979C85.5469 11.7282 84.1448 11.853 83.1458 12.5817C82.7651 12.8477 82.5251 13.2566 82.1897 13.568C81.3039 13.0233 80.3191 12.6562 79.4163 12.1383C79.9087 11.0758 80.8003 10.2441 81.8557 9.75159ZM107.757 9.60999C109.659 8.87979 111.881 8.89794 113.735 9.77112C114.952 10.3174 115.88 11.3474 116.456 12.5348C115.487 13.0612 114.533 13.6158 113.564 14.1422C112.805 12.2176 110.055 11.6079 108.48 12.8844C108.091 13.1774 107.836 13.6022 107.603 14.0211C107.177 14.982 107.169 16.0616 107.299 17.0875C107.506 18.2479 108.282 19.3476 109.425 19.734C111.009 20.327 112.948 19.563 113.658 18.0133C114.65 18.527 115.647 19.0367 116.646 19.5377C116.204 20.2905 115.702 21.0293 115.003 21.567C112.357 23.6007 108.266 23.5214 105.76 21.2897C105.013 20.6302 104.445 19.7879 104.06 18.8737C103.364 17.0664 103.363 14.9802 104.062 13.1744C104.751 11.5456 106.169 10.3289 107.757 9.60999ZM122.44 9.25159C124.216 8.90345 126.165 9.09141 127.719 10.0778C129.154 10.9382 130.115 12.4668 130.447 14.0885C130.588 15.0649 130.619 16.0615 130.479 17.0406C127.319 17.0166 124.158 17.0396 120.998 17.024C121.031 17.951 121.435 18.8919 122.205 19.441C123.797 20.5803 126.337 20.2605 127.433 18.5778C127.489 18.5198 127.601 18.4044 127.656 18.3463C128.55 18.8572 129.45 19.3595 130.365 19.8336C129.527 21.3168 128.041 22.3511 126.4 22.7516C124.57 23.2582 122.543 23.0685 120.866 22.1656C119.415 21.393 118.294 20.0218 117.825 18.444C117.269 16.6807 117.366 14.7288 118.073 13.0221C118.845 11.1838 120.463 9.67344 122.44 9.25159ZM153.2 9.2301C155.063 8.91599 157.068 9.13688 158.714 10.1119C159.794 10.7304 160.685 11.6676 161.244 12.7799C161.969 14.229 162.215 15.9227 161.897 17.5133C161.557 19.104 160.688 20.6314 159.341 21.5768C156.383 23.7761 151.738 23.4733 149.276 20.6598C147.453 18.6191 147.12 15.5001 148.221 13.0348C148.256 12.9628 148.327 12.8171 148.363 12.7448C149.302 10.8894 151.168 9.59524 153.2 9.2301ZM99.5374 9.88831C100.524 9.26855 101.772 8.95135 102.912 9.29944C102.888 10.4783 102.897 11.6573 102.89 12.8375C102.005 12.5049 100.997 12.4065 100.09 12.7037C99.1902 13.0053 98.6013 13.8412 98.2815 14.6959C97.8725 15.7715 97.945 16.9406 97.9436 18.0699V22.7194C96.7647 22.6797 95.5825 22.6889 94.4036 22.7115C94.3894 18.2876 94.4506 13.8621 94.343 9.43811C95.5092 9.43528 96.6754 9.44411 97.8401 9.4342C97.9448 10.0936 97.9394 10.7614 97.9719 11.4264C98.4615 10.8858 98.8879 10.2619 99.5374 9.88831ZM71.4143 5.33459C72.6103 5.36098 73.8229 5.57212 74.8694 6.17151C76.695 7.2216 77.9499 9.29107 77.8538 11.4196C77.9005 12.3366 77.623 13.2328 77.2522 14.0621C76.6365 15.3357 75.5372 16.3294 74.2522 16.9039C72.1124 17.7728 69.7632 17.4404 67.5159 17.5055V22.7145C66.2451 22.6819 64.9712 22.6923 63.7004 22.7135C63.6877 16.921 63.6988 11.1271 63.6946 5.33459H71.4143ZM88.0334 16.8981C87.0316 16.9179 86.0383 17.0443 85.0393 17.1207C84.4152 17.224 83.7352 17.2304 83.2073 17.6295C82.5125 18.1688 82.5626 19.3591 83.2659 19.8756C84.1744 20.5804 85.4906 20.414 86.4417 19.8805C87.496 19.296 88.1212 18.0968 88.0334 16.8981ZM155.397 12.2633C154.415 12.1359 153.344 12.3215 152.594 13.0065C151.583 13.8485 151.19 15.2619 151.371 16.5367C151.425 17.5627 151.865 18.5977 152.692 19.236C153.498 19.8912 154.604 20.0367 155.602 19.8541C156.675 19.6263 157.609 18.8708 158.055 17.8688C158.501 16.7395 158.503 15.4386 158.05 14.3121C158.016 14.2385 157.948 14.0917 157.914 14.0182C157.392 13.0983 156.469 12.3709 155.397 12.2633ZM139.956 12.4313C139.144 12.1484 138.254 12.2434 137.474 12.5787C136.735 13.0132 136.104 13.6898 135.867 14.5289C135.657 15.1219 135.717 15.762 135.731 16.3805C135.81 17.5182 136.509 18.6097 137.568 19.0739C138.877 19.6611 140.593 19.3616 141.519 18.2252C142.263 17.3152 142.33 16.0517 142.187 14.9352C142.008 13.762 141.091 12.7539 139.956 12.4313ZM125.347 12.1647C124.828 11.9156 124.242 11.9844 123.687 11.9957C122.618 12.1189 121.75 12.9214 121.323 13.8766C121.209 14.1752 121.128 14.4851 121.104 14.8063C123.068 14.7511 125.037 14.771 127.003 14.7965C126.99 13.7181 126.413 12.544 125.347 12.1647ZM67.5159 14.2711C68.6961 14.2357 69.8766 14.2741 71.0569 14.2487C71.528 14.2415 71.9779 14.083 72.4221 13.9401C74.4571 13.1462 74.6229 9.75747 72.5598 8.901C72.1637 8.78075 71.7659 8.6474 71.3528 8.59924C70.0749 8.56386 68.7952 8.5875 67.5159 8.5592V14.2711Z" fill="#0A0E14"/>
                </g>
                <defs>
                  <clipPath id="clip0_36_40">
                    <rect width="162.034" height="32.0237" fill="white" transform="translate(0 0.583496)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div class="title">CLAIM REPORT</div>
          </div>
          <div class="contact-info">
            <div><strong>Email:</strong> support@parcego.com</div>
            <div><strong>Claim ID:</strong> ${claim.id}</div>
            <div><strong>Phone:</strong> 1-800-PARCEGO</div>
            <div><strong>Shipment ID:</strong> ${claim.shipmentNumber}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="info-row">
            <div class="info-label">Claim Type</div>
            <div class="info-value">${claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status</div>
            <div class="info-value">${claim.status.replace('_', ' ').charAt(0).toUpperCase() + claim.status.replace('_', ' ').slice(1)}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Claimed Amount</div>
            <div class="info-value">${claim.amount}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Payout Amount</div>
            <div class="info-value">${claim.payoutAmount}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Submitted Date</div>
            <div class="info-value">${new Date(claim.submittedDate).toLocaleDateString()}</div>
          </div>
          ${claim.resolvedDate ? `
          <div class="info-row">
            <div class="info-label">Resolved Date</div>
            <div class="info-value">${new Date(claim.resolvedDate).toLocaleDateString()}</div>
          </div>
          ` : ''}
        </div>

        <!-- Incident Details -->
        <div class="section">
          <div class="section-title">Incident Details</div>
          <div class="info-row">
            <div class="info-label">Incident Date</div>
            <div class="info-value">${new Date(claim.incidentDate).toLocaleDateString()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Location</div>
            <div class="info-value">${claim.incidentLocation}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Description</div>
            <div class="info-value">${claim.description}</div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="info-row">
            <div class="info-label">Contact Name</div>
            <div class="info-value">${claim.contactName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Business Name</div>
            <div class="info-value">${claim.businessName || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone</div>
            <div class="info-value">${claim.contactPhone}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email</div>
            <div class="info-value">${claim.contactEmail}</div>
          </div>
        </div>

        <!-- Supporting Documents -->
        <div class="section">
          <div class="section-title">Supporting Documents</div>
          <table class="documents-table">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Document Name</th>
                <th style="width: 60px;">Type</th>
                <th style="width: 80px;">Size</th>
                <th style="width: 100px;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${claim.documents.map((doc, index) => {
                const extension = doc.split('.').pop()?.toLowerCase() || 'unknown';
                
                // Generate realistic file size based on document type
                const baseSize = 0.5 + (index * 0.3);
                let documentSize;
                switch (extension) {
                  case 'pdf':
                    documentSize = `${(baseSize + 0.5).toFixed(1)} MB`;
                    break;
                  case 'zip':
                    documentSize = `${(baseSize * 2 + 1).toFixed(1)} MB`;
                    break;
                  case 'jpg':
                  case 'jpeg':
                  case 'png':
                    documentSize = `${(baseSize * 0.8 + 0.2).toFixed(0)} KB`;
                    break;
                  case 'doc':
                  case 'docx':
                    documentSize = `${(baseSize + 0.3).toFixed(0)} KB`;
                    break;
                  default:
                    documentSize = `${(baseSize + 0.5).toFixed(1)} MB`;
                }
                
                // Generate realistic upload date based on claim submission
                const submittedDate = new Date(claim.submittedDate);
                const daysBeforeSubmission = Math.min(index, 3);
                const documentDate = new Date(submittedDate.getTime() - (daysBeforeSubmission * 24 * 60 * 60 * 1000));
                
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${doc}</td>
                    <td>${extension.toUpperCase()}</td>
                    <td>${documentSize}</td>
                    <td>${documentDate.toLocaleDateString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-title">IMPORTANT NOTES</div>
          <div>This report contains confidential claim information.</div>
          <div>For questions about this claim, contact support@parcego.com</div>
          <div>Keep this document for your records.</div>
          
          <div class="footer-center">
            Generated on ${new Date().toLocaleDateString()} | Parcego Claims Report
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
