import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
