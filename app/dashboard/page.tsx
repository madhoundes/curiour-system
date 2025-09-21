import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { DashboardSearch } from "@/components/dashboard/dashboard-search"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PerformanceSummary } from "@/components/dashboard/performance-summary"
import { ShippingTips } from "@/components/dashboard/shipping-tips"
import { RecentShipments } from "@/components/dashboard/recent-shipments"
import { RecentActivity } from "@/components/dashboard/recent-activity"

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
      
      {/* Recent Shipments and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentShipments />
        <RecentActivity />
      </div>
    </div>
  )
}