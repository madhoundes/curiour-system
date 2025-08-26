import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function PackageDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
