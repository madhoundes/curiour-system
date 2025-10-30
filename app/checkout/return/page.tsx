"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { shippingService } from "@/lib/api/shipping";

export default function CheckoutReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("Missing session_id");
      router.replace("/payment-cancelled");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    const verifyStatus = async () => {
      try {
        const status = await shippingService.getSessionStatus(sessionId);
        const sessionStatus = (status?.status || status?.checkout_status || "").toLowerCase();
        const paymentStatus = (status?.payment_status || status?.paymentStatus || "").toLowerCase();

        console.log(`Session ${sessionId} status: ${sessionStatus}, payment: ${paymentStatus}`);

        // Check if payment is complete
        const isComplete = sessionStatus === "complete" || sessionStatus === "completed" || paymentStatus === "paid";
        
        // If session is complete, redirect to success
        if (isComplete) {
          router.replace(`/purchase-label?paid=1&session_id=${sessionId}`);
          return;
        }

        // If session is expired or explicitly failed, redirect to cancelled
        if (sessionStatus === "expired" || sessionStatus === "failed") {
          router.replace("/payment-cancelled");
          return;
        }

        // If session is still open and we haven't hit max attempts, poll again
        if (sessionStatus === "open" && attempts < maxAttempts) {
          attempts++;
          setTimeout(() => {
            verifyStatus();
          }, pollInterval);
          return;
        }

        // If we've hit max attempts, treat as cancelled
        console.error("Session verification timed out after max attempts");
        router.replace("/payment-cancelled");
      } catch (e) {
        console.error("Error checking session status:", e);
        router.replace("/payment-cancelled");
      }
    };

    verifyStatus();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Finalizing checkout...</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}


