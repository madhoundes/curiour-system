import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function ClaimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
