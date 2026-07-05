"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  endMerchantImpersonation,
  getImpersonationContext,
  type ImpersonationContext,
} from "@/lib/auth/impersonation";

export const ImpersonationBanner = () => {
  const [context, setContext] = useState<ImpersonationContext | null>(null);

  useEffect(() => {
    setContext(getImpersonationContext());
  }, []);

  if (!context) {
    return null;
  }

  const handleExitImpersonation = () => {
    endMerchantImpersonation();
  };

  return (
    <div
      id="parcego-impersonation-banner"
      className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2 text-sm text-amber-950">
        <Icon name="Eye" size={16} className="mt-0.5 shrink-0 text-amber-700" />
        <p>
          Viewing as{" "}
          <span className="font-semibold">{context.merchantLabel}</span>
          <span className="text-amber-800"> ({context.merchantEmail})</span>
        </p>
      </div>
      <Button
        id="parcego-impersonation-exit-btn"
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
        onClick={handleExitImpersonation}
        aria-label="Exit merchant view and return to admin dashboard"
      >
        <Icon name="LogOut" size={14} className="mr-2" />
        Exit to Admin
      </Button>
    </div>
  );
};
