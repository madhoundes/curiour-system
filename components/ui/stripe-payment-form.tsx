"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { shippingService } from '@/lib/api/shipping';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({ 
  clientSecret, 
  amount, 
  currency, 
  onSuccess, 
  onError 
}: StripePaymentFormProps) {
  const router = useRouter();
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

  const handlePaymentComplete = async () => {
    console.log('Payment completed successfully');
    setIsProcessingSuccess(true);
    
    try {
      // Extract session ID from client secret
      const sessionId = clientSecret.split('_secret_')[0];
      console.log('Extracted session ID:', sessionId);
      
      // Check session status using the API
      const sessionStatus = await shippingService.getSessionStatus(sessionId);
      console.log('Session status:', sessionStatus);
      
      if (sessionStatus) {
        // Redirect to payment success page with session ID
        router.push(`/payment-success?session_id=${sessionId}`);
      } else {
        // Fallback to original onSuccess callback
        onSuccess();
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      // Fallback to original onSuccess callback
      onSuccess();
    } finally {
      setIsProcessingSuccess(false);
    }
  };

  const options = {
    clientSecret,
    onComplete: handlePaymentComplete
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="shield-check" className="mr-2 h-5 w-5 text-green-600" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessingSuccess && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 text-sm">Processing payment success...</span>
            </div>
          </div>
        )}
        <EmbeddedCheckoutProvider options={options} stripe={stripePromise}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </CardContent>
    </Card>
  );
}