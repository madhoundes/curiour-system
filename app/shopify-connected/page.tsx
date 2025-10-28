"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";

export default function ShopifyConnectedPage() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to dashboard after 5 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-4">
                                <Icon name="CheckCircle" size={64} className="text-green-600" />
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
                            <div className="text-4xl font-bold text-green-600">
                                Shopify
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Successfully Connected!
                            </h1>
                            <p className="text-gray-600">
                                Your Shopify store is now connected to Parcego. You can start managing your shipments seamlessly.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-left">
                            <div className="flex items-start gap-3">
                                <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Automatic Order Sync</p>
                                    <p className="text-xs text-gray-600">Orders will sync automatically</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Real-time Tracking</p>
                                    <p className="text-xs text-gray-600">Customers get live updates</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Inventory Management</p>
                                    <p className="text-xs text-gray-600">Keep stock levels in sync</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full"
                                size="lg"
                            >
                                Go to Dashboard
                            </Button>
                            <p className="text-xs text-gray-500">
                                Redirecting automatically in 5 seconds...
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
