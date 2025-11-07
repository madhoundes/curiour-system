"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import Image from "next/image"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock data types
import { type Payment, type Invoice, type PaymentMethod, type TaxDocument } from "./types"

// Real API imports
import { shippingService } from "@/lib/api/shipping"
import { profileService } from "@/lib/api/profile"
import type { BillingRecord, BillingRecordsListResponse, UserProfile } from "@/lib/api/types"
import { toast } from "sonner"

// Mock data (fallback only)
import { mockPayments, mockInvoices, mockTaxDocuments } from "./mock-data"

// Logo utility functions for PDF generation
import { loadLogoForPDF, addLogoToPDF, generatePdfInvoice } from "@/lib/utils"

// Function to generate invoice content for download
const generateInvoiceContent = (invoice: Invoice): string => {
  const invoiceNumber = invoice.id.toUpperCase();
  const issueDate = new Date(invoice.date).toLocaleDateString();
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();
  
  return `INVOICE

Invoice Number: ${invoiceNumber}
Issue Date: ${issueDate}
Due Date: ${dueDate}

BILL TO:
Parcego Business Account
Business Address
City, Province Postal Code
Country

CHARGES:
${invoice.lineItems.map(item => `${item.description}: $${item.amount.toFixed(2)}`).join('\n')}

Total Amount: $${invoice.amount.toFixed(2)} ${invoice.currency}

Status: ${invoice.status.toUpperCase()}

TERMS:
Payment is due within 30 days of invoice date.
Late payments may incur additional charges.

Thank you for choosing Parcego!
For questions, contact support@parcego.com`;
};

// Function to generate tax document content for download
const generateTaxDocumentContent = (doc: TaxDocument): string => {
  const issueDate = new Date(doc.issuedDate).toLocaleDateString();
  
  return `TAX DOCUMENT

Document Type: ${doc.type}
Tax Year: ${doc.year}
Issue Date: ${issueDate}

This document contains important tax information for the ${doc.year} tax year.
Please consult with your tax advisor for proper filing and compliance.

For questions about this document, contact support@parcego.com

Thank you for choosing Parcego!`;
};


// Transformation functions to map API data to local types
const transformBillingRecordToPayment = (billing: BillingRecord): Payment => {
  return {
    id: `pmt-${billing.id}`,
    date: billing.created_at,
    amount: parseFloat(billing.amount),
    currency: billing.currency,
    status: billing.payment_status === 'paid' ? 'paid' : 
            billing.payment_status === 'pending' ? 'pending' :
            billing.payment_status === 'failed' ? 'failed' : 
            billing.payment_status === 'cancelled' ? 'failed' : 'pending',
    method: billing.payment_method || 'Unknown',
    invoiceId: `inv-${billing.id}`,
    downloadUrl: `/api/billing/${billing.id}/receipt`
  }
}

const transformBillingRecordToInvoice = (billing: BillingRecord): Invoice => {
  return {
    id: `inv-${billing.id}`,
    date: billing.created_at,
    dueDate: billing.created_at, // For now, same as created date
    amount: parseFloat(billing.amount),
    currency: billing.currency,
    status: billing.payment_status === 'paid' ? 'paid' : 
            billing.payment_status === 'pending' ? 'due' : 'overdue',
    downloadUrl: `/api/billing/${billing.id}/invoice`,
    lineItems: [
      { description: 'Shipping Service', amount: parseFloat(billing.subtotal) },
      { description: 'Tax', amount: parseFloat(billing.tax_amount) }
    ]
  }
}

export function BillingPage() {
  const [activeTab, setActiveTab] = useState<string>('payment-history')
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [taxDocuments] = useState<TaxDocument[]>(mockTaxDocuments)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile and billing data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch user profile
        const profileData = await profileService.getProfile()
        setUserProfile(profileData)
        
        // Fetch billing records
        const billingResponse = await shippingService.getBillingRecords({
          page: 1,
          per_page: 50
        })
        
        // Transform API data to local types
        const transformedPayments = billingResponse.items.map(transformBillingRecordToPayment)
        const transformedInvoices = billingResponse.items.map(transformBillingRecordToInvoice)
        
        setPayments(transformedPayments)
        setInvoices(transformedInvoices)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data')
        // Fallback to mock data on error
        setPayments(mockPayments)
        setInvoices(mockInvoices)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PageHeader
          title="Billing & Payments"
          description="Manage your billing information and invoices"
        />

        {/* Summary Cards - Hidden */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SummaryCard 
            id="parcego-billing-summary-card-outstanding"
            title="Outstanding Balance" 
            value="$1,247.50" 
            description="Due within 30 days"
          />
          <SummaryCard 
            id="parcego-billing-summary-card-last-payment"
            title="Last Payment" 
            value="$89.99" 
            description="Paid on Jan 15, 2025"
          />
          <SummaryCard 
            id="parcego-billing-summary-card-next-invoice"
            title="Next Invoice" 
            value="$299.99" 
            description="Due on Feb 1, 2025"
          />
          <SummaryCard 
            id="parcego-billing-summary-card-total-paid"
            title="Total Paid YTD" 
            value="$2,147.50" 
            description="Since January 1, 2025"
          />
        </div> */}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} id="parcego-billing-tabs">
          <TabsList
            className="flex w-full h-9 sm:h-10 p-1 bg-gray-100 rounded-lg overflow-x-auto justify-start scrollbar-hide"
            style={{ padding: '1.68rem .75rem' }}
          >
            <TabsTrigger 
              value="payment-history" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Payment History
            </TabsTrigger>
            <TabsTrigger 
              value="invoices" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="tax-documents" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Tax Documents
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 py-1 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-md flex-shrink-0"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment-history" className="mt-6">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span>Loading payment history...</span>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Icon name="AlertCircle" size={24} className="text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="text-sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PaymentHistoryTab payments={payments} />
            )}
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span>Loading invoices...</span>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Icon name="AlertCircle" size={24} className="text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="text-sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <InvoicesTab invoices={invoices} userProfile={userProfile} />
            )}
          </TabsContent>

          <TabsContent value="tax-documents" className="mt-6">
            <TaxDocumentsTab documents={taxDocuments} />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SummaryCard({ id, title, value, description }: { id: string; title: string; value: string; description: string }) {
  return (
    <Card id={id} className="w-full">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-normal text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="text-xl sm:text-2xl font-bold break-words">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 break-words">{description}</p>
      </CardContent>
    </Card>
  )
}

