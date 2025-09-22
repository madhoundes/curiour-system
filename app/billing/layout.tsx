import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
