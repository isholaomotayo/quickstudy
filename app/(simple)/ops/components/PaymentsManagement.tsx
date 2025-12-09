"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Mail,
  Hash,
  FileText,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useApp } from "@/contexts/AppContext";
import { usePaymentsData } from "@/hooks/useDashboardData";
import { usePermissions } from "@/hooks/usePermissions";
import {
  FinanceOverviewGate,
  PaymentsGate,
} from "@/components/auth/PermissionGate";
import { FinancialGuard } from "@/components/auth/OpsGuard";
import FeeManagement from "./FeeManagement";

interface Payment {
  id: number;
  reference: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: number;
  paymentMethod: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  currency?: string;
  userId?: string;
  cart?: Record<string, CartItem>;
}

interface CartItem {
  name: string;
  quantity: number;
  unit_price: number;
  fee_plan?: string;
  fee_from?: string;
  expiry?: string;
  semester_id?: number;
  session_id?: number;
}

interface PaymentAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  paymentSuccessRate: number;
  revenueGrowth: number;
}

function PaymentsManagementContent() {
  const { userData, isLoading: userDataLoading } = useApp();
  const { can } = usePermissions();

  // Don't render until user data is loaded
  if (userDataLoading || !userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [reconcileResult, setReconcileResult] = useState<any>(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const status = statusFilter === "all" ? undefined : parseInt(statusFilter);
  const searchQuery = debouncedSearchTerm.trim() || undefined; // Only search if there's actual text
  const { data, error, isLoading, mutate } = usePaymentsData(
    userData?.institution_id,
    status,
    50, // limit
    searchQuery
  );

  const payments = data?.payments || [];
  const stats = data?.statistics || {};

  const analytics: PaymentAnalytics = {
    totalRevenue: stats.totalRevenue || 0,
    monthlyRevenue: (stats.totalRevenue || 0) * 0.3, // Estimate
    pendingPayments: stats.pending || 0,
    successfulPayments: stats.completed || 0,
    failedPayments: stats.failed || 0,
    averagePaymentAmount: (stats.totalRevenue || 0) / (stats.completed || 1),
    paymentSuccessRate: ((stats.completed || 0) / (stats.total || 1)) * 100,
    revenueGrowth: 15.5, // Placeholder
  };

  // Frontend filtering now only handles payment method since search and status are handled on backend
  const allFilteredPayments = payments.filter((payment) => {
    const matchesMethod =
      paymentMethodFilter === "all" ||
      (payment.paymentMethod || "") === paymentMethodFilter;

    return matchesMethod;
  });

  // Pagination logic
  const totalPages = Math.ceil(allFilteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredPayments = allFilteredPayments.slice(startIndex, endIndex);

  // Reset to first page when backend filters change (search and status are handled on backend)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case 1:
        return "default";
      case 0:
        return "secondary";
      case 2:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Successful";
      case 0:
        return "Pending";
      case 2:
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="h-4 w-4" />;
      case 0:
        return <Clock className="h-4 w-4" />;
      case 2:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const handleExportPayments = () => {
    // TODO: Implement CSV export functionality
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      // Fetch receipt data from API
      const response = await fetch(
        `/api/dashboard/payments/receipt?paymentId=${payment.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch receipt data");
      }

      const receiptData = await response.json();

      // Generate HTML receipt
      const receiptHTML = generateReceiptHTML(receiptData);

      // Create and download PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(receiptHTML);
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
        const blob = new Blob([receiptHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt-${payment.reference || payment.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const generateReceiptHTML = (data: any) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: data.receipt.currency || "NGN",
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
        case 1:
          return "PAID";
        case 0:
          return "PENDING";
        case 2:
          return "FAILED";
        default:
          return "UNKNOWN";
      }
    };

    const getStatusColor = (status: number) => {
      switch (status) {
        case 1:
          return "#10b981"; // green
        case 0:
          return "#f59e0b"; // orange
        case 2:
          return "#ef4444"; // red
        default:
          return "#6b7280"; // gray
      }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${data.receipt.reference}</title>
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
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
            background-color: #f9fafb;
            font-size: 13px;
        }
        
        .receipt {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .institution-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 15px;
            background: white;
            padding: 10px;
        }
        
        .institution-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        
        .receipt-title {
            font-size: 16px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .receipt-body {
            padding: 20px;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .info-section {
            flex: 1;
            min-width: 200px;
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
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: ${getStatusColor(data.receipt.status)};
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .items-table th,
        .items-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        
        .items-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .items-table tr:hover {
            background: #f9fafb;
        }
        
        .items-table .amount {
            text-align: right;
            font-weight: 600;
        }
        
        .summary {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            padding: 3px 0;
            font-size: 12px;
        }
        
        .summary-total {
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .receipt-footer {
            text-align: center;
            padding: 15px;
            background: #f9fafb;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
        }
        
        .thank-you {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
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
            
            .receipt {
                box-shadow: none;
                border: 1px solid #e5e7eb;
                margin: 0;
                width: 100%;
                max-width: 100%;
            }
            
            .receipt-body {
                padding: 15px;
            }
            
            .receipt-info {
                margin-bottom: 15px;
                gap: 12px;
            }
            
            .items-table {
                margin: 10px 0;
            }
            
            .summary {
                margin-top: 10px;
                padding: 10px;
            }
            
            .receipt-footer {
                padding: 10px;
            }
            
            /* Ensure content fits within print area */
            .info-item {
                margin-bottom: 4px;
                font-size: 11px;
            }
            
            .info-section {
                min-width: 180px;
            }
            
            .items-table th,
            .items-table td {
                padding: 6px 10px;
                font-size: 10px;
            }
            
            .summary-row {
                margin-bottom: 4px;
                font-size: 11px;
            }
            
            .summary-total {
                padding-top: 6px;
                font-size: 13px;
            }
            
            .receipt-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .status-badge {
                -webkit-print-color-adjust: exact !important;
            }
            
            .items-table th {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .items-table tr:hover {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .summary {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            .receipt-footer {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
        
        @media (max-width: 768px) {
            .receipt-info {
                flex-direction: column;
            }
            
            .items-table {
                font-size: 12px;
            }
            
            .items-table th,
            .items-table td {
                padding: 8px 6px;
            }
        }
        
        @media (max-width: 640px) {
            .receipt-body {
                padding: 15px;
            }
            
            .receipt-info {
                gap: 10px;
            }
            
            .info-section {
                min-width: auto;
            }
            
            .items-table {
                font-size: 11px;
            }
            
            .items-table th,
            .items-table td {
                padding: 6px 4px;
            }
            
            .summary {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="receipt-header">
            ${
              data.institution.logo_url
                ? `<img src="${data.institution.logo_url}" alt="Institution Logo" class="institution-logo">`
                : ""
            }
            <div class="institution-name">${data.institution.name}</div>
            ${
              data.institution.email
                ? `<div>Email: ${data.institution.email}</div>`
                : ""
            }
            <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-info">
                <div class="info-section">
                    <div class="info-title">Receipt Information</div>
                    <div class="info-item">
                        <span class="info-label">Receipt No:</span>
                        <span class="info-value">${data.receipt.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Reference:</span>
                        <span class="info-value">${
                          data.receipt.reference || "N/A"
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${formatDate(
                          data.receipt.date
                        )}</span>
                    </div>
                    ${
                      data.receipt.paidDate
                        ? `
                    <div class="info-item">
                        <span class="info-label">Paid Date:</span>
                        <span class="info-value">${formatDate(
                          data.receipt.paidDate
                        )}</span>
                    </div>`
                        : ""
                    }
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">
                            <span class="status-badge">${getStatusText(
                              data.receipt.status
                            )}</span>
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value">${
                          data.receipt.paymentMethod
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Description:</span>
                        <span class="info-value">${
                          data.receipt.description || "Payment"
                        }</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <div class="info-title">Student Information</div>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${
                          data.student.name || "N/A"
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${
                          data.student.email || "N/A"
                        }</span>
                    </div>
                    ${
                      data.student.phone
                        ? `
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${data.student.phone}</span>
                    </div>`
                        : ""
                    }
                    ${
                      data.student.programme
                        ? `
                    <div class="info-item">
                        <span class="info-label">Programme:</span>
                        <span class="info-value">${data.student.programme}</span>
                    </div>`
                        : ""
                    }
                    ${
                      data.student.department
                        ? `
                    <div class="info-item">
                        <span class="info-label">Department:</span>
                        <span class="info-value">${data.student.department}</span>
                    </div>`
                        : ""
                    }
                    ${
                      data.student.faculty
                        ? `
                    <div class="info-item">
                        <span class="info-label">Faculty:</span>
                        <span class="info-value">${data.student.faculty}</span>
                    </div>`
                        : ""
                    }
                </div>
            </div>
            
            ${
              data.items.length > 0
                ? `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Plan</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th class="amount">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items
                      .map(
                        (item: any) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.fee_plan}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unit_price)}</td>
                        <td class="amount">${formatCurrency(item.total)}</td>
                    </tr>`
                      )
                      .join("")}
                </tbody>
            </table>`
                : ""
            }
            
            <div class="summary">
                ${
                  data.items.length > 0
                    ? `
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(data.summary.subtotal)}</span>
                </div>`
                    : ""
                }
                <div class="summary-row summary-total">
                    <span>Total Amount:</span>
                    <span>${formatCurrency(data.summary.total)}</span>
                </div>
            </div>
        </div>
        
        <div class="receipt-footer">
            <div class="thank-you">Thank you for your payment!</div>
            <p>This is an official receipt for your payment transaction.</p>
            <p>For any inquiries, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleRefreshData = () => {
    mutate();
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    console.log("Payment data:", payment);
    console.log("Cart data:", payment.cart);
    if (payment.cart) {
      Object.entries(payment.cart).forEach(([key, item]) => {
        console.log(`Cart item ${key}:`, item);
        console.log(
          `Unit price for ${key}:`,
          item.unit_price,
          typeof item.unit_price
        );
      });
    }
    setSelectedPayment(payment);
    setIsPaymentDetailsOpen(true);
  };

  const handleSyncPendingPayments = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch("/api/dashboard/payments/sync-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok) {
        setSyncResult(result);
        // Refresh the payments data
        mutate();
      } else {
        throw new Error(result.error || "Failed to sync payments");
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncResult({
        error:
          error instanceof Error ? error.message : "Failed to sync payments",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconcileUser = async (userEmail?: string) => {
    if (!userEmail) {
      alert("User email is required for reconciliation");
      return;
    }

    setIsReconciling(true);
    setReconcileResult(null);

    try {
      const response = await fetch("/api/dashboard/payments/reconcile-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userEmail,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setReconcileResult(result);
        // Refresh the payments data
        mutate();
      } else {
        throw new Error(result.error || "Failed to reconcile user payments");
      }
    } catch (error) {
      console.error("Reconciliation error:", error);
      setReconcileResult({
        error:
          error instanceof Error
            ? error.message
            : "Failed to reconcile user payments",
      });
    } finally {
      setIsReconciling(false);
    }
  };

  const paymentMethods = Array.from(
    new Set(payments.map((p) => p.paymentMethod).filter(Boolean))
  );

  // Prepare chart data
  const prepareChartData = () => {
    // Status Distribution Data for Pie Chart
    const statusData = [
      {
        name: "Successful",
        value: analytics.successfulPayments,
        color: "#10b981",
      },
      { name: "Pending", value: analytics.pendingPayments, color: "#f59e0b" },
      { name: "Failed", value: analytics.failedPayments, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    // Payment Methods Data for Bar Chart
    const methodsData = paymentMethods.map((method) => {
      const count = payments.filter((p) => p.paymentMethod === method).length;
      const amount = payments
        .filter((p) => p.paymentMethod === method)
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        method: method || "Unknown",
        count,
        amount: Math.round(amount),
      };
    });

    // Monthly Trends Data for Line Chart (last 6 months)
    const monthlyTrends: Array<{
      month: string;
      payments: number;
      successful: number;
      revenue: number;
    }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      const monthPayments = payments.filter((p) => {
        const paymentDate = new Date(p.createdAt);
        return (
          paymentDate.getMonth() === date.getMonth() &&
          paymentDate.getFullYear() === date.getFullYear()
        );
      });

      const successful = monthPayments.filter((p) => p.status === 1);
      const revenue = successful.reduce((sum, p) => sum + p.amount, 0);

      monthlyTrends.push({
        month: monthName,
        payments: monthPayments.length,
        successful: successful.length,
        revenue: Math.round(revenue),
      });
    }

    return { statusData, methodsData, monthlyTrends };
  };

  const chartData = prepareChartData();

  // Chart colors
  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Payments Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Monitor and manage student payments and financial transactions
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" onClick={handleExportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleSyncPendingPayments} disabled={isSyncing}>
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Pending
            </Button>
          </div>
        </div>

        {/* Sync Results */}
        {(syncResult || reconcileResult) && (
          <Card
            className={`${
              syncResult?.error || reconcileResult?.error
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {syncResult?.error || reconcileResult?.error ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {syncResult ? "Sync Results" : "Reconciliation Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {syncResult?.error || reconcileResult?.error ? (
                <p className="text-red-700">
                  {syncResult?.error || reconcileResult?.error}
                </p>
              ) : (
                <div className="space-y-2">
                  {syncResult && (
                    <>
                      <p className="text-green-700 font-medium">
                        {syncResult.message}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Total Checked: {syncResult.total}</div>
                        <div>Updated: {syncResult.updated}</div>
                        <div>
                          Unchanged: {syncResult.total - syncResult.updated}
                        </div>
                      </div>
                    </>
                  )}
                  {reconcileResult && (
                    <>
                      <p className="text-green-700 font-medium">
                        {reconcileResult.message}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Student:</strong>{" "}
                          {reconcileResult.student?.name}(
                          {reconcileResult.student?.email})
                        </div>
                        <div>
                          <strong>New Payments:</strong>{" "}
                          {reconcileResult.reconciledCount}
                        </div>
                      </div>
                      {reconcileResult.reconciliation && (
                        <div className="mt-2 p-3 bg-white rounded border text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              Before:{" "}
                              {reconcileResult.reconciliation.paymentsBefore}{" "}
                              payments
                            </div>
                            <div>
                              After:{" "}
                              {reconcileResult.reconciliation.paymentsAfter}{" "}
                              payments
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSyncResult(null);
                      setReconcileResult(null);
                    }}
                    className="mt-2"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics Overview - Only visible to users with finance overview access */}
      <FinanceOverviewGate>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-green-900">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <p className="text-xs text-green-700">
                +{analytics.revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-900">
                Monthly Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(analytics.monthlyRevenue)}
              </div>
              <p className="text-xs text-blue-700">This month</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-amber-900">
                Pending Payments
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-amber-900">
                {analytics.pendingPayments}
              </div>
              <p className="text-xs text-amber-700">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-900">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-purple-900">
                {analytics.paymentSuccessRate.toFixed(1)}%
              </div>
              <p className="text-xs text-purple-700">Payment success rate</p>
            </CardContent>
          </Card>
        </div>
      </FinanceOverviewGate>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            All Payments
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            Fee Management
          </TabsTrigger>
          <FinanceOverviewGate>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
          </FinanceOverviewGate>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Payments</CardTitle>
              <CardDescription>
                Find and manage payments by student, reference, or status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input - Full width on mobile */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, reference, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters - Stack on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="min-w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="1">Successful</SelectItem>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="2">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={paymentMethodFilter}
                    onValueChange={setPaymentMethodFilter}
                  >
                    <SelectTrigger className="min-w-[140px]">
                      <SelectValue placeholder="Filter by method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      {paymentMethods.map((method) => (
                        <SelectItem key={String(method)} value={String(method)}>
                          {String(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Payments ({allFilteredPayments.length} total)
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <span className="hidden sm:inline">
                      Detailed view of all payment transactions •
                    </span>
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, allFilteredPayments.length)} of{" "}
                    {allFilteredPayments.length}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground hidden sm:inline">
                    Items per page:
                  </span>
                  <span className="text-muted-foreground sm:hidden">
                    Per page:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-16 sm:w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {payment.reference || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.userId || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {payment.userName || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.userEmail || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.description || "Payment"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <Badge
                              variant={getStatusBadgeVariant(payment.status)}
                            >
                              {getStatusText(payment.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paymentMethod || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.createdAt
                              ? new Date(payment.createdAt).toLocaleTimeString()
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewPaymentDetails(payment)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadReceipt(payment)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleReconcileUser(payment.userEmail)
                                }
                                disabled={isReconciling || !payment.userEmail}
                              >
                                <RefreshCw
                                  className={`h-4 w-4 mr-2 ${
                                    isReconciling ? "animate-spin" : ""
                                  }`}
                                />
                                Reconcile User Payments
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(payment.status)}
                          <Badge
                            variant={getStatusBadgeVariant(payment.status)}
                          >
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>
                        <div className="font-medium text-lg">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewPaymentDetails(payment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleReconcileUser(payment.userEmail)
                            }
                            disabled={isReconciling || !payment.userEmail}
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${
                                isReconciling ? "animate-spin" : ""
                              }`}
                            />
                            Reconcile User Payments
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Reference:
                        </span>
                        <div className="font-medium">
                          {payment.reference || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Method:</span>
                        <div className="font-medium">
                          {payment.paymentMethod || "Unknown"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Student:</span>
                        <div className="font-medium">
                          {payment.userName || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.userEmail || "N/A"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-medium">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-4">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                    {/* Mobile: Show fewer buttons */}
                    <div className="flex sm:hidden items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2"
                      >
                        Prev
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(3, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                1,
                                Math.min(totalPages - 2, currentPage - 1)
                              ) + i;
                            if (pageNum > totalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0 text-xs"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2"
                      >
                        Next
                      </Button>
                    </div>

                    {/* Desktop: Show all buttons */}
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                1,
                                Math.min(totalPages - 4, currentPage - 2)
                              ) + i;
                            if (pageNum > totalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <FeeManagement />
        </TabsContent>

        <FinanceOverviewGate>
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Payment Status Distribution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Visual breakdown of payment statuses
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Payment Trends (6 Months)
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Payment volume and revenue trends over time
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-60 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={chartData.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                          }}
                          formatter={(value, name) => [
                            name === "revenue"
                              ? formatCurrency(value as number)
                              : value,
                            name === "revenue"
                              ? "Revenue"
                              : name === "payments"
                              ? "Total Payments"
                              : "Successful",
                          ]}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="payments"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ fill: "#8884d8" }}
                          name="Total Payments"
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="successful"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                          name="Successful"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ fill: "#f59e0b" }}
                          name="Revenue"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Payment Methods Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Breakdown by payment methods showing volume and total amounts
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.methodsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="method"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name) => [
                          name === "amount"
                            ? formatCurrency(value as number)
                            : value,
                          name === "amount"
                            ? "Total Amount"
                            : "Transaction Count",
                        ]}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        fill="#8884d8"
                        name="Transaction Count"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="amount"
                        fill="#10b981"
                        name="Total Amount"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analytics.totalRevenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Revenue
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.paymentSuccessRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analytics.averagePaymentAmount)}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Payment</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {payments.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Payments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </FinanceOverviewGate>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Reports</CardTitle>
              <CardDescription>
                Generate and download payment reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Daily Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Monthly Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Annual Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      <Dialog
        open={isPaymentDetailsOpen}
        onOpenChange={setIsPaymentDetailsOpen}
      >
        <DialogContent size="lg" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected payment transaction
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Status Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedPayment.status)}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getStatusText(selectedPayment.status)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                </div>
              </div>

              {/* Payment Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                    Payment Information
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Reference</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.reference || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.description || "Payment"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.paymentMethod || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.currency || "NGN"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                    Student Information
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.userName || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.userEmail || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">User ID</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPayment.userId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                  Timestamps
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayment.createdAt
                          ? new Date(selectedPayment.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayment.updatedAt
                          ? new Date(selectedPayment.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Details */}
              {selectedPayment.cart &&
                Object.keys(selectedPayment.cart).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                      Cart Items
                    </h4>

                    <div className="space-y-3">
                      {Object.entries(selectedPayment.cart).map(
                        ([itemId, item]) => (
                          <div
                            key={itemId}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-gray-900">
                                {item.name || "Unknown Item"}
                              </h5>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                <span>Qty: {item.quantity}</span>
                                <span>
                                  ₦{(item.unit_price || 0).toLocaleString()}{" "}
                                  each
                                </span>
                                {item.fee_plan && (
                                  <span>Plan: {item.fee_plan}</span>
                                )}
                                {item.fee_from && (
                                  <span>
                                    From:{" "}
                                    {new Date(
                                      item.fee_from
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {item.expiry && (
                                <p className="text-xs text-amber-600 mt-1">
                                  Expires:{" "}
                                  {new Date(item.expiry).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm text-gray-900">
                                ₦
                                {(
                                  item.quantity * (item.unit_price || 0)
                                ).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Subtotal
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Cart Summary */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium text-sm text-blue-900">
                        Total Cart Value
                      </span>
                      <span className="font-bold text-lg text-blue-900">
                        ₦
                        {Object.entries(selectedPayment.cart)
                          .reduce(
                            (total, [_, item]) =>
                              total + item.quantity * (item.unit_price || 0),
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleReconcileUser(selectedPayment.userEmail)}
                  disabled={isReconciling || !selectedPayment.userEmail}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isReconciling ? "animate-spin" : ""
                    }`}
                  />
                  Reconcile User Payments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button onClick={() => setIsPaymentDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PaymentsManagement() {
  return (
    <FinancialGuard>
      <PaymentsManagementContent />
    </FinancialGuard>
  );
}
