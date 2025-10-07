import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
