"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  QrCode, 
  FileText, 
  Eye, 
  Loader2,
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  Building
} from 'lucide-react';
import QRCode from 'qrcode';

interface StudentPaymentRecordsProps {
  userData: any;
}

export default function StudentPaymentRecords({ userData }: StudentPaymentRecordsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadRecords = async () => {
    setIsDownloading(true);
    
    try {
      // Fetch payment records data
      const response = await fetch(`/api/payments/records?userId=${userData.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment records');
      }
      
      const recordsData = await response.json();
      
      // Generate HTML report with QR code
      const recordsHTML = await generatePaymentRecordsHTML(recordsData);
      
      // Create and download the records
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(recordsHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          // Close window after printing (optional)
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        };
      } else {
        // Fallback: create downloadable HTML file
        const blob = new Blob([recordsHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-records-${userData.username || userData.id}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading payment records:', error);
      alert('Failed to download payment records. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePaymentRecordsHTML = async (data: any) => {
    // Generate QR code image
    let qrCodeImage = '';
    try {
      qrCodeImage = await QRCode.toDataURL(data.verification.qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusText = (status: number) => {
      switch (status) {
        case 1: return "PAID";
        case 0: return "PENDING";
        case 2: return "FAILED";
        default: return "UNKNOWN";
      }
    };

    const getStatusColor = (status: number) => {
      switch (status) {
        case 1: return "#10b981"; // green
        case 0: return "#f59e0b"; // orange
        case 2: return "#ef4444"; // red
        default: return "#6b7280"; // gray
      }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Records - ${data.student.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 10px;
            background-color: #f9fafb;
            font-size: 13px;
        }
        
        .records {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        .records-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px;
            text-align: center;
        }
        
        .institution-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 8px;
            background: white;
            padding: 8px;
        }
        
        .institution-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .records-title {
            font-size: 16px;
            font-weight: 600;
            margin-top: 8px;
        }
        
        .records-body {
            padding: 20px;
        }
        
        .student-summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 20px;
        }
        
        .student-info, .payment-summary {
            flex: 1;
        }
        
        .info-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }
        
        .info-item {
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }
        
        .info-label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .info-value {
            font-weight: 600;
            text-align: right;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 8px;
        }
        
        .stat-card {
            text-align: center;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        
        .stat-card.success {
            background: #ecfdf5;
            border-color: #10b981;
        }
        
        .stat-card.pending {
            background: #fffbeb;
            border-color: #f59e0b;
        }
        
        .stat-value {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .stat-label {
            font-size: 11px;
            color: #6b7280;
        }
        
        .payments-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .payments-table th,
        .payments-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        
        .payments-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .payments-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .payments-table .amount {
            text-align: right;
            font-weight: 600;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        
        .verification-section {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
        }
        
        .verification-info {
            flex: 1;
        }
        
        .qr-section {
            text-align: center;
        }
        
        .qr-code {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px;
            background: white;
        }
        
        .verification-instructions {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 12px;
            margin-top: 10px;
        }
        
        .verification-title {
            font-size: 13px;
            font-weight: 600;
            color: #1d4ed8;
            margin-bottom: 6px;
        }
        
        .verification-steps {
            list-style: none;
            counter-reset: step-counter;
        }
        
        .verification-steps li {
            counter-increment: step-counter;
            margin-bottom: 5px;
            padding-left: 20px;
            position: relative;
            font-size: 11px;
            color: #1e40af;
        }
        
        .verification-steps li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #3b82f6;
            color: white;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            font-size: 9px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .records-footer {
            text-align: center;
            padding: 15px;
            background: #f9fafb;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
        }
        
        .disclaimer {
            font-size: 10px;
            margin-top: 8px;
            line-height: 1.3;
        }
        
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            @page {
                margin: 0.5in;
                size: A4;
            }
            
            body {
                background-color: white;
                padding: 0;
                margin: 0;
                max-width: none;
                width: 100%;
            }
            
            .records {
                box-shadow: none;
                border: 1px solid #e5e7eb;
                margin: 0;
                width: 100%;
                max-width: 100%;
            }
            
            .records-body {
                padding: 15px;
            }
            
            .student-summary {
                margin-bottom: 15px;
                gap: 15px;
            }
            
            .payments-table {
                margin: 10px 0;
            }
            
            .verification-section {
                margin-top: 15px;
                padding-top: 10px;
                gap: 15px;
            }
            
            .records-footer {
                padding: 10px;
            }
            
            /* Ensure content fits within print area */
            .info-item {
                margin-bottom: 4px;
                font-size: 11px;
            }
            
            .stat-card {
                padding: 8px;
            }
            
            .stat-value {
                font-size: 14px;
            }
            
            .payments-table th,
            .payments-table td {
                padding: 6px 10px;
                font-size: 10px;
            }
            
            .verification-instructions {
                padding: 10px;
            }
            
            .verification-steps li {
                font-size: 10px;
                margin-bottom: 4px;
                padding-left: 18px;
            }
            
            .qr-code img {
                width: 100px !important;
                height: 100px !important;
            }
            
            .records-header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .stat-card.success {
                background: #ecfdf5 !important;
                border-color: #10b981 !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .stat-card.pending {
                background: #fffbeb !important;
                border-color: #f59e0b !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .status-badge {
                -webkit-print-color-adjust: exact !important;
            }
            
            .verification-instructions {
                background: #eff6ff !important;
                border: 2px solid #3b82f6 !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .payments-table th {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .payments-table tr:nth-child(even) {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .qr-code {
                border: 2px solid #e5e7eb !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
        
        @media (max-width: 768px) {
            .student-summary {
                flex-direction: column;
            }
            
            .verification-section {
                flex-direction: column;
                text-align: center;
            }
            
            .payments-table {
                font-size: 12px;
            }
            
            .payments-table th,
            .payments-table td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="records">
        <div class="records-header">
            ${data.institution.logo_url ? `<img src="${data.institution.logo_url}" alt="Institution Logo" class="institution-logo">` : ''}
            <div class="institution-name">${data.institution.name}</div>
            ${data.institution.email ? `<div>Email: ${data.institution.email}</div>` : ''}
            <div class="records-title">STUDENT PAYMENT RECORDS</div>
        </div>
        
        <div class="records-body">
            <div class="student-summary">
                <div class="student-info">
                    <div class="info-title">Student Information</div>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${data.student.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${data.student.email}</span>
                    </div>
                    ${data.student.phone ? `
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${data.student.phone}</span>
                    </div>` : ''}
                    ${data.student.programme ? `
                    <div class="info-item">
                        <span class="info-label">Programme:</span>
                        <span class="info-value">${data.student.programme}</span>
                    </div>` : ''}
                    ${data.student.department ? `
                    <div class="info-item">
                        <span class="info-label">Department:</span>
                        <span class="info-value">${data.student.department}</span>
                    </div>` : ''}
                    ${data.student.faculty ? `
                    <div class="info-item">
                        <span class="info-label">Faculty:</span>
                        <span class="info-value">${data.student.faculty}</span>
                    </div>` : ''}
                </div>
                
                <div class="payment-summary">
                    <div class="info-title">Payment Summary</div>
                    <div class="summary-stats">
                        <div class="stat-card success">
                            <div class="stat-value" style="color: #10b981;">
                                ${formatCurrency(data.summary.paidAmount)}
                            </div>
                            <div class="stat-label">Total Paid</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: #3b82f6;">
                                ${data.summary.totalPayments}
                            </div>
                            <div class="stat-label">Total Payments</div>
                        </div>
                        ${data.summary.pendingAmount > 0 ? `
                        <div class="stat-card pending">
                            <div class="stat-value" style="color: #f59e0b;">
                                ${formatCurrency(data.summary.pendingAmount)}
                            </div>
                            <div class="stat-label">Pending</div>
                        </div>` : ''}
                        <div class="stat-card">
                            <div class="stat-value" style="color: #6b7280;">
                                ${data.summary.paidPayments}
                            </div>
                            <div class="stat-label">Successful</div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${data.payments.length > 0 ? `
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reference</th>
                        <th>Description</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.payments.map((payment: any) => `
                    <tr>
                        <td>${formatDate(payment.createdAt)}</td>
                        <td>${payment.reference || 'N/A'}</td>
                        <td>
                            ${payment.items.length > 0 
                                ? payment.items.map((item: any) => item.name).join(', ')
                                : 'Payment'}
                        </td>
                        <td>${payment.paymentMethod}</td>
                        <td>
                            <span class="status-badge" style="background-color: ${getStatusColor(payment.status)};">
                                ${getStatusText(payment.status)}
                            </span>
                        </td>
                        <td class="amount">${formatCurrency(payment.amount)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>` : ''}
            
            <div class="verification-section">
                <div class="verification-info">
                    <div class="info-title">QR Code Verification</div>
                    <div class="verification-instructions">
                        <div class="verification-title">How to Verify This Record</div>
                        <ol class="verification-steps">
                            <li>Open any QR code scanner on your mobile device</li>
                            <li>Scan the QR code on the right</li>
                            <li>Follow the verification link to confirm authenticity</li>
                            <li>The system will display verified payment information</li>
                        </ol>
                        <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
                            This QR code contains encrypted verification data that can be used by administrators 
                            to authenticate this payment record.
                        </p>
                    </div>
                </div>
                
                <div class="qr-section">
                    <div class="qr-code">
                        ${qrCodeImage ? `<img src="${qrCodeImage}" alt="Verification QR Code" style="width: 120px; height: 120px;">` : '<div style="width: 120px; height: 120px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 10px;">QR Code</div>'}
                    </div>
                    <p style="margin-top: 6px; font-size: 10px; color: #6b7280;">
                        Scan to Verify
                    </p>
                    <p style="font-size: 8px; color: #9ca3af; margin-top: 3px;">
                        Hash: ${data.verification.hash.substring(0, 12)}...
                    </p>
                </div>
            </div>
        </div>
        
        <div class="records-footer">
            <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 10px;">
                Official Student Payment Records
            </div>
            <p>This document contains verified payment information for academic services.</p>
            <p>Generated on ${formatDate(data.generatedAt)}</p>
            
            <div class="disclaimer">
                <strong>Disclaimer:</strong> This is an official record of payments made through the institution's payment system. 
                For any discrepancies or additional information, please contact the finance department. 
                The QR code above can be used for verification purposes by authorized personnel.
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <Button
      onClick={handleDownloadRecords}
      disabled={isDownloading}
      className="flex items-center gap-2"
      variant="outline"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isDownloading ? 'Generating...' : 'Download Records'}
    </Button>
  );
}