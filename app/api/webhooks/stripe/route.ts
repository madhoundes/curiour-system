import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Stripe webhook endpoint for handling payment events
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (if webhook secret is configured)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      // Import Stripe only when needed to avoid issues if not installed
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        
        // Verify the webhook signature
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        
        // Process the verified event
        await processStripeEvent(event);
        
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 400 }
        );
      }
    } else {
      // If no webhook secret is configured, process the event without verification
      // (not recommended for production)
      console.warn('STRIPE_WEBHOOK_SECRET not configured - processing webhook without verification');
      
      try {
        const event = JSON.parse(body);
        await processStripeEvent(event);
      } catch (err) {
        console.error('Failed to parse webhook body:', err);
        return NextResponse.json(
          { error: 'Invalid webhook body' },
          { status: 400 }
        );
      }
    }

    // Return successful response
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Process different types of Stripe events
async function processStripeEvent(event: any) {
  console.log(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    // Payment confirmation events
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;

    // Payment failure events
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;

    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object);
      break;

    // Dispute events
    case 'charge.dispute.created':
      await handleDisputeCreated(event.data.object);
      break;

    case 'charge.dispute.updated':
      await handleDisputeUpdated(event.data.object);
      break;

    // Refund events
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;

    // Invoice events (for subscriptions if applicable)
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  try {
    // Update billing record status to 'paid'
    // You would typically update your database here
    // Example: await updateBillingStatus(paymentIntent.metadata.billing_id, 'paid');
    
    console.log(`Payment intent ${paymentIntent.id} processed successfully`);
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}

// Handle completed checkout session
async function handleCheckoutSessionCompleted(session: any) {
  console.log('Checkout session completed:', session.id);
  
  try {
    // Update shipment status and billing
    // You would typically update your database here
    // Example: await updateShipmentPaymentStatus(session.metadata.shipment_id, 'paid');
    
    console.log(`Checkout session ${session.id} processed successfully`);
  } catch (error) {
    console.error('Error processing checkout session completion:', error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    // Update billing record status to 'failed'
    // You would typically update your database here
    // Example: await updateBillingStatus(paymentIntent.metadata.billing_id, 'failed');
    
    console.log(`Payment failure for ${paymentIntent.id} processed`);
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

// Handle payment cancellation
async function handlePaymentCanceled(paymentIntent: any) {
  console.log('Payment canceled:', paymentIntent.id);
  
  try {
    // Update billing record status to 'canceled'
    // You would typically update your database here
    // Example: await updateBillingStatus(paymentIntent.metadata.billing_id, 'canceled');
    
    console.log(`Payment cancellation for ${paymentIntent.id} processed`);
  } catch (error) {
    console.error('Error processing payment cancellation:', error);
  }
}

// Handle dispute creation
async function handleDisputeCreated(dispute: any) {
  console.log('Dispute created:', dispute.id);
  
  try {
    // Handle dispute - notify admin, update records, etc.
    // You would typically update your database and send notifications here
    // Example: await createDisputeRecord(dispute);
    
    console.log(`Dispute ${dispute.id} recorded`);
  } catch (error) {
    console.error('Error processing dispute creation:', error);
  }
}

// Handle dispute updates
async function handleDisputeUpdated(dispute: any) {
  console.log('Dispute updated:', dispute.id, 'Status:', dispute.status);
  
  try {
    // Update dispute status
    // You would typically update your database here
    // Example: await updateDisputeStatus(dispute.id, dispute.status);
    
    console.log(`Dispute ${dispute.id} status updated to ${dispute.status}`);
  } catch (error) {
    console.error('Error processing dispute update:', error);
  }
}

// Handle refunds
async function handleRefund(charge: any) {
  console.log('Refund processed for charge:', charge.id);
  
  try {
    // Process refund - update billing records, notify customer, etc.
    // You would typically update your database here
    // Example: await processRefund(charge);
    
    console.log(`Refund for charge ${charge.id} processed`);
  } catch (error) {
    console.error('Error processing refund:', error);
  }
}

// Handle successful invoice payment (for subscriptions)
async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  try {
    // Update subscription status, extend service, etc.
    // You would typically update your database here
    // Example: await updateSubscriptionStatus(invoice.subscription, 'active');
    
    console.log(`Invoice ${invoice.id} payment processed`);
  } catch (error) {
    console.error('Error processing invoice payment success:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id);
  
  try {
    // Handle failed payment - retry, notify customer, suspend service, etc.
    // You would typically update your database here
    // Example: await handleFailedInvoicePayment(invoice);
    
    console.log(`Failed invoice payment ${invoice.id} processed`);
  } catch (error) {
    console.error('Error processing invoice payment failure:', error);
  }
}