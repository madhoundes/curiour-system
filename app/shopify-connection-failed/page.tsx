"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

function ShopifyConnectionFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get error message from query params if available
  const errorMessage = searchParams.get('message') || searchParams.get('error') || 'Unknown error occurred';

  useEffect(() => {
    // Auto-redirect to profile page (Shopify Integration tab) after 8 seconds
    const timer = setTimeout(() => {
      router.push("/profile?tab=api");
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <Icon name="CircleX" size={64} className="text-red-600" />
              </div>
            </div>

            {/* Shopify Logo */}
            <div className="flex justify-center items-center gap-4">
              <Image
                src="/Logo/Master-logo.svg"
                alt="Parcego Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <Icon name="ArrowRight" size={24} className="text-gray-400" />
              <div className="text-4xl font-bold text-red-600">
                Shopify
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Connection Failed
              </h1>
              <p className="text-gray-600">
                We couldn't connect your Shopify store to Parcego.
              </p>
              {errorMessage && errorMessage !== 'Unknown error occurred' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-red-800 font-medium">Error Details:</p>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* Help Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Icon name="CircleAlert" size={20} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Common Issues</p>
                  <p className="text-xs text-gray-600">Check your Shopify app permissions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="CircleAlert" size={20} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Network Problems</p>
                  <p className="text-xs text-gray-600">Ensure you have a stable internet connection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="CircleAlert" size={20} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Try Again</p>
                  <p className="text-xs text-gray-600">You can retry the connection anytime</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/profile?tab=api")}
                className="w-full"
                size="lg"
              >
                Go to Integration Settings
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push("/support")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Contact Support
              </Button>
              <p className="text-xs text-gray-500">
                Redirecting automatically in 8 seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ShopifyConnectionFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <ShopifyConnectionFailedContent />
    </Suspense>
  );
}

