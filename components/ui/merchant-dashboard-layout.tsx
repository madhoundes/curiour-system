"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { UnifiedHeader } from "@/components/ui/unified-header";
import { cn } from "@/lib/utils";

// Navigation section type
interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

// Navigation item type
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
}

// Navigation sections configuration
const navigationSections: NavigationSection[] = [
  {
    id: "shipments",
    title: "Shipments",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "Home", description: "Overview and quick actions" },
      { id: "create-shipment", label: "Create Shipment", href: "/create-shipment", icon: "Plus", description: "Ship new packages" },
      { id: "shipments", label: "All Shipments", href: "/shipments", icon: "Package", description: "View shipment history" },
      { id: "find-dropoff", label: "Drop-off Locations", href: "/find-dropoff", icon: "MapPin", description: "Find nearby locations" }
    ]
  },

  {
    id: "analytics",
    title: "Analytics & Reports",
    items: [
      { id: "analytics", label: "Analytics", href: "/analytics", icon: "BarChart3", description: "Performance insights" },
      { id: "billing", label: "Billing & Payments", href: "/billing", icon: "CreditCard", description: "Manage payments and invoices" }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    items: [
      { id: "profile", label: "Account Profile", href: "/profile", icon: "User", description: "Update account details" },
      { id: "notifications", label: "Notifications", href: "/notifications", icon: "Bell", description: "View all notifications" }
    ]
  },
  {
    id: "support",
    title: "Support & Claims",
    items: [
      { id: "support", label: "Help & Support", href: "/support", icon: "HelpCircle", description: "Get help and resources" },
      { id: "claims", label: "File a Claim", href: "/claims", icon: "Shield", description: "Report damaged packages" },
      { id: "claims-history", label: "Claims History", href: "/claims/history", icon: "History", description: "View claim history" },
      { id: "undeliverable", label: "Undeliverable Packages", href: "/undeliverable", icon: "PackageX", description: "Resolve delivery issues" }
    ]
  }
];

interface MerchantDashboardLayoutProps {
  children: React.ReactNode;
}

export function MerchantDashboardLayout({ children }: MerchantDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check if navigation item is active
  const isActiveNavItem = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Handle navigation
  const handleNavigate = (href: string) => {
    router.push(href);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, href: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header */}
      <UnifiedHeader 
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ease-out motion-reduce:transition-none"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex pt-16">
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-out z-30 motion-reduce:transition-none shadow-lg",
            "lg:translate-x-0 lg:fixed lg:inset-0 lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          id="parcego-dashboard-sidebar"
        >
          <nav className="pt-8 px-4 pb-4 space-y-6" aria-label="Main navigation">
            {navigationSections.map((section) => (
              <div 
                key={section.id} 
                id={`parcego-dashboard-nav-section-${section.id}`}
                className="space-y-2"
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isActiveNavItem(item.href);
                    return (
                      <button
                        key={item.id}
                        id={`parcego-dashboard-nav-btn-${item.id}`}
                        onClick={() => handleNavigate(item.href)}
                        onKeyDown={(e) => handleKeyDown(e, item.href)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out group motion-reduce:transition-none",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-[#eee] shadow-[inset_5px_0_0_#5c83ff]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                        )}
                        aria-label={`${item.label} - ${item.description}`}
                        aria-current={isActive ? "page" : undefined}
                        tabIndex={0}
                      >
                        <Icon 
                          name={item.icon} 
                          size={18} 
                          className={cn(
                            "mr-3 transition-colors duration-200",
                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                          )} 
                        />
                        <div className="flex-1 text-left">
                          <div className={cn(isActive ? "font-bold" : "font-medium")}>{item.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Development Pages Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Development Preview
              </h3>
              <div className="space-y-1">
                <button
                  id="parcego-dashboard-nav-btn-courier"
                  onClick={() => handleNavigate('/courier')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Courier Dashboard - Development preview"
                  tabIndex={0}
                >
                  <Icon name="Truck" size={18} className="mr-3 text-gray-400" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Courier Dashboard</div>
                  </div>
                </button>
                <button
                  id="parcego-dashboard-nav-btn-admin"
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Admin Dashboard - Development preview"
                  tabIndex={0}
                >
                  <Icon name="Settings" size={18} className="mr-3 text-gray-400" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Admin Dashboard</div>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div 
          className={cn(
            "flex-1 transition-all duration-300 ease-out motion-reduce:transition-none",
            "lg:ml-64" // Add left margin on large screens to account for fixed sidebar
          )}
          id="parcego-dashboard-main-container"
        >
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
