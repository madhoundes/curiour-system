import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";
import { MerchantRoleGuard } from "@/components/auth/merchant-role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MerchantRoleGuard>
      <MerchantDashboardLayout>{children}</MerchantDashboardLayout>
    </MerchantRoleGuard>
  );
}
