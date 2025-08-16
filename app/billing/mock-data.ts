import { Payment, Invoice, PaymentMethod, TaxDocument } from './types'

export const mockPayments: Payment[] = [
  {
    id: 'pmt-001',
    date: '2024-01-15T10:00:00Z',
    amount: 1250.00,
    currency: 'USD',
    status: 'paid',
    method: 'Visa •••• 1234',
    invoiceId: 'inv-001',
    downloadUrl: '#'
  },
  {
    id: 'pmt-002',
    date: '2024-01-01T10:00:00Z',
    amount: 2100.00,
    currency: 'USD',
    status: 'paid',
    method: 'ACH Transfer',
    invoiceId: 'inv-002',
    downloadUrl: '#'
  },
  {
    id: 'pmt-003',
    date: '2023-12-15T10:00:00Z',
    amount: 1800.00,
    currency: 'USD',
    status: 'pending',
    method: 'PayPal',
    invoiceId: 'inv-003',
    downloadUrl: '#'
  }
]

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    date: '2024-01-15T10:00:00Z',
    dueDate: '2024-02-15T10:00:00Z',
    amount: 3200.00,
    currency: 'USD',
    status: 'due',
    downloadUrl: '#',
    lineItems: [
      { description: 'Standard Delivery (50 packages)', amount: 2500.00 },
      { description: 'Express Delivery Surcharge', amount: 500.00 },
      { description: 'Insurance', amount: 200.00 }
    ]
  },
  {
    id: 'inv-002',
    date: '2024-01-01T10:00:00Z',
    dueDate: '2024-02-01T10:00:00Z',
    amount: 2100.00,
    currency: 'USD',
    status: 'paid',
    downloadUrl: '#',
    lineItems: [
      { description: 'Standard Delivery (35 packages)', amount: 1750.00 },
      { description: 'Insurance', amount: 350.00 }
    ]
  },
  {
    id: 'inv-003',
    date: '2023-12-15T10:00:00Z',
    dueDate: '2024-01-15T10:00:00Z',
    amount: 1800.00,
    currency: 'USD',
    status: 'overdue',
    downloadUrl: '#',
    lineItems: [
      { description: 'Standard Delivery (30 packages)', amount: 1500.00 },
      { description: 'Insurance', amount: 300.00 }
    ]
  }
]

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'card',
    label: 'Visa •••• 1234',
    isDefault: true,
    expiry: '12/25'
  },
  {
    id: 'pm-002',
    type: 'ach',
    label: 'Business Checking •••• 5678',
    isDefault: false
  },
  {
    id: 'pm-003',
    type: 'paypal',
    label: 'PayPal - business@example.com',
    isDefault: false
  }
]

export const mockTaxDocuments: TaxDocument[] = [
  {
    id: 'tax-001',
    year: 2023,
    type: '1099-K',
    downloadUrl: '#',
    issuedDate: '2024-01-31T10:00:00Z'
  },
  {
    id: 'tax-002',
    year: 2023,
    type: 'Annual Statement',
    downloadUrl: '#',
    issuedDate: '2024-01-31T10:00:00Z'
  },
  {
    id: 'tax-003',
    year: 2022,
    type: '1099-K',
    downloadUrl: '#',
    issuedDate: '2023-01-31T10:00:00Z'
  }
]
