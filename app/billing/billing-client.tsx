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

// Mock payment form data for testing
const mockPaymentData = {
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
              setPaymentMethods(prev => [...prev, newMethod])
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
    <Card id="parcego-billing-table-payments">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View all your past payments and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} id={`parcego-billing-row-${payment.id}`}>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={payment.downloadUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.downloadUrl} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                    <InvoiceDetailsDialog invoice={invoice} />
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
    defaultValues: mockPaymentData.card
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

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const variants: Record<Payment["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    paid: { variant: "default", label: "Paid" },
    pending: { variant: "secondary", label: "Pending" },
    failed: { variant: "destructive", label: "Failed" },
    refunded: { variant: "outline", label: "Refunded" }
  }

  const { variant, label } = variants[status]
  return <Badge variant={variant}>{label}</Badge>
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
  const iconSize = 24; // Consistent size for all icons
  
  switch (type) {
    case 'card':
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 -11 70 70" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-700"
          >
            <rect x="0.5" y="0.5" width="69" height="47" rx="5.5" fill="currentColor" stroke="#D9D9D9"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3945 34.7619C33.0114 36.8184 29.92 38.0599 26.5421 38.0599C19.0047 38.0599 12.8945 31.8788 12.8945 24.254C12.8945 16.6291 19.0047 10.448 26.5421 10.448C29.92 10.448 33.0114 11.6895 35.3945 13.7461C37.7777 11.6895 40.869 10.448 44.247 10.448C51.7843 10.448 57.8945 16.6291 57.8945 24.254C57.8945 31.8788 51.7843 38.0599 44.247 38.0599C40.869 38.0599 37.7777 36.8184 35.3945 34.7619Z" fill="#ED0006"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3945 34.7619C38.3289 32.2296 40.1896 28.4616 40.1896 24.254C40.1896 20.0463 38.3289 16.2783 35.3945 13.7461C37.7777 11.6895 40.869 10.448 44.247 10.448C51.7843 10.448 57.8945 16.6291 57.8945 24.254C57.8945 31.8788 51.7843 38.0599 44.247 38.0599C40.869 38.0599 37.7777 36.8184 35.3945 34.7619Z" fill="#F9A000"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3946 13.7461C38.329 16.2784 40.1897 20.0463 40.1897 24.254C40.1897 28.4616 38.329 32.2295 35.3946 34.7618C32.4603 32.2295 30.5996 28.4616 30.5996 24.254C30.5996 20.0463 32.4603 16.2784 35.3946 13.7461Z" fill="#FF5E00"/>
          </svg>
        </div>
      );
    
    case 'ach':
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    
    case 'paypal':
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" fill="#0070BA"/>
            <path d="M32.3305 18.0977C32.3082 18.24 32.2828 18.3856 32.2542 18.5351C31.2704 23.5861 27.9046 25.331 23.606 25.331H21.4173C20.8916 25.331 20.4486 25.7127 20.3667 26.2313L19.2461 33.3381L18.9288 35.3527C18.8755 35.693 19.1379 36 19.4815 36H23.3634C23.8231 36 24.2136 35.666 24.286 35.2127L24.3241 35.0154L25.055 30.3772L25.1019 30.1227C25.1735 29.6678 25.5648 29.3338 26.0245 29.3338H26.6051C30.3661 29.3338 33.3103 27.8068 34.1708 23.388C34.5303 21.5421 34.3442 20.0008 33.393 18.9168C33.1051 18.59 32.748 18.3188 32.3305 18.0977Z" fill="white" fillOpacity="0.6"/>
            <path d="M31.3009 17.6871C31.1506 17.6434 30.9955 17.6036 30.8364 17.5678C30.6766 17.5328 30.5127 17.5018 30.3441 17.4748C29.754 17.3793 29.1074 17.334 28.4147 17.334H22.5676C22.4237 17.334 22.2869 17.3666 22.1644 17.4254C21.8948 17.5551 21.6944 17.8104 21.6459 18.1229L20.402 26.0013L20.3662 26.2311C20.4481 25.7126 20.8911 25.3308 21.4168 25.3308H23.6055C27.9041 25.3308 31.2699 23.5851 32.2537 18.5349C32.2831 18.3854 32.3078 18.2398 32.33 18.0975C32.0811 17.9655 31.8115 17.8525 31.5212 17.7563C31.4496 17.7324 31.3757 17.7094 31.3009 17.6871Z" fill="white" fillOpacity="0.8"/>
            <path d="M21.6461 18.1231C21.6946 17.8105 21.895 17.5552 22.1646 17.4264C22.2879 17.3675 22.4239 17.3349 22.5678 17.3349H28.4149C29.1077 17.3349 29.7542 17.3803 30.3444 17.4757C30.513 17.5027 30.6768 17.5338 30.8367 17.5687C30.9957 17.6045 31.1508 17.6443 31.3011 17.688C31.3759 17.7103 31.4498 17.7334 31.5222 17.7564C31.8125 17.8527 32.0821 17.9664 32.331 18.0976C32.6237 16.231 32.3287 14.9601 31.3194 13.8093C30.2068 12.5424 28.1986 12 25.629 12H18.169C17.6441 12 17.1963 12.3817 17.1152 12.9011L14.0079 32.5969C13.9467 32.9866 14.2473 33.3381 14.6402 33.3381H19.2458L20.4022 26.0014L21.6461 18.1231Z" fill="white"/>
          </svg>
        </div>
      );
    
    default:
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      );
  }
}

function InvoiceDetailsDialog({ invoice }: { invoice: Invoice }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Invoice #{invoice.id} - {new Date(invoice.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">Line Items</div>
            <div className="space-y-2">
              {invoice.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Status</div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <div>
            <div className="font-medium mb-2">Due Date</div>
            <div className="text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
