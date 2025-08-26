import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function LabelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
