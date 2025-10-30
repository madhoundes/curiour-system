"use client";

import React, { useState, useMemo, useEffect } from 'react';
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

// Check if Stripe key is available
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

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
  const [stripeError, setStripeError] = useState<string | null>(null);

  console.log('StripePaymentForm rendering with:', { clientSecret: clientSecret?.substring(0, 20) + '...', amount, currency });

  // Handle Stripe initialization errors
  useEffect(() => {
    if (stripePromise) {
      stripePromise.catch((error) => {
        console.error('Stripe initialization error:', error);
        setStripeError('Failed to initialize payment system. Please refresh the page.');
        onError('Stripe initialization failed');
      });
    }
  }, [onError]);

  const handlePaymentComplete = async () => {
    console.log('Payment completed, redirecting to return handler');
    setIsProcessingSuccess(true);
    try {
      const sessionId = clientSecret.split('_secret_')[0];
      router.replace(`/checkout/return?session_id=${sessionId}`);
    } finally {
      setIsProcessingSuccess(false);
    }
  };

  const options = useMemo(() => ({
    clientSecret,
    onComplete: handlePaymentComplete
  }), [clientSecret]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Shield" className="mr-2 h-5 w-5 text-green-600" />
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
        
        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
          <div className="text-center py-8">
            <Icon name="alert-circle" className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 mb-2">Stripe configuration error</p>
            <p className="text-gray-600 text-sm">Please contact support for assistance</p>
          </div>
        ) : stripeError ? (
          <div className="text-center py-8">
            <Icon name="alert-circle" className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 mb-2">Payment form error</p>
            <p className="text-gray-600 text-sm mb-4">{stripeError}</p>
            <button 
              onClick={() => {
                setStripeError(null);
                onError('Payment form failed to load');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="stripe-checkout-container">
            <EmbeddedCheckoutProvider 
              options={options} 
              stripe={stripePromise}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}