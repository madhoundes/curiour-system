import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function ShopifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}

