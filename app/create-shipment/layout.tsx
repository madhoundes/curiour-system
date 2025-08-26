import { MerchantDashboardLayout } from "@/components/ui/merchant-dashboard-layout";

export default function CreateShipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantDashboardLayout>{children}</MerchantDashboardLayout>;
}
