import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { DashboardSearch } from "@/components/dashboard/dashboard-search"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PerformanceSummary } from "@/components/dashboard/performance-summary"
import { ShippingTips } from "@/components/dashboard/shipping-tips"
import { RecentShipments } from "@/components/dashboard/recent-shipments"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />
      
      {/* Search Bar */}
      <DashboardSearch />
      
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Performance Summary */}
      <PerformanceSummary />
      
      {/* Shipping Tips */}
      <ShippingTips />
      
      {/* Recent Shipments */}
      <RecentShipments />
    </div>
  )
}
