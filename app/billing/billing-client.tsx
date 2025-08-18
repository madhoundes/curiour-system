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

// Mock data
import { mockPayments, mockInvoices, mockPaymentMethods, mockTaxDocuments } from "./mock-data"

// Logo utility functions for PDF generation
import { loadLogoForPDF, addLogoToPDF } from "@/lib/utils"

// Mock payment form data for testing
const mockPaymentData: Record<PaymentMethod['type'], Partial<PaymentFormData>> = {
  card: {
    cardNumber: '4242 4242 4242 4242',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123',
    cardholderName: 'John Doe (Test)'
  },
  ach: {
    routingNumber: '110000000',
    accountNumber: '000123456789',
    accountType: 'checking' as const
  },
  paypal: {
    email: 'test@example.com'
  }
}

// Form validation schema
type PaymentFormData = {
  cardNumber?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  cardholderName?: string
  routingNumber?: string
  accountNumber?: string
  accountType: 'checking' | 'savings'
  email?: string
}

// Temporary storage for payment methods (frontend only)
const tempPaymentStorage: PaymentMethod[] = [...mockPaymentMethods]

export function BillingPage() {
  const [activeTab, setActiveTab] = useState<string>('payment-history')
  const [payments] = useState<Payment[]>(mockPayments)
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(tempPaymentStorage)
  const [taxDocuments] = useState<TaxDocument[]>(mockTaxDocuments)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 id="parcego-billing-header-title" className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Payments
          </h1>
          <p className="text-gray-600">Manage your billing information, payment methods, and invoices</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} id="parcego-billing-tabs">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="tax-documents">Tax Documents</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="payment-history" className="mt-6">
            <PaymentHistoryTab payments={payments} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <InvoicesTab invoices={invoices} />
          </TabsContent>

          <TabsContent value="payment-methods" className="mt-6">
            <PaymentMethodsTab 
              methods={paymentMethods} 
              onMethodAdded={(newMethod) => {
                setPaymentMethods((prev: PaymentMethod[]) => [...prev, newMethod])
              }}
            />
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
    <Card id={id}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function PaymentHistoryTab({ payments }: { payments: Payment[] }) {
  return (
    <Card id="parcego-billing-table-payments" className="overflow-hidden" style={{ paddingTop: '0px' }}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b pt-8">
        <CardTitle className="flex items-center gap-2">
          <Icon name="CreditCard" size={20} className="text-blue-600" />
          Payment History
        </CardTitle>
        <CardDescription>View all your past payments and their status</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
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
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
    },
    pending: { 
      variant: "secondary", 
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
    },
    failed: { 
      variant: "destructive", 
      label: "Failed",
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300"
    },
    refunded: { 
      variant: "outline", 
      label: "Refunded",
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
    }
  }

  const { variant, label, className } = variants[status]
  return (
    <Badge 
      variant={variant} 
      className={`font-medium border ${className} transition-all duration-200`}
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          id={`parcego-payment-view-btn-${payment.id}`}
          className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
        >
          <Icon name="Eye" size={16} className="text-blue-600" />
          <span>View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Transaction #{payment.id}
          </DialogDescription>
        </DialogHeader>
        
        {/* Payment Details Content */}
        <div className="space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                <p className="text-2xl font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
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
            <div className="border rounded-lg p-4 space-y-3">
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
                className={`h-10 px-4 transition-all duration-200 ${
                  downloadSuccess ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
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

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card id="parcego-billing-table-invoices">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </div>
          <Button id="parcego-billing-download-all-btn">Download All</Button>
        </div>
      </CardHeader>
      <CardContent>
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
                  <div className="flex gap-2">
                    <InvoiceDetailsDialog invoice={invoice} />
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.downloadUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Add Payment Method Dialog Component
function AddPaymentMethodDialog({ 
  isOpen, 
  onClose,
  onMethodAdded
}: { 
  isOpen: boolean
  onClose: () => void 
  onMethodAdded: (method: PaymentMethod) => void
}) {
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethod['type']>('card')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { 
    control, 
    handleSubmit, 
    reset, 
    watch, 
    formState: { errors }
  } = useForm<PaymentFormData>({
    mode: 'onChange',
    defaultValues: mockPaymentData[paymentMethodType]
  })

  // Watch form values for validation
  const watchedValues = watch()

  // Update form when payment method type changes
  useEffect(() => {
    if (isOpen) {
      const mockData = mockPaymentData[paymentMethodType]
      reset(mockData)
    }
  }, [paymentMethodType, isOpen, reset])

  const handleSubmitForm = async (data: PaymentFormData) => {
    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create mock payment method
      const newMethod: PaymentMethod = {
        id: `pm-${Date.now()}`,
        type: paymentMethodType,
        label: generatePaymentMethodLabel(paymentMethodType, data),
        isDefault: false,
        expiry: paymentMethodType === 'card' ? `${data.expiryMonth}/${data.expiryYear}` : undefined
      }

      // Add to temporary storage
      tempPaymentStorage.push(newMethod)
      
      // Call parent callback
      onMethodAdded(newMethod)
      
      console.log('Adding payment method:', { type: paymentMethodType, ...data })
      
      // Show success message and close dialog
      onClose()
      
      // Reset form to mock data
      reset(mockPaymentData[paymentMethodType])
      
    } catch (error) {
      console.error('Error adding payment method:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetToMock = () => {
    const mockData = mockPaymentData[paymentMethodType]
    reset(mockData)
  }

  const generatePaymentMethodLabel = (type: PaymentMethod['type'], data: PaymentFormData): string => {
    switch (type) {
      case 'card':
        return `Visa •••• ${data.cardNumber?.slice(-4) || '4242'}`
      case 'ach':
        return `Business ${data.accountType} •••• ${data.accountNumber?.slice(-4) || '6789'}`
      case 'paypal':
        return `PayPal - ${data.email || 'test@example.com'}`
      default:
        return 'Unknown Payment Method'
    }
  }

  const validateForm = () => {
    if (paymentMethodType === 'card') {
      return watchedValues.cardNumber && watchedValues.expiryMonth && watchedValues.expiryYear && 
             watchedValues.cvv && watchedValues.cardholderName
    } else if (paymentMethodType === 'ach') {
      return watchedValues.routingNumber && watchedValues.accountNumber && watchedValues.accountType
    } else if (paymentMethodType === 'paypal') {
      return watchedValues.email
    }
    return false
  }

  const isFormValid = validateForm()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Securely add a new payment method to your account. Your information is encrypted and secure.
          </DialogDescription>
        </DialogHeader>

        {/* Test Data Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">🧪 Test Mode - Mock Data Pre-filled</div>
              <div>
                This form is pre-filled with test data for development purposes. 
                All data is stored temporarily in frontend state only.
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          {/* Payment Method Type Selection */}
          <div className="space-y-3">
            <div className="pt-3">
              <Label htmlFor="parcego-payment-method-type">Payment Method Type</Label>
            </div>
            <Select 
              value={paymentMethodType} 
              onValueChange={(value: PaymentMethod['type']) => setPaymentMethodType(value)}
            >
              <SelectTrigger id="parcego-payment-method-type">
                <SelectValue placeholder="Select payment method type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="ach">Bank Account (ACH)</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Credit Card Form */}
          {paymentMethodType === 'card' && (
            <div className="space-y-4">
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-card-number">Card Number</Label>
                </div>
                <Controller
                  name="cardNumber"
                  control={control}
                  rules={{ required: 'Card number is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="parcego-card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="font-mono"
                    />
                  )}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.cardNumber.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="pt-3">
                    <Label htmlFor="parcego-expiry-month">Month</Label>
                  </div>
                  <Controller
                    name="expiryMonth"
                    control={control}
                    rules={{ required: 'Month is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="parcego-expiry-month">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = String(i + 1).padStart(2, '0')
                            return (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.expiryMonth && (
                    <p className="text-sm text-red-600 mt-1">{errors.expiryMonth.message}</p>
                  )}
                </div>
                
                <div>
                  <div className="pt-3">
                    <Label htmlFor="parcego-expiry-year">Year</Label>
                  </div>
                  <Controller
                    name="expiryYear"
                    control={control}
                    rules={{ required: 'Year is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="parcego-expiry-year">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = String(new Date().getFullYear() + i).slice(-2)
                            return (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.expiryYear && (
                    <p className="text-sm text-red-600 mt-1">{errors.expiryYear.message}</p>
                  )}
                </div>
                
                <div>
                  <div className="pt-3">
                    <Label htmlFor="parcego-cvv">CVV</Label>
                  </div>
                  <Controller
                    name="cvv"
                    control={control}
                    rules={{ required: 'CVV is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="parcego-cvv"
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        className="font-mono"
                      />
                    )}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-600 mt-1">{errors.cvv.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-cardholder-name">Cardholder Name</Label>
                </div>
                <Controller
                  name="cardholderName"
                  control={control}
                  rules={{ required: 'Cardholder name is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="parcego-cardholder-name"
                      type="text"
                      placeholder="John Doe"
                    />
                  )}
                />
                {errors.cardholderName && (
                  <p className="text-sm text-red-600 mt-1">{errors.cardholderName.message}</p>
                )}
              </div>
            </div>
          )}

          {/* ACH Form */}
          {paymentMethodType === 'ach' && (
            <div className="space-y-4">
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-routing-number">Routing Number</Label>
                </div>
                <Controller
                  name="routingNumber"
                  control={control}
                  rules={{ required: 'Routing number is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="parcego-routing-number"
                      type="text"
                      placeholder="123456789"
                      maxLength={9}
                      className="font-mono"
                    />
                  )}
                />
                {errors.routingNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.routingNumber.message}</p>
                )}
              </div>
              
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-account-number">Account Number</Label>
                </div>
                <Controller
                  name="accountNumber"
                  control={control}
                  rules={{ required: 'Account number is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="parcego-account-number"
                      type="text"
                      placeholder="1234567890"
                      className="font-mono"
                    />
                  )}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
                )}
              </div>
              
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-account-type">Account Type</Label>
                </div>
                <Controller
                  name="accountType"
                  control={control}
                  rules={{ required: 'Account type is required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="parcego-account-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.accountType && (
                  <p className="text-sm text-red-600 mt-1">{errors.accountType.message}</p>
                )}
              </div>
            </div>
          )}

          {/* PayPal Form */}
          {paymentMethodType === 'paypal' && (
            <div className="space-y-4">
              <div>
                <div className="pt-3">
                  <Label htmlFor="parcego-paypal-email">PayPal Email</Label>
                </div>
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="parcego-paypal-email"
                      type="email"
                      placeholder="john.doe@example.com"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                You&apos;ll be redirected to PayPal to complete the setup and authorize future payments.
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Your information is secure</div>
                <div>
                  All payment information is encrypted and processed securely through Stripe. 
                  We never store your full card details on our servers.
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResetToMock}
                disabled={isSubmitting}
                size="sm"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Reset to Mock Data
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
                id="parcego-add-payment-method-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PaymentMethodsTab({ 
  methods, 
  onMethodAdded 
}: { 
  methods: PaymentMethod[]
  onMethodAdded: (method: PaymentMethod) => void
}) {
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddMethodDialogOpen, setIsAddMethodDialogOpen] = useState(false)

  const handleDeleteMethod = (methodId: string) => {
    setDeleteMethodId(methodId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deleteMethodId) {
      // Here you would typically call an API to delete the payment method
      console.log(`Deleting payment method: ${deleteMethodId}`)
      // For now, we'll just close the dialog
      setIsDeleteDialogOpen(false)
      setDeleteMethodId(null)
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDeleteMethodId(null)
  }

  const methodToDelete = methods.find(method => method.id === deleteMethodId)

  return (
    <div className="space-y-6">
      <Card id="parcego-billing-payment-methods">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
            <Button 
              id="parcego-billing-add-method-btn"
              onClick={() => setIsAddMethodDialogOpen(true)}
            >
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                id={`parcego-billing-method-${method.id}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <PaymentMethodIcon type={method.type} />
                  <div>
                    <div className="font-medium">{method.label}</div>
                    {method.expiry && <div className="text-sm text-muted-foreground">Expires {method.expiry}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMethod(method.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        isOpen={isAddMethodDialogOpen}
        onClose={() => setIsAddMethodDialogOpen(false)}
        onMethodAdded={onMethodAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {methodToDelete?.label}? This action cannot be undone.
              {methodToDelete?.isDefault && (
                <span className="block mt-2 text-amber-600 font-medium text-sm">
                  ⚠️ This is your default payment method. Removing it may affect your billing.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove Payment Method
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TaxDocumentsTab({ documents }: { documents: TaxDocument[] }) {
  return (
    <Card id="parcego-billing-tax-documents">
      <CardHeader>
        <CardTitle>Tax Documents</CardTitle>
        <CardDescription>Access your tax documents and forms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              id={`parcego-billing-doc-${doc.id}`}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="font-medium">{doc.type} - {doc.year}</div>
                <div className="text-sm text-muted-foreground">
                  Issued on {new Date(doc.issuedDate).toLocaleDateString()}
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PreferencesTab() {
  return (
    <Card id="parcego-billing-preferences">
      <CardHeader>
        <CardTitle>Billing Preferences</CardTitle>
        <CardDescription>Manage your billing settings and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Billing Contact</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">billing@example.com</div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Button>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Billing Address</div>
                <div className="text-sm text-muted-foreground">
                  123 Business St<br />
                  Suite 100<br />
                  New York, NY 10001
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Payment Reminders</div>
                <div className="text-sm text-muted-foreground">Receive reminders before payment due dates</div>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Invoice Notifications</div>
                <div className="text-sm text-muted-foreground">Get notified when new invoices are available</div>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Payment Confirmations</div>
                <div className="text-sm text-muted-foreground">Receive confirmation for successful payments</div>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
          </div>
        </div>
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

function InvoiceDetailsDialog({ invoice }: { invoice: Invoice }) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
    addLogoToPDF(doc, margin, yPosition, 50, 50, logoData); // Optimized dimensions for A4 invoice

    // Company info
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    yPosition = addText('Parcego', margin + 50, yPosition + 15)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition = addText('Courier Business Platform', margin + 50, yPosition + 5)
    
    // Company address
    doc.setFontSize(9)
    yPosition = addText('123 Business Street', margin + 50, yPosition + 10)
    yPosition = addText('Suite 100', margin + 50, yPosition + 5)
    yPosition = addText('New York, NY 10001', margin + 50, yPosition + 5)
    yPosition = addText('support@parcego.com', margin + 50, yPosition + 5)

    // Invoice title and details (right side)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', pageWidth - margin, margin + 15, { align: 'right' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice #: INV-${invoice.id.toUpperCase()}`, pageWidth - margin, margin + 25, { align: 'right' })
    doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, margin + 30, { align: 'right' })
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageWidth - margin, margin + 35, { align: 'right' })
    doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - margin, margin + 40, { align: 'right' })

    yPosition = yPosition + 40

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
    doc.text('Payment Methods: Credit Card, ACH, PayPal', margin, footerY + 5)
    
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
        >
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg">
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
          <div className="flex justify-end items-center gap-3">
            <Button 
              variant="outline" 
              size="default"
              onClick={handleDownloadPDF}
              className="h-10 px-4"
            >
              <Icon name="Download" size={16} className="mr-2" />
              Download PDF
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
              id="parcego-invoice-print-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4"
              size="default"
              aria-label="Print invoice"
            >
              {isPrinting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Icon name="Printer" size={16} className="mr-2" />
                  Print Invoice
                </>
              )}
            </Button>
          </div>

          {/* Invoice Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.amount)}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{invoice.lineItems.length}</div>
              <div className="text-sm text-gray-600">Line Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatDate(invoice.date)}</div>
              <div className="text-sm text-gray-600">Invoice Date</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{formatDate(invoice.dueDate)}</div>
              <div className="text-sm text-gray-600">Due Date</div>
            </div>
          </div>

          {/* Invoice Content - Print Friendly */}
          <div className="border rounded-lg p-6 bg-white relative" id="parcego-invoice-content">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <div className="text-8xl font-bold text-gray-300 transform -rotate-45">
                {invoice.status === 'paid' ? 'PAID' : invoice.status === 'overdue' ? 'OVERDUE' : 'DUE'}
              </div>
            </div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Image 
                      src="/Logo/Logo-icon-only.svg" 
                      alt="Parcego Logo" 
                      width={32}
                      height={32}
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Parcego</h1>
                    <p className="text-gray-600">Courier Business Platform</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>123 Business Street</div>
                  <div>Suite 100</div>
                  <div>New York, NY 10001</div>
                  <div>support@parcego.com</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2">INVOICE</div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Invoice #:</span> INV-{invoice.id.toUpperCase()}</div>
                  <div><span className="font-medium">Date:</span> {formatDate(invoice.date)}</div>
                  <div><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8 relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">Acme Business Solutions</div>
                <div className="text-gray-600">John Smith, CEO</div>
                <div className="text-gray-600">456 Commerce Ave</div>
                <div className="text-gray-600">Business District, CA 90210</div>
                <div className="text-gray-600">john.smith@acme.com</div>
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
              <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                  <p>Net 30 days. Please include invoice number with payment.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
                  <p>Credit Card, ACH, PayPal</p>
                </div>
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p className="mt-1">Questions? Contact us at support@parcego.com</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
