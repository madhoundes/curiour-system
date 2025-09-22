import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function ShipmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
