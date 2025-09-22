import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
