/**
 * Stripe Webhook Handler - Supabase Edge Function
 * 
 * Configure this webhook endpoint in your Stripe Dashboard:
 * URL: https://knhncgvothakiirxicqh.supabase.co/functions/v1/stripe-webhook
 * 
 * Events to listen for:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 * - checkout.session.completed
 * - account.updated
 * - transfer.created
 * - transfer.failed
 * - identity.verification_session.verified
 * - identity.verification_session.requires_input
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - customer.subscription.trial_will_end
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req) => {
  // Get raw body first (before any other operations)
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return new Response(JSON.stringify({ error: 'No signature provided' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }


  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log(`✅ Webhook verified: ${event.type} [${event.id}]`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'transfer.created':
      case 'transfer.paid':
      case 'transfer.failed':
        await handleTransferEvent(event.type, event.data.object as Stripe.Transfer);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
      case 'identity.verification_session.canceled':
        await handleIdentityFailed(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ 
      received: true, 
      event_id: event.id,
      event_type: event.type 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook handler failed',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// ============ Identity Verification Handlers ============

async function handleIdentityVerified(session: Stripe.Identity.VerificationSession) {
  console.log('✅ Identity verification verified:', session.id);

  const userId = session.metadata?.user_id;
  const userEmail = session.metadata?.user_email;
  
  if (!userId && !userEmail) {
    console.error('❌ No user identifier in session metadata');
    return;
  }

  // Update user verification status
  const { error } = await supabase
    .from('users')
    .update({
      identity_verification_status: 'verified',
      identity_verification_session_id: session.id,
      identity_verification_completed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq(userId ? 'id' : 'email', userId || userEmail);

  if (error) {
    console.error('❌ Failed to update user:', error);
    return;
  }

  // Create notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification',
    title: 'Identity Verified ✓',
    message: 'Congratulations! Your identity has been successfully verified. You now have a verified badge on your profile.',
    read: false
  });

  console.log('✅ Identity verification completed for user:', userId || userEmail);
}

async function handleIdentityFailed(session: Stripe.Identity.VerificationSession) {
  console.log('❌ Identity verification failed/cancelled:', session.id);

  const userId = session.metadata?.user_id;
  const userEmail = session.metadata?.user_email;
  
  if (!userId && !userEmail) {
    console.error('❌ No user identifier in session metadata');
    return;
  }

  // Update user verification status
  const { error } = await supabase
    .from('users')
    .update({
      identity_verification_status: 'failed',
      identity_verification_session_id: session.id,
      updated_at: new Date().toISOString()
    })
    .eq(userId ? 'id' : 'email', userId || userEmail);

  if (error) {
    console.error('❌ Failed to update user:', error);
    return;
  }

  // Create notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification',
    title: 'Identity Verification Failed',
    message: 'We were unable to verify your identity. Please try again or contact support if you need assistance.',
    read: false
  });

  console.log('❌ Identity verification failed for user:', userId || userEmail);
}


// ============ Payment Handlers ============

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id);

  // Find transaction by payment_intent_id
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id);

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ No transaction found for payment intent:', paymentIntent.id);
    return;
  }

  const transaction = transactions[0];
  console.log(`Found transaction: ${transaction.id} (${transaction.transaction_type})`);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({
      status: 'completed',
      receipt_url: paymentIntent.latest_charge ? 
        (typeof paymentIntent.latest_charge === 'string' ? null : paymentIntent.latest_charge.receipt_url) : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', transaction.id);

  // Handle based on transaction type
  if (transaction.transaction_type === 'booking_payment' && transaction.reference_id) {
    console.log('Updating booking:', transaction.reference_id);
    
    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.reference_id);

    // Send notification
    await supabase.from('notifications').insert({
      user_id: transaction.user_id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Your payment was successful and booking is confirmed!',
      reference_id: transaction.reference_id,
      read: false
    });
  }

  if (transaction.transaction_type === 'escrow_payment') {
    console.log('Updating escrow for transaction:', transaction.id);
    
    await supabase
      .from('escrows')
      .update({ status: 'funds_held', updated_at: new Date().toISOString() })
      .eq('payment_intent_id', paymentIntent.id);

    await supabase.from('notifications').insert({
      user_id: transaction.user_id,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment is held in escrow until delivery is confirmed.',
      reference_id: transaction.reference_id,
      read: false
    });
  }

  console.log('✅ Payment processing completed successfully');
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_intent_id', paymentIntent.id);

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ No transaction found for failed payment:', paymentIntent.id);
    return;
  }

  const transaction = transactions[0];
  const errorMessage = paymentIntent.last_payment_error?.message || 'Payment declined';

  await supabase
    .from('transactions')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', transaction.id);

  if (transaction.transaction_type === 'booking_payment' && transaction.reference_id) {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.reference_id);
  }

  await supabase.from('notifications').insert({
    user_id: transaction.user_id,
    type: 'payment',
    title: 'Payment Failed',
    message: `Your payment failed: ${errorMessage}. Please try again or contact support.`,
    reference_id: transaction.reference_id,
    read: false
  });

  console.log('✅ Payment failure processed');
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💰 Charge refunded:', charge.id);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_intent_id', charge.payment_intent);

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ No transaction found for refunded charge:', charge.id);
    return;
  }

  const originalTransaction = transactions[0];
  const refundAmount = charge.amount_refunded / 100;

  // Create refund transaction
  await supabase.from('transactions').insert({
    user_id: originalTransaction.user_id,
    transaction_type: 'refund',
    amount: refundAmount,
    currency: charge.currency || 'USD',
    status: 'completed',
    payment_intent_id: charge.payment_intent as string,
    reference_id: originalTransaction.reference_id,
    description: `Refund: ${originalTransaction.description}`
  });

  // Update original transaction
  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('id', originalTransaction.id);

  if (originalTransaction.transaction_type === 'booking_payment' && originalTransaction.reference_id) {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', originalTransaction.reference_id);
  }

  await supabase.from('notifications').insert({
    user_id: originalTransaction.user_id,
    type: 'payment',
    title: 'Refund Processed',
    message: `A refund of $${refundAmount.toFixed(2)} has been processed. It may take 5-10 business days to appear.`,
    reference_id: originalTransaction.reference_id,
    read: false
  });

  console.log('✅ Refund processed successfully');
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  // Additional handling for checkout sessions if needed
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log('Account updated:', account.id);

  const { data: payoutMethods } = await supabase
    .from('payout_methods')
    .select('*')
    .eq('stripe_account_id', account.id);

  if (!payoutMethods || payoutMethods.length === 0) return;

  const payoutMethod = payoutMethods[0];
  const isVerified = account.charges_enabled && 
                    account.payouts_enabled && 
                    !account.requirements?.currently_due?.length;

  const newStatus = isVerified ? 'verified' : 
                   account.requirements?.disabled_reason ? 'failed' : 
                   'pending_verification';

  await supabase
    .from('payout_methods')
    .update({
      status: newStatus,
      verified_at: isVerified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', payoutMethod.id);

  if (isVerified && payoutMethod.status !== 'verified') {
    await supabase.from('notifications').insert({
      user_id: payoutMethod.user_id,
      type: 'payout',
      title: 'Stripe Account Verified',
      message: 'Your Stripe account is now verified and ready to receive payouts!',
      read: false
    });
  }

  console.log('Account status updated:', newStatus);
}

async function handleTransferEvent(eventType: string, transfer: Stripe.Transfer) {
  console.log(`Transfer event: ${eventType}`, transfer.id);

  if (eventType === 'transfer.failed') {
    const { data: payouts } = await supabase
      .from('payouts')
      .select('*')
      .eq('stripe_transfer_id', transfer.id);

    if (payouts && payouts.length > 0) {
      const payout = payouts[0];
      
      await supabase
        .from('payouts')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', payout.id);

      await supabase.from('notifications').insert({
        user_id: payout.user_id,
        type: 'payout',
        title: 'Payout Failed',
        message: 'There was an issue processing your payout. Please check your Stripe account.',
        reference_id: payout.id,
        read: false
      });
    }
  }

  console.log('Transfer event processed');
}


// ============ Subscription Handlers ============

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  await supabase
    .from('users')
    .update({
      ai_assistant_subscription_status: subscription.status,
      ai_assistant_subscription_id: subscription.id,
      ai_assistant_trial_end: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      ai_assistant_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (subscription.status === 'active' && subscription.trial_end) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment',
      title: 'AI Assistant Trial Started',
      message: 'Your 7-day free trial of AI Chat Assistance has begun. Enjoy all premium features!',
      read: false
    });
  }

  if (subscription.status === 'past_due') {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment',
      title: 'Payment Failed',
      message: 'Your AI Assistant subscription payment failed. Please update your payment method.',
      read: false
    });
  }

  console.log('✅ Subscription updated for user:', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await supabase
    .from('users')
    .update({
      ai_assistant_subscription_status: 'none',
      ai_assistant_subscription_id: null,
      ai_assistant_trial_end: null,
      ai_assistant_current_period_end: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'payment',
    title: 'AI Assistant Canceled',
    message: 'Your AI Chat Assistance subscription has been canceled. You can resubscribe anytime.',
    read: false
  });

  console.log('✅ Subscription canceled for user:', userId);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial ending soon:', subscription.id);

  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'payment',
    title: 'Trial Ending Soon',
    message: 'Your AI Assistant free trial ends in 3 days. Your subscription will begin automatically unless you cancel.',
    read: false
  });

  console.log('✅ Trial reminder sent to user:', userId);
}