import { Metadata } from "next"
import { BillingPage } from "./billing-client"

export const metadata: Metadata = {
  title: "Billing & Payments - Parcego",
  description: "Manage your billing, payments, and invoices",
}

export default async function Page() {
  return <BillingPage />
}