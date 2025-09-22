import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function FindDropoffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
