"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";

export default function PaymentCancelledPage() {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push('/purchase-label');
  };

  const handleCreateNewShipment = () => {
    router.push('/create-shipment');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Payment Cancelled"
          description="Your payment was cancelled and no charges were made"
          onBack={() => router.push('/purchase-label')}
          backLabel="Back to Payment"
        />

        {/* Cancelled Content */}
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          {/* Cancelled Card */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" size={40} className="text-yellow-700" />
              </div>
              
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">
                Payment Cancelled
              </h2>
              <p className="text-yellow-700 mb-6">
                Your payment was cancelled and no charges were made to your account. Your shipment was not created.
              </p>
            </CardContent>
          </Card>

          {/* What Happened Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" size={20} />
                What Happened?
              </CardTitle>
              <CardDescription>
                Understanding why your payment was cancelled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="MousePointer" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">User Cancelled</p>
                  <p className="text-gray-600">You chose to cancel the payment process before completion.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Icon name="Shield" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">No Charges Made</p>
                  <p className="text-gray-600">Your payment method was not charged and no shipment was created.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Icon name="RotateCcw" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Try Again Anytime</p>
                  <p className="text-gray-600">You can return to complete your shipment payment whenever you're ready.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Options Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ArrowRight" size={20} />
                What's Next?
              </CardTitle>
              <CardDescription>
                Choose what you'd like to do next
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  onClick={handleRetryPayment}
                  className="w-full justify-start h-12"
                >
                  <Icon name="CreditCard" size={18} className="mr-2" />
                  Complete Payment for This Shipment
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleCreateNewShipment}
                  className="w-full justify-start h-12"
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Create New Shipment
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full justify-start h-12"
                >
                  <Icon name="Home" size={18} className="mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="HelpCircle" size={20} />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                If you're experiencing issues with payment or have questions about our shipping services, 
                we're here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/support')}
                  className="flex-1"
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Contact Support
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/faq')}
                  className="flex-1"
                >
                  <Icon name="Book" size={16} className="mr-2" />
                  View FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}