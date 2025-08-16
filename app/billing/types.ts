export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export interface Payment {
  id: string
  date: string // ISO string
  amount: number
  currency: string
  status: PaymentStatus
  method: string // e.g., 'Visa •••• 1234'
  invoiceId: string
  downloadUrl: string
}

export type InvoiceStatus = 'paid' | 'due' | 'overdue'
export interface Invoice {
  id: string
  date: string // ISO string
  dueDate: string // ISO string
  amount: number
  currency: string
  status: InvoiceStatus
  downloadUrl: string
  lineItems: Array<{ description: string; amount: number }>
}

export type PaymentMethodType = 'card' | 'ach' | 'paypal'
export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string // e.g., 'Visa •••• 1234'
  isDefault: boolean
  expiry?: string // MM/YY for cards
}

export interface TaxDocument {
  id: string
  year: number
  type: string // e.g., '1099', 'VAT'
  downloadUrl: string
  issuedDate: string // ISO string
}