function PaymentHistoryTab({ payments }: { payments: Payment[] }) {
  return (
    <Card id="parcego-billing-table-payments" className="overflow-hidden" style={{ paddingTop: '0px' }}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b pt-6 sm:pt-8 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Icon name="CreditCard" size={20} className="text-blue-600" />
          Payment History
        </CardTitle>
        <CardDescription className="text-sm">View all your past payments and their status</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card Layout */}
        <div className="block sm:hidden">
          {payments.map((payment) => (
            <div
              key={payment.id}
              id={`parcego-billing-mobile-row-${payment.id}`}
              className="border-b border-gray-100 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    ${payment.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-2">
                  <EnhancedPaymentStatusBadge status={payment.status} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaymentMethodIcon type={getPaymentMethodType(payment.method)} />
                  <span className="text-sm text-gray-600 truncate">{payment.method}</span>
                </div>
                <EnhancedPaymentDetailsDialog payment={payment} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 pl-6">Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Method</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow 
                  key={payment.id} 
                  id={`parcego-billing-row-${payment.id}`}
                  className="border-b border-gray-100"
                >
                  <TableCell className="transition-colors duration-200 py-4 pl-6">
                    {new Date(payment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium transition-colors duration-200 py-4">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="transition-all duration-200 py-4">
                    <div className="status-badge">
                      <EnhancedPaymentStatusBadge status={payment.status} />
                    </div>
                  </TableCell>
                  <TableCell className="transition-all duration-200 py-4">
                    <div className="flex items-center gap-3 group">
                      <div className="payment-method-icon">
                        <PaymentMethodIcon type={getPaymentMethodType(payment.method)} />
                      </div>
                      <span className="text-sm transition-colors duration-200">{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="transition-all duration-200 py-4">
                    <div className="flex gap-2">
                      <EnhancedPaymentDetailsDialog payment={payment} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Empty state */}
        {payments.length === 0 && (
          <div className="text-center py-12">
            <Icon name="CreditCard" size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500">Your payment history will appear here once you make your first payment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to determine payment method type from method string
function getPaymentMethodType(method: string): PaymentMethod['type'] {
  if (method.toLowerCase().includes('visa') || method.toLowerCase().includes('mastercard') || method.toLowerCase().includes('••••')) {
    return 'card'
  } else if (method.toLowerCase().includes('ach') || method.toLowerCase().includes('transfer')) {
    return 'ach'
  } else if (method.toLowerCase().includes('paypal')) {
    return 'paypal'
  }
  return 'card' // default fallback
}

// Enhanced status badge with color coding
function EnhancedPaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const variants: Record<Payment["status"], { 
    variant: "default" | "secondary" | "destructive" | "outline"
    label: string
    className: string
  }> = {
    paid: { 
      variant: "default", 
      label: "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    pending: { 
      variant: "secondary", 
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200"
    },
    failed: { 
      variant: "destructive", 
      label: "Failed",
      className: "bg-red-50 text-red-700 border-red-200"
    },
    refunded: { 
      variant: "outline", 
      label: "Refunded",
      className: "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const { variant, label, className } = variants[status]
  return (
    <Badge 
      variant={variant} 
      className={`font-medium border ${className}`}
    >
      {label}
    </Badge>
  )
}

// Enhanced payment details dialog with improved button
function EnhancedPaymentDetailsDialog({ payment }: { payment: Payment }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [isViewHovered, setIsViewHovered] = useState(false)

  const handleDownloadReceipt = async () => {
    setIsDownloading(true)
    
    // Create receipt content
    const receiptContent = `PAYMENT RECEIPT

Transaction ID: ${payment.id}
Date: ${new Date(payment.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
Time: ${new Date(payment.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}

Amount: $${payment.amount.toFixed(2)}
Currency: ${payment.currency || 'USD'}
Status: ${payment.status.toUpperCase()}
Payment Method: ${payment.method}
Invoice ID: ${payment.invoiceId}

Merchant: Parcego Courier Business Platform
Address: 123 Business Street, Suite 100, New York, NY 10001
Email: support@parcego.com

Thank you for your business!

---
Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`

    try {
      // Create and download the file
      const blob = new Blob([receiptContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payment-receipt-${payment.id}.txt`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Show success feedback
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
      
    } catch (error) {
      console.error('Error downloading receipt:', error)
      // Fallback: try to open in new tab with data URL
      try {
        const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(receiptContent)}`
        window.open(dataUrl, '_blank')
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError)
        // Last resort: show content in alert (not ideal but functional)
        alert(`Receipt content:\n\n${receiptContent}`)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
                <Button
          variant="ghost"
          size="sm"
          id={`parcego-payment-view-btn-${payment.id}`}
          onMouseEnter={() => setIsViewHovered(true)}
          onMouseLeave={() => setIsViewHovered(false)}
          className={`flex items-center gap-2 font-semibold text-blue-600 transition-all duration-250 hover:scale-105 hover:text-blue-700 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100/50 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
            isViewHovered ? 'transform translate-y-[-1px]' : ''
          }`}
          aria-label="View payment details"
          title="Click to view payment details"
        >
          <Icon 
            name="Eye" 
            size={16} 
            className={`text-blue-600 transition-all duration-200 ${
              isViewHovered ? 'scale-110' : ''
            }`} 
          />
          <span className="transition-all duration-200">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Transaction #{payment.id}
          </DialogDescription>
        </DialogHeader>
        
        {/* Payment Details Content */}
        <div className="space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                <p className="text-xl font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <div className="mt-1">
                  <EnhancedPaymentStatusBadge status={payment.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Transaction Information</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="text-sm font-medium">{payment.id}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-medium">{formatDate(payment.date)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm font-medium">{formatTime(payment.date)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium">{payment.method}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice ID:</span>
                <span className="text-sm font-medium">{payment.invoiceId}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-sm font-medium">{payment.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          {payment.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <div className="font-medium mb-1">Payment Successful</div>
                  <div>This payment was processed successfully and has been applied to your account.</div>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Clock" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">Payment Pending</div>
                  <div>This payment is currently being processed. It may take 1-3 business days to complete.</div>
                </div>
              </div>
            </div>
          )}

          {payment.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="XCircle" size={20} className="text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <div className="font-medium mb-1">Payment Failed</div>
                  <div>This payment could not be processed. Please contact support for assistance.</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant={downloadSuccess ? "default" : "outline"}
                size="default"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className={`h-10 px-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-offset-2 ${
                  downloadSuccess 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-200 shadow-md shadow-green-200/50' 
                    : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:ring-blue-200 hover:shadow-blue-100/50'
                } ${isDownloading ? 'animate-pulse' : ''}`}
                aria-label={downloadSuccess ? "Receipt downloaded successfully" : "Download payment receipt"}
                title={downloadSuccess ? "Receipt downloaded successfully" : "Download payment receipt as text file"}
              >
                {isDownloading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={16} className="mr-2" />
                    Download Receipt
                  </>
                )}
              </Button>
              <Button 
                variant="default"
                onClick={() => setIsOpen(false)}
                className="h-10 px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InvoicesTab({ invoices, userProfile }: { invoices: Invoice[]; userProfile: UserProfile | null }) {
  return (
    <Card id="parcego-billing-table-invoices">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Invoices</CardTitle>
            <CardDescription className="text-sm">View and download your invoices</CardDescription>
          </div>
          <Button 
            id="parcego-billing-download-all-btn"
            className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-100/50 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            onClick={async () => {
              try {
                // For multiple invoices, we'll create a combined PDF with all line items
                const allLineItems = invoices.flatMap(invoice => 
                  invoice.lineItems.map(item => ({
                    description: `${item.description} (Invoice: ${invoice.id.toUpperCase()})`,
                    quantity: 1,
                    unitPrice: item.amount,
                    amount: item.amount
                  }))
                );

                const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
                const totalSubtotal = totalAmount - (totalAmount * 0.13);
                const totalTax = totalAmount * 0.13;

                await generatePdfInvoice({
                  invoiceNumber: `COMBINED-${new Date().toISOString().split('T')[0]}`,
                  issueDate: new Date().toLocaleDateString(),
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                  billTo: {
                    name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Business Account',
                    company: userProfile?.business_name || 'Your Business',
                    address: userProfile?.street_address || '',
                    city: userProfile?.city || '',
                    province: userProfile?.province || '',
                    postalCode: userProfile?.postal_code || '',
                    country: userProfile?.country || 'Canada'
                  },
                  lineItems: allLineItems,
                  subtotal: totalSubtotal,
                  tax: totalTax,
                  total: totalAmount,
                  currency: 'USD',
                  notes: 'Combined invoice for all billing periods. Payment is due within 30 days. Thank you for your business!'
                });
              } catch (error) {
                console.error('Failed to generate combined PDF invoice:', error);
                alert('Failed to generate invoices. Please try again.');
              }
            }}
          >
            Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card Layout */}
        <div className="block sm:hidden">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              id={`parcego-billing-mobile-invoice-${invoice.id}`}
              className="border-b border-gray-100 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-2">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Issued: {new Date(invoice.date).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <InvoiceDetailsDialog invoice={invoice} userProfile={userProfile} />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={async () => {
                        try {
                          await generatePdfInvoice({
                            invoiceNumber: invoice.id.toUpperCase(),
                            issueDate: new Date(invoice.date).toLocaleDateString(),
                            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                            billTo: {
                              name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Business Account',
                              company: userProfile?.business_name || 'Your Business',
                              address: userProfile?.street_address || '',
                              city: userProfile?.city || '',
                              province: userProfile?.province || '',
                              postalCode: userProfile?.postal_code || '',
                              country: userProfile?.country || 'Canada'
                            },
                            lineItems: invoice.lineItems.map(item => ({
                              description: item.description,
                              quantity: 1,
                              unitPrice: item.amount,
                              amount: item.amount
                            })),
                            subtotal: invoice.amount - (invoice.amount * 0.13),
                            tax: invoice.amount * 0.13,
                            total: invoice.amount,
                            currency: invoice.currency,
                            status: invoice.status,
                            notes: 'Payment is due within 30 days. Thank you for your business!'
                          });
                        } catch (error) {
                          console.error('Failed to generate PDF invoice:', error);
                          alert('Failed to generate invoice. Please try again.');
                        }
                      }}
                      id={`parcego-download-invoice-${invoice.id}-btn`}
                      className="transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-gray-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:ring-offset-1"
                      aria-label={`Download invoice ${invoice.id}`}
                      title={`Download invoice ${invoice.id} as text file`}
                    >
                      <Icon name="Download" size={14} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} id={`parcego-billing-row-${invoice.id}`}>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-3">
                          <InvoiceDetailsDialog invoice={invoice} userProfile={userProfile} />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              try {
                                await generatePdfInvoice({
                                  invoiceNumber: invoice.id.toUpperCase(),
                                  issueDate: new Date(invoice.date).toLocaleDateString(),
                                  dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                                  billTo: {
                                    name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Business Account',
                                    company: userProfile?.business_name || 'Your Business',
                                    address: userProfile?.street_address || '',
                                    city: userProfile?.city || '',
                                    province: userProfile?.province || '',
                                    postalCode: userProfile?.postal_code || '',
                                    country: userProfile?.country || 'Canada'
                                  },
                                  lineItems: invoice.lineItems.map(item => ({
                                    description: item.description,
                                    quantity: 1,
                                    unitPrice: item.amount,
                                    amount: item.amount
                                  })),
                                  subtotal: invoice.amount - (invoice.amount * 0.13),
                                  tax: invoice.amount * 0.13,
                                  total: invoice.amount,
                                  currency: invoice.currency,
                                  status: invoice.status,
                                  notes: 'Payment is due within 30 days. Thank you for your business!'
                                });
                              } catch (error) {
                                console.error('Failed to generate PDF invoice:', error);
                                alert('Failed to generate invoice. Please try again.');
                              }
                            }}
                            id={`parcego-download-invoice-${invoice.id}-btn`}
                            className="ml-2 transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-gray-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:ring-offset-1"
                            aria-label={`Download invoice ${invoice.id}`}
                            title={`Download invoice ${invoice.id} as text file`}
                          >
                            <Icon name="Download" size={14} className="mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )
    }

function TaxDocumentsTab({ documents }: { documents: TaxDocument[] }) {
  return (
    <Card id="parcego-billing-tax-documents">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Tax Documents</CardTitle>
        <CardDescription className="text-sm">Access your tax documents and forms</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              id={`parcego-billing-doc-${doc.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{doc.type} - {doc.year}</div>
                <div className="text-sm text-muted-foreground">
                  Issued on {new Date(doc.issuedDate).toLocaleDateString()}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  alert('Tax document download is not available. Please contact support.');
                }}
                id={`parcego-download-tax-doc-${doc.id}-btn`}
                className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 text-sm"
                aria-label={`Download ${doc.type} tax document for ${doc.year}`}
                title={`Download ${doc.type} tax document for ${doc.year} as text file`}
              >
                <Icon name="Download" size={14} className="mr-1" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Billing contact form data types
type BillingContactFormData = {
  email: string
}

type BillingAddressFormData = {
  line1: string
  line2?: string
  country: string
  province: string
  city: string
  postalCode: string
}

function PreferencesTab() {
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [billingEmail, setBillingEmail] = useState('billing@example.com')
  const [billingAddress, setBillingAddress] = useState<BillingAddressFormData>({
    line1: '123 Business St',
    line2: 'Suite 100',
    country: 'Canada',
    province: 'Ontario',
    city: 'Toronto',
    postalCode: 'M5V 3A8'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const profile = await profileService.getProfile()
        
        // Set billing email (use profile email as billing email)
        setBillingEmail(profile.email || '')
        
        // Set billing address from profile
        setBillingAddress({
          line1: profile.street_address || '',
          line2: profile.street_address_2 || '',
          country: profile.country || 'Canada',
          province: profile.province || '',
          city: profile.city || '',
          postalCode: profile.postal_code || ''
        })
      } catch (error) {
        console.error('Failed to load profile:', error)
        toast.error('Failed to load billing information')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  // Address edit form
  const addressForm = useForm<BillingAddressFormData>({
    mode: 'onChange',
    defaultValues: billingAddress
  })

  // Update form when billing address changes
  useEffect(() => {
    addressForm.reset(billingAddress)
  }, [billingAddress, addressForm])

  const handleAddressEdit = () => {
    addressForm.reset(billingAddress)
    setIsEditingAddress(true)
  }

  const handleAddressSave = async (data: BillingAddressFormData) => {
    try {
      // Update profile address via API
      await profileService.updateProfile({
        street_address: data.line1,
        street_address_2: data.line2 || undefined,
        city: data.city,
        province: data.province,
        postal_code: data.postalCode,
        country: data.country
      })
      setBillingAddress(data)
      setIsEditingAddress(false)
      toast.success('Billing address updated successfully')
    } catch (error: any) {
      console.error('Failed to update address:', error)
      toast.error(error.message || 'Failed to update billing address')
    }
  }

  const handleAddressCancel = () => {
    addressForm.reset(billingAddress)
    setIsEditingAddress(false)
  }

  return (
    <Card id="parcego-billing-preferences">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Billing Preferences</CardTitle>
        <CardDescription className="text-sm">Manage your billing contact and address information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">Loading billing information...</span>
          </div>
        ) : (
          <>
        <div>
          <h3 className="text-lg font-medium mb-4">Billing Contact</h3>
          <div className="space-y-2">
            {/* Email Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="font-medium mb-2">Email</div>
                <div className="text-sm text-muted-foreground">{billingEmail || 'Not set'}</div>
                <p className="text-xs text-gray-500 mt-1">Billing email matches your account email. To change it, please update your email in Account Profile settings.</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Address Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <div className="font-medium mb-2">Billing Address</div>
                {isEditingAddress ? (
                  <form onSubmit={addressForm.handleSubmit(handleAddressSave)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 max-w-md w-full">
                      <Controller
                        name="line1"
                        control={addressForm.control}
                        rules={{ required: 'Address line 1 is required' }}
                        render={({ field, fieldState }) => (
                          <div>
                            <Label htmlFor="parcego-billing-address-line1" className="text-sm font-medium text-gray-700">
                              Address Line 1
                            </Label>
                            <Input
                              {...field}
                              id="parcego-billing-address-line1"
                              placeholder="123 Main Street"
                              className={`h-9 mt-1 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                              aria-invalid={!!fieldState.error}
                            />
                            {fieldState.error && (
                              <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                      
                      <Controller
                        name="line2"
                        control={addressForm.control}
                        render={({ field }) => (
                          <div>
                            <Label htmlFor="parcego-billing-address-line2" className="text-sm font-medium text-gray-700">
                              Address Line 2 (Optional)
                            </Label>
                            <Input
                              {...field}
                              id="parcego-billing-address-line2"
                              placeholder="Apt, Suite, Unit, etc."
                              className="h-9 mt-1"
                            />
                          </div>
                        )}
                      />
                      
                      <Controller
                        name="country"
                        control={addressForm.control}
                        rules={{ required: 'Country is required' }}
                        render={({ field, fieldState }) => (
                          <div>
                            <Label htmlFor="parcego-billing-address-country" className="text-sm font-medium text-gray-700">
                              Country
                            </Label>
                            <Select value={field.value} onValueChange={field.onChange} disabled>
                              <SelectTrigger 
                                id="parcego-billing-address-country"
                                className={`h-9 mt-1 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                              >
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Canada">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                            {fieldState.error && (
                              <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Controller
                          name="city"
                          control={addressForm.control}
                          rules={{ required: 'City is required' }}
                          render={({ field, fieldState }) => (
                            <div>
                              <Label htmlFor="parcego-billing-address-city" className="text-sm font-medium text-gray-700">
                                City
                              </Label>
                              <Input
                                {...field}
                                id="parcego-billing-address-city"
                                placeholder="Toronto"
                                className={`h-9 mt-1 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                                aria-invalid={!!fieldState.error}
                              />
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                              )}
                            </div>
                          )}
                        />
                        
                        <Controller
                          name="province"
                          control={addressForm.control}
                          rules={{ required: 'Province is required' }}
                          render={({ field, fieldState }) => (
                            <div>
                              <Label htmlFor="parcego-billing-address-province" className="text-sm font-medium text-gray-700">
                                Province
                              </Label>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger 
                                  id="parcego-billing-address-province"
                                  className={`h-9 mt-1 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                                >
                                  <SelectValue placeholder="Select province" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Alberta">Alberta</SelectItem>
                                  <SelectItem value="British Columbia">British Columbia</SelectItem>
                                  <SelectItem value="Manitoba">Manitoba</SelectItem>
                                  <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                                  <SelectItem value="Newfoundland and Labrador">Newfoundland and Labrador</SelectItem>
                                  <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                                  <SelectItem value="Ontario">Ontario</SelectItem>
                                  <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                                  <SelectItem value="Quebec">Quebec</SelectItem>
                                  <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                                  <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                                  <SelectItem value="Nunavut">Nunavut</SelectItem>
                                  <SelectItem value="Yukon">Yukon</SelectItem>
                                </SelectContent>
                              </Select>
                              {fieldState.error && (
                                <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      
                      <Controller
                        name="postalCode"
                        control={addressForm.control}
                        rules={{ 
                          required: 'Postal code is required',
                          pattern: {
                            value: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
                            message: 'Invalid Canadian postal code format'
                          }
                        }}
                        render={({ field, fieldState }) => (
                          <div>
                            <Label htmlFor="parcego-billing-address-postal" className="text-sm font-medium text-gray-700">
                              Postal Code
                            </Label>
                            <Input
                              {...field}
                              id="parcego-billing-address-postal"
                              placeholder="M5V 3A8"
                              className={`h-9 mt-1 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                              aria-invalid={!!fieldState.error}
                            />
                            {fieldState.error && (
                              <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={addressForm.formState.isSubmitting || !addressForm.formState.isValid}
                        id="parcego-billing-address-save-btn"
                        className="h-8 px-3 transition-all duration-200 w-full sm:w-auto"
                      >
                        {addressForm.formState.isSubmitting ? (
                          <>
                            <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon name="Check" size={14} className="mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddressCancel}
                        disabled={addressForm.formState.isSubmitting}
                        id="parcego-billing-address-cancel-btn"
                        className="h-8 px-3 transition-all duration-200 w-full sm:w-auto"
                      >
                        <Icon name="X" size={14} className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {billingAddress.line1}<br />
                    {billingAddress.line2 && <>{billingAddress.line2}<br /></>}
                    {billingAddress.city}, {billingAddress.province} {billingAddress.postalCode}<br />
                    {billingAddress.country}
                  </div>
                )}
              </div>
              {!isEditingAddress && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAddressEdit}
                  id="parcego-billing-address-edit-btn"
                  className="flex-shrink-0 transition-all duration-200 hover:bg-gray-50 w-full sm:w-auto"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  )
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const variants: Record<Invoice["status"], { variant: "default" | "secondary" | "destructive"; label: string }> = {
    paid: { variant: "default", label: "Paid" },
    due: { variant: "secondary", label: "Due" },
    overdue: { variant: "destructive", label: "Overdue" }
  }

  const { variant, label } = variants[status]
  return <Badge variant={variant}>{label}</Badge>
}

function PaymentMethodIcon({ type }: { type: PaymentMethod["type"] }) {
  const iconSize = 28; // Increased from 20 to 28 for better visibility
  
  switch (type) {
    case 'card':
      return (
        <div className="flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor"/>
            <path d="M2 10H22" fill="white" fillOpacity="0.3"/>
            <circle cx="6" cy="12" r="1" fill="white"/>
            <circle cx="9" cy="12" r="1" fill="white"/>
          </svg>
        </div>
      );
    
    case 'ach':
      return (
        <div className="flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-600"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" fill="currentColor" fillOpacity="0.7"/>
            <path d="M2 12L12 17L22 12" fill="currentColor" fillOpacity="0.5"/>
          </svg>
        </div>
      );
    
    case 'paypal':
      return (
        <div className="flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            <circle cx="24" cy="24" r="20" fill="currentColor"/>
            <path d="M32.3305 18.0977C32.3082 18.24 32.2828 18.3856 32.2542 18.5351C31.2704 23.5861 27.9046 25.331 23.606 25.331H21.4173C20.8916 25.331 20.4486 25.7127 20.3667 26.2313L19.2461 33.3381L18.9288 35.3527C18.8755 35.693 19.1379 36 19.4815 36H23.3634C23.8231 36 24.2136 35.666 24.286 35.2127L24.3241 35.0154L25.055 30.3772L25.1019 30.1227C25.1735 29.6678 25.5648 29.3338 26.0245 29.3338H26.6051C30.3661 29.3338 33.3103 27.8068 34.1708 23.388C34.5303 21.5421 34.3442 20.0008 33.393 18.9168C33.1051 18.59 32.748 18.3188 32.3305 18.0977Z" fill="white" fillOpacity="0.9"/>
            <path d="M31.3009 17.6871C31.1506 17.6434 30.9955 17.6036 30.8364 17.5678C30.6766 17.5328 30.5127 17.5018 30.3441 17.4748C29.754 17.3793 29.1074 17.334 28.4147 17.334H22.5676C22.4237 17.334 22.2869 17.3666 22.1644 17.4254C21.8948 17.5551 21.6944 17.8104 21.6459 18.1229L20.402 26.0013L20.3662 26.2311C20.4481 25.7126 20.8911 25.3308 21.4168 25.3308H23.6055C27.9041 25.3308 31.2699 23.5851 32.2537 18.5349C32.2831 18.3854 32.3078 18.2398 32.33 18.0975C32.0811 17.9655 31.8115 17.8525 31.5212 17.7563C31.4496 17.7324 31.3757 17.7094 31.3009 17.6871Z" fill="white" fillOpacity="0.8"/>
            <path d="M21.6461 18.1231C21.6946 17.8105 21.895 17.5552 22.1646 17.4264C22.2879 17.3675 22.4239 17.3349 22.5678 17.3349H28.4149C29.1077 17.3349 29.7542 17.3803 30.3444 17.4757C30.513 17.5027 30.6768 17.5338 30.8367 17.5687C30.9957 17.6045 31.1508 17.6443 31.3011 17.688C31.3759 17.7103 31.4498 17.7334 31.5222 17.7564C31.8125 17.8527 32.0821 17.9664 32.331 17.0976C32.6237 16.231 32.3287 14.9601 31.3194 13.8093C30.2068 12.5424 28.1986 12 25.629 12H18.169C17.6441 12 17.1963 12.3817 17.1152 12.9011L14.0079 32.5969C13.9467 32.9866 14.2473 33.3381 14.6402 33.3381H19.2458L20.4022 26.0014L21.6461 18.1231Z" fill="white"/>
          </svg>
        </div>
      );
    
    default:
      return (
        <div className="flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      );
  }
}

function InvoiceDetailsDialog({ invoice, userProfile }: { invoice: Invoice; userProfile: UserProfile | null }) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isViewHovered, setIsViewHovered] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    // Use setTimeout to ensure state update before print
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'p' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handlePrint()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }

  const handleDownloadPDF = async () => {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    
    // Create PDF document
    const doc = new jsPDF('p', 'pt', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 40
    let yPosition = margin

    // Define proper types for jsPDF text options
    interface TextOptions {
      align?: 'left' | 'center' | 'right'
      angle?: number
    }

    // Helper function for adding text
    const addText = (text: string, x: number, y: number, options?: TextOptions) => {
      doc.text(text, x, y, options)
      return y
    }

    // Load and add company logo
    const logoData = await loadLogoForPDF();
    // Master logo aspect ratio: 149/92 ≈ 1.62:1
    // Use appropriate width and calculate height to maintain aspect ratio
    const logoWidth = 60;
    const logoHeight = logoWidth / 1.62; // Maintain aspect ratio (~37)
    addLogoToPDF(doc, margin, yPosition, logoWidth, logoHeight, logoData);

    // Company info - positioned to the right of logo with proper spacing
    const logoRightEdge = margin + logoWidth + 10; // 10pt spacing after logo
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    yPosition = addText('Parcego', logoRightEdge, yPosition + 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition = addText('Courier Business Platform', logoRightEdge, yPosition + 5)
    
    // Company address
    doc.setFontSize(9)
    yPosition = addText('123 Business Street', logoRightEdge, yPosition + 10)
    yPosition = addText('Suite 100', logoRightEdge, yPosition + 5)
    yPosition = addText('New York, NY 10001', logoRightEdge, yPosition + 5)
    yPosition = addText('support@parcego.com', logoRightEdge, yPosition + 5)

    // Invoice title and details (right side)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', pageWidth - margin, margin + 15, { align: 'right' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const invoiceNumber = invoice.id.toLowerCase().startsWith('inv-') ? invoice.id.toUpperCase() : `INV-${invoice.id.toUpperCase()}`;
    doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - margin, margin + 25, { align: 'right' })
    doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, margin + 30, { align: 'right' })
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageWidth - margin, margin + 35, { align: 'right' })
    doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - margin, margin + 40, { align: 'right' })

    // Ensure proper spacing before "Bill To" section
    // Add spacing after company info, ensuring it's below the logo if logo is taller
    const minYPosition = margin + logoHeight + 10; // Ensure we're below the logo
    yPosition = Math.max(yPosition + 15, minYPosition)

    // Bill To section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    yPosition = addText('Bill To:', margin, yPosition + 15)
    
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPosition + 5, pageWidth - 2 * margin, 30, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition = addText('Acme Business Solutions', margin + 5, yPosition + 12)
    yPosition = addText('John Smith, CEO', margin + 5, yPosition + 5)
    yPosition = addText('456 Commerce Ave', margin + 5, yPosition + 5)
    yPosition = addText('Business District, CA 90210', margin + 5, yPosition + 5)
    yPosition = addText('john.smith@acme.com', margin + 5, yPosition + 5)

    yPosition = yPosition + 15

    // Services table
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    yPosition = addText('Services', margin, yPosition + 10)
    
    // Table header
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, yPosition + 5, pageWidth - 2 * margin, 10, 'F')
    doc.setFontSize(10)
    yPosition = addText('Description', margin + 5, yPosition + 10)
    doc.text('Amount', pageWidth - margin - 5, yPosition, { align: 'right' })

    // Table rows
    doc.setFont('helvetica', 'normal')
    invoice.lineItems.forEach((item) => {
      yPosition = yPosition + 8
      doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3)
      doc.text(item.description, margin + 5, yPosition)
      doc.text(formatCurrency(item.amount), pageWidth - margin - 5, yPosition, { align: 'right' })
    })

    // Totals
    yPosition = yPosition + 15
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', pageWidth - margin - 50, yPosition)
    doc.text(formatCurrency(invoice.amount), pageWidth - margin - 5, yPosition, { align: 'right' })
    
    yPosition = yPosition + 6
    doc.text('Tax (0%):', pageWidth - margin - 50, yPosition)
    doc.text(formatCurrency(0), pageWidth - margin - 5, yPosition, { align: 'right' })
    
    yPosition = yPosition + 6
    doc.line(pageWidth - margin - 60, yPosition - 3, pageWidth - margin, yPosition - 3)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    yPosition = yPosition + 6
    doc.text('Total:', pageWidth - margin - 50, yPosition)
    doc.text(formatCurrency(invoice.amount), pageWidth - margin - 5, yPosition, { align: 'right' })

    // Footer
    const footerY = pageHeight - 40
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10)
    
    doc.text('Payment Terms: Net 30 days. Please include invoice number with payment.', margin, footerY)
    doc.text('Payment Methods: Credit/Debit Card via Stripe', margin, footerY + 5)
    
    doc.setFontSize(8)
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 15, { align: 'center' })
    doc.text('Questions? Contact us at support@parcego.com', pageWidth / 2, footerY + 20, { align: 'center' })

    // Add watermark for status
    if (invoice.status !== 'paid') {
      doc.setFontSize(60)
      doc.setTextColor(200, 200, 200)
      doc.text(invoice.status.toUpperCase(), pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
      })
    }

    // Save the PDF
    doc.save(`invoice-${invoice.id}.pdf`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
                <Button
          variant="ghost"
          size="sm"
          id={`parcego-invoice-view-btn-${invoice.id}`}
          onMouseEnter={() => setIsViewHovered(true)}
          onMouseLeave={() => setIsViewHovered(false)}
          className={`flex items-center gap-2 font-semibold text-blue-600 transition-all duration-250 hover:scale-105 hover:text-blue-700 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100/50 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
            isViewHovered ? 'transform translate-y-[-1px]' : ''
          }`}
          aria-label="View invoice details"
          title="Click to view invoice details"
        >
          <Icon 
            name="Eye" 
            size={16} 
            className={`text-blue-600 transition-all duration-200 ${
              isViewHovered ? 'scale-110' : ''
            }`} 
          />
          <span className="transition-all duration-200">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-[85vw] !max-w-[1200px] sm:!max-w-[1200px] md:!max-w-[1200px] lg:!max-w-[1200px] xl:!max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-lg bg-white">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Invoice #{invoice.id} - {formatDate(invoice.date)}
            <span className="block text-xs text-gray-500 mt-1">
              💡 Tip: Press Ctrl+P (or Cmd+P on Mac) to print
            </span>
          </DialogDescription>
        </DialogHeader>
        
        {/* Invoice Preview Content */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 flex-wrap">
            <Button 
              variant="outline" 
              size="default"
              onClick={handleDownloadPDF}
              className="h-10 px-4 shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-100/50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
              aria-label="Download invoice as PDF"
              title="Download invoice as PDF file"
            >
              <Icon name="Download" size={16} className="mr-2 transition-all duration-200 shrink-0" />
              <span className="whitespace-nowrap">Download PDF</span>
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
              id="parcego-invoice-print-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 shrink-0"
              size="default"
              aria-label="Print invoice"
            >
              {isPrinting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin shrink-0" />
                  <span className="whitespace-nowrap">Preparing...</span>
                </>
              ) : (
                <>
                  <Icon name="Printer" size={16} className="mr-2 shrink-0" />
                  <span className="whitespace-nowrap">Print Invoice</span>
                </>
              )}
            </Button>
          </div>

          {/* Invoice Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-center min-w-0">
              <div className="text-xl font-bold text-gray-900 break-words">{formatCurrency(invoice.amount)}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center min-w-0">
              <div className="text-lg font-semibold text-gray-900">{invoice.lineItems.length}</div>
              <div className="text-sm text-gray-600">Line Items</div>
            </div>
            <div className="text-center min-w-0">
              <div className="text-base sm:text-lg font-semibold text-gray-900 break-words">{formatDate(invoice.date)}</div>
              <div className="text-sm text-gray-600">Invoice Date</div>
            </div>
            <div className="text-center min-w-0">
              <div className="text-base sm:text-lg font-semibold text-gray-900 break-words">{formatDate(invoice.dueDate)}</div>
              <div className="text-sm text-gray-600">Due Date</div>
            </div>
          </div>

          {/* Invoice Content - Print Friendly */}
          <div className="border rounded-lg p-4 sm:p-6 lg:p-8 bg-white relative overflow-hidden" id="parcego-invoice-content">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <div className="text-8xl font-bold text-gray-300 transform -rotate-45">
                {invoice.status === 'paid' ? 'PAID' : invoice.status === 'overdue' ? 'OVERDUE' : 'DUE'}
              </div>
            </div>
            
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start gap-6 mb-8 relative z-10">
              <div className="flex-1 min-w-0 max-w-full xl:max-w-[50%]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="/Logo/Logo-icon-only.svg" 
                      alt="Parcego Logo" 
                      width={32}
                      height={32}
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-gray-900 -mt-4 truncate">Parcego</h1>
                    <p className="text-gray-600 truncate">Courier Business Platform</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div>123 Business Street</div>
                  <div>Suite 100</div>
                  <div>New York, NY 10001</div>
                  <div className="break-all">support@parcego.com</div>
                </div>
              </div>
              
              <div className="text-left xl:text-right flex-shrink-0 xl:ml-8 w-full xl:w-auto min-w-0">
                <div className="text-xl font-bold text-gray-900 mb-2">INVOICE</div>
                <div className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-1 xl:flex-nowrap xl:justify-end">
                    <span className="font-medium shrink-0">Invoice #:</span> 
                    <span className="break-words">{invoice.id.toLowerCase().startsWith('inv-') ? invoice.id.toUpperCase() : `INV-${invoice.id.toUpperCase()}`}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 xl:flex-nowrap xl:justify-end">
                    <span className="font-medium shrink-0">Date:</span> 
                    <span className="whitespace-nowrap">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 xl:flex-nowrap xl:justify-end">
                    <span className="font-medium shrink-0">Due Date:</span> 
                    <span className="whitespace-nowrap">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 xl:justify-end flex-wrap">
                    <span className="font-medium shrink-0">Status:</span> 
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8 relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 lg:p-6 rounded-lg">
                <div className="font-medium break-words">{userProfile?.business_name || 'Business Account'}</div>
                <div className="text-gray-600 break-words">{userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Account Holder'}</div>
                {userProfile?.street_address && <div className="text-gray-600 break-words">{userProfile.street_address}</div>}
                {(userProfile?.city || userProfile?.province || userProfile?.postal_code) && (
                  <div className="text-gray-600 break-words">
                    {[userProfile?.city, userProfile?.province, userProfile?.postal_code].filter(Boolean).join(', ')}
                  </div>
                )}
                {userProfile?.email && <div className="text-gray-600 break-all">{userProfile.email}</div>}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8 relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Services</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end relative z-10">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (0%):</span>
                  <span className="text-gray-900">{formatCurrency(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                  <p>Net 30 days. Please include invoice number with payment.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
                  <p>Credit/Debit Card via Stripe</p>
                </div>
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-1 break-words">Questions? Contact us at support@parcego.com</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
