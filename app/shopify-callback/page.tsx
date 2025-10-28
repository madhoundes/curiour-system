"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { shopifyService } from "@/lib/api";
import { toast } from "sonner";

export default function ShopifyCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const shop = searchParams.get('shop');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          toast.error(`Shopify OAuth error: ${error}`);
          router.push('/dashboard');
          return;
        }

        // Validate required parameters
        if (!code || !shop) {
          toast.error("Missing required OAuth parameters");
          router.push('/dashboard');
          return;
        }

        // Call the callback endpoint
        const response = await shopifyService.callback({
          code,
          state: state || undefined,
          shop,
        });

        if (response.data.success) {
          // Success! Redirect to success page
          toast.success("Successfully connected to Shopify!");
          router.push('/shopify-connected');
        } else {
          toast.error(response.data.message || "Failed to connect to Shopify");
          router.push('/dashboard');
        }

      } catch (error) {
        console.error("Shopify callback processing error:", error);
        toast.error("Failed to process Shopify connection");
        router.push('/dashboard');
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900">
          Connecting to Shopify...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your connection.
        </p>
      </div>
    </div>
  );
}


