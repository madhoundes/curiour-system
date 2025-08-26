"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

type WizardStep = {
  path: string;
  title: string;
};

// Define the canonical order of the shipment creation flow
export const FLOW_STEPS: WizardStep[] = [
  { path: "/create-shipment", title: "Create Shipment" },
  { path: "/package-details", title: "Package Details" },
  { path: "/quote-preview", title: "Quote Preview" },
  { path: "/purchase-label", title: "Purchase Label" },
  { path: "/label/preview", title: "Label Preview" },
  { path: "/find-dropoff", title: "Find Drop-off Location" },
  { path: "/dropoff-confirmation", title: "Drop-off Confirmation" }
];

const normalizePath = (path: string) => {
  if (!path) return path;
  // Strip trailing slash and query/hash for matching against step paths
  const [pathname] = path.split("?");
  return pathname?.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
};

export const getPrevInFlow = (currentPath: string): string | null => {
  const normalized = normalizePath(currentPath);
  const index = FLOW_STEPS.findIndex((s) => s.path === normalized);
  if (index <= 0) return "/dashboard"; // first step goes back to dashboard
  return FLOW_STEPS[index - 1]?.path ?? null;
};

export const getNextInFlow = (currentPath: string): string | null => {
  const normalized = normalizePath(currentPath);
  const index = FLOW_STEPS.findIndex((s) => s.path === normalized);
  if (index < 0) return null;
  return FLOW_STEPS[index + 1]?.path ?? null;
};

// Hook to provide a consistent back action across the wizard
export const useWizardBack = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = useCallback(() => {
    const prev = getPrevInFlow(pathname || "/");
    if (prev) {
      router.push(prev);
      return;
    }
    router.back();
  }, [pathname, router]);

  return handleBack;
};


