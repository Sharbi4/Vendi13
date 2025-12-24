/**
 * Stripe Webhook Handler
 * 
 * Configure this webhook endpoint in your Stripe Dashboard:
 * URL: https://vendibook.com/api/webhooks/stripe
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

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-12-18.acacia',
});
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
    // Get raw body first (before any other operations)
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        console.error('❌ Missing stripe-signature header');
        return Response.json({ error: 'No signature provided' }, { status: 400 });
    }

    if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
        return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature BEFORE any other processing
    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret
        );
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`✅ Webhook verified: ${event.type} [${event.id}]`);

    // Initialize Base44 client AFTER signature verification
    const base44 = createClientFromRequest(req);

    try {

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(base44, event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(base44, event.data.object);
                break;

            case 'charge.refunded':
                await handleChargeRefunded(base44, event.data.object);
                break;

            case 'checkout.session.completed':
                await handleCheckoutCompleted(base44, event.data.object);
                break;

            case 'account.updated':
                await handleAccountUpdated(base44, event.data.object);
                break;

            case 'transfer.created':
            case 'transfer.paid':
            case 'transfer.failed':
                await handleTransferEvent(base44, event.type, event.data.object);
                break;

            case 'identity.verification_session.verified':
                await handleIdentityVerified(base44, event.data.object);
                break;

            case 'identity.verification_session.requires_input':
            case 'identity.verification_session.canceled':
                await handleIdentityFailed(base44, event.data.object);
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(base44, event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(base44, event.data.object);
                break;

            case 'customer.subscription.trial_will_end':
                await handleTrialWillEnd(base44, event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ 
            received: true, 
            event_id: event.id,
            event_type: event.type 
        });

    } catch (error) {
        console.error('❌ Webhook handler error:', error);
        return Response.json({ 
            error: 'Webhook handler failed',
            details: error.message 
        }, { status: 500 });
    }
});

async function handlePaymentSucceeded(base44, paymentIntent) {
    console.log('✅ Payment succeeded:', paymentIntent.id);

    // Find transaction by payment_intent_id
    let transactions = await base44.asServiceRole.entities.Transaction.filter({
        payment_intent_id: paymentIntent.id
    });

    // If no transaction found by payment_intent_id, try to find by metadata
    if (transactions.length === 0 && paymentIntent.metadata?.transaction_id) {
        transactions = await base44.asServiceRole.entities.Transaction.filter({
            id: paymentIntent.metadata.transaction_id
        });
    }

    if (transactions.length === 0) {
        console.log('⚠️  No transaction found for payment intent:', paymentIntent.id);
        return;
    }

    const transaction = transactions[0];
    console.log(`Found transaction: ${transaction.id} (${transaction.transaction_type})`);

    // Update transaction status with payment details
    await base44.asServiceRole.entities.Transaction.update(transaction.id, {
        status: 'completed',
        payment_intent_id: paymentIntent.id,
        receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
        payment_method: paymentIntent.payment_method || null,
        metadata: {
            ...transaction.metadata,
            stripe_charge_id: paymentIntent.charges?.data?.[0]?.id,
            payment_completed_at: new Date().toISOString()
        }
    });

    // Handle based on transaction type
    if (transaction.transaction_type === 'booking_payment' && transaction.reference_id) {
        console.log('Updating booking:', transaction.reference_id);
        
        // Update booking status
        await base44.asServiceRole.entities.Booking.update(transaction.reference_id, {
            payment_status: 'paid',
            status: 'confirmed',
            payment_intent_id: paymentIntent.id
        });

        // Send confirmation notification
        await base44.asServiceRole.entities.Notification.create({
            user_email: transaction.user_email,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: 'Your payment was successful and booking is confirmed!',
            reference_id: transaction.reference_id,
            link: `/booking-details?id=${transaction.reference_id}`
        });
    }

    if (transaction.transaction_type === 'escrow_payment') {
        console.log('Updating escrow for listing:', transaction.metadata?.listing_id);
        
        // Update escrow status
        const escrows = await base44.asServiceRole.entities.Escrow.filter({
            payment_intent_id: paymentIntent.id
        });
        
        if (escrows.length > 0) {
            await base44.asServiceRole.entities.Escrow.update(escrows[0].id, {
                status: 'funds_held'
            });
        }

        // Notify buyer
        await base44.asServiceRole.entities.Notification.create({
            user_email: transaction.user_email,
            type: 'payment',
            title: 'Payment Successful',
            message: 'Your payment is held in escrow until delivery is confirmed.',
            reference_id: transaction.reference_id
        });
    }

    if (transaction.transaction_type === 'sale_purchase' && transaction.metadata?.listing_id) {
        console.log('Updating listing for purchase:', transaction.metadata.listing_id);
        
        // Notify seller
        const listings = await base44.asServiceRole.entities.Listing.filter({
            id: transaction.metadata.listing_id
        });
        
        if (listings.length > 0) {
            const listing = listings[0];
            
            // Calculate payout with shipping deduction
            const saleAmount = transaction.amount;
            const platformFee = saleAmount * 0.10; // 10% platform fee
            const shippingCost = transaction.seller_shipping_cost || 0;
            const netAmount = saleAmount - platformFee - shippingCost;
            
            // Create payout record
            await base44.asServiceRole.entities.Payout.create({
                host_email: listing.created_by,
                transaction_id: transaction.id,
                amount: saleAmount,
                platform_fee: platformFee,
                shipping_cost: shippingCost,
                net_amount: netAmount,
                status: 'pending',
                payout_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
            });
            
            // Notify seller with payout breakdown
            await base44.asServiceRole.entities.Notification.create({
                user_email: listing.created_by,
                type: 'sale_purchase',
                title: 'New Purchase',
                message: `Your listing "${listing.title}" has been purchased! You'll receive $${netAmount.toFixed(2)} (Sale: $${saleAmount} - Fee: $${platformFee.toFixed(2)}${shippingCost > 0 ? ` - Shipping: $${shippingCost.toFixed(2)}` : ''})`,
                reference_id: listing.id
            });
        }
    }

    console.log('✅ Payment processing completed successfully');
}

async function handlePaymentFailed(base44, paymentIntent) {
    console.log('❌ Payment failed:', paymentIntent.id);

    // Find transaction
    const transactions = await base44.asServiceRole.entities.Transaction.filter({
        payment_intent_id: paymentIntent.id
    });

    if (transactions.length === 0) {
        console.log('⚠️  No transaction found for failed payment:', paymentIntent.id);
        return;
    }

    const transaction = transactions[0];
    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment declined';
    
    console.log(`Marking transaction ${transaction.id} as failed: ${errorMessage}`);

    // Update transaction status with error details
    await base44.asServiceRole.entities.Transaction.update(transaction.id, {
        status: 'failed',
        metadata: {
            ...transaction.metadata,
            error_code: paymentIntent.last_payment_error?.code,
            error_message: errorMessage,
            failed_at: new Date().toISOString()
        }
    });

    // Update booking if applicable
    if (transaction.transaction_type === 'booking_payment' && transaction.reference_id) {
        await base44.asServiceRole.entities.Booking.update(transaction.reference_id, {
            payment_status: 'failed',
            status: 'pending'
        });
    }

    // Update escrow if applicable
    if (transaction.transaction_type === 'escrow_payment') {
        const escrows = await base44.asServiceRole.entities.Escrow.filter({
            payment_intent_id: paymentIntent.id
        });
        
        if (escrows.length > 0) {
            await base44.asServiceRole.entities.Escrow.update(escrows[0].id, {
                status: 'cancelled'
            });
        }
    }

    // Notify user
    await base44.asServiceRole.entities.Notification.create({
        user_email: transaction.user_email,
        type: 'payment',
        title: 'Payment Failed',
        message: `Your payment failed: ${errorMessage}. Please try again or contact support.`,
        reference_id: transaction.reference_id
    });

    console.log('✅ Payment failure processed');
}

async function handleChargeRefunded(base44, charge) {
    console.log('💰 Charge refunded:', charge.id);

    // Find original transaction
    const transactions = await base44.asServiceRole.entities.Transaction.filter({
        payment_intent_id: charge.payment_intent
    });

    if (transactions.length === 0) {
        console.log('⚠️  No transaction found for refunded charge:', charge.id);
        return;
    }

    const originalTransaction = transactions[0];
    const refundAmount = charge.amount_refunded / 100; // Convert from cents
    const refundReason = charge.refunds?.data?.[0]?.reason || 'requested_by_customer';
    
    console.log(`Processing refund of $${refundAmount} for transaction ${originalTransaction.id}`);

    // Create refund transaction
    await base44.asServiceRole.entities.Transaction.create({
        user_email: originalTransaction.user_email,
        transaction_type: 'refund',
        amount: refundAmount,
        currency: charge.currency || 'USD',
        status: 'completed',
        payment_intent_id: charge.payment_intent,
        reference_id: originalTransaction.reference_id,
        description: `Refund: ${originalTransaction.description}`,
        receipt_url: charge.refunds?.data?.[0]?.receipt_url,
        metadata: {
            original_transaction_id: originalTransaction.id,
            refund_id: charge.refunds?.data?.[0]?.id,
            refund_reason: refundReason,
            refunded_at: new Date().toISOString()
        }
    });

    // Update original transaction
    await base44.asServiceRole.entities.Transaction.update(originalTransaction.id, {
        status: 'refunded',
        refund_amount: refundAmount,
        refund_reason: refundReason,
        refund_date: new Date().toISOString()
    });

    // Update booking if applicable
    if (originalTransaction.transaction_type === 'booking_payment' && originalTransaction.reference_id) {
        await base44.asServiceRole.entities.Booking.update(originalTransaction.reference_id, {
            payment_status: 'refunded',
            status: 'cancelled',
            refund_amount: refundAmount,
            refund_date: new Date().toISOString()
        });
    }

    // Update escrow if applicable
    if (originalTransaction.transaction_type === 'escrow_payment') {
        const escrows = await base44.asServiceRole.entities.Escrow.filter({
            payment_intent_id: charge.payment_intent
        });
        
        if (escrows.length > 0) {
            await base44.asServiceRole.entities.Escrow.update(escrows[0].id, {
                status: 'cancelled',
                funds_released_date: new Date().toISOString()
            });
        }
    }

    // Notify user
    await base44.asServiceRole.entities.Notification.create({
        user_email: originalTransaction.user_email,
        type: 'payment',
        title: 'Refund Processed',
        message: `A refund of $${refundAmount.toFixed(2)} has been processed to your original payment method. It may take 5-10 business days to appear.`,
        reference_id: originalTransaction.reference_id
    });

    console.log('✅ Refund processed successfully');
}

async function handleCheckoutCompleted(base44, session) {
    console.log('Checkout completed:', session.id);
    
    // Additional handling for checkout sessions if needed
    // This is useful if you're using Stripe Checkout instead of Payment Intents directly
}

async function handleAccountUpdated(base44, account) {
    console.log('Account updated:', account.id);

    // Find payout method for this Stripe account
    const payoutMethods = await base44.asServiceRole.entities.PayoutMethod.filter({
        stripe_account_id: account.id
    });

    if (payoutMethods.length === 0) return;

    const payoutMethod = payoutMethods[0];

    // Check if account is fully verified
    const isVerified = account.charges_enabled && 
                      account.payouts_enabled && 
                      !account.requirements?.currently_due?.length;

    const newStatus = isVerified ? 'verified' : 
                     account.requirements?.disabled_reason ? 'failed' : 
                     'pending_verification';

    // Update payout method status
    await base44.asServiceRole.entities.PayoutMethod.update(payoutMethod.id, {
        status: newStatus,
        verified_date: isVerified ? new Date().toISOString() : null
    });

    // Notify host if verified
    if (isVerified && payoutMethod.status !== 'verified') {
        await base44.asServiceRole.entities.Notification.create({
            user_email: payoutMethod.host_email,
            type: 'payout',
            title: 'Stripe Account Verified',
            message: 'Your Stripe account is now verified and ready to receive payouts!',
        });
    }

    console.log('Account status updated:', newStatus);
}

async function handleTransferEvent(base44, eventType, transfer) {
    console.log(`Transfer event: ${eventType}`, transfer.id);

    // Find payout by transfer ID
    const payouts = await base44.asServiceRole.entities.Payout.filter({
        transaction_id: transfer.id
    });

    if (payouts.length === 0) return;

    const payout = payouts[0];

    if (eventType === 'transfer.failed') {
        // Update payout to failed
        await base44.asServiceRole.entities.Payout.update(payout.id, {
            status: 'failed'
        });

        // Notify host
        await base44.asServiceRole.entities.Notification.create({
            user_email: payout.host_email,
            type: 'payout',
            title: 'Payout Failed',
            message: 'There was an issue processing your payout. Please check your Stripe account.',
            reference_id: payout.id
        });
    }

    console.log('Transfer event processed');
}

async function handleIdentityVerified(base44, session) {
    console.log('✅ Identity verification verified:', session.id);

    const userEmail = session.metadata?.user_email;
    if (!userEmail) {
        console.error('❌ No user email in session metadata');
        return;
    }

    // Get user
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users.length === 0) {
        console.error('❌ User not found:', userEmail);
        return;
    }

    const user = users[0];

    // Update user verification status with correct field name
    await base44.asServiceRole.entities.User.update(user.id, {
        identity_verification_status: 'verified',
        identity_verification_session_id: session.id,
        identity_verification_completed: new Date().toISOString()
    });

    // Notify user with success message
    await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'verification',
        title: 'Identity Verified ✓',
        message: 'Congratulations! Your identity has been successfully verified. You now have a verified badge on your profile.',
        read: false
    });

    console.log('✅ Identity verification completed for:', userEmail);
}

async function handleIdentityFailed(base44, session) {
    console.log('❌ Identity verification failed/cancelled:', session.id);

    const userEmail = session.metadata?.user_email;
    if (!userEmail) {
        console.error('❌ No user email in session metadata');
        return;
    }

    // Get user
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users.length === 0) {
        console.error('❌ User not found:', userEmail);
        return;
    }

    const user = users[0];

    // Update user verification status with correct field name
    await base44.asServiceRole.entities.User.update(user.id, {
        identity_verification_status: 'requires_input',
        identity_verification_session_id: session.id,
        identity_verification_failed_date: new Date().toISOString()
    });

    // Notify user
    await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'verification',
        title: 'Identity Verification Failed',
        message: 'We were unable to verify your identity. Please try again or contact support if you need assistance.',
        read: false
    });

    console.log('❌ Identity verification failed for:', userEmail);
}

    async function handleSubscriptionUpdated(base44, subscription) {
    console.log('Subscription updated:', subscription.id);

    const userEmail = subscription.metadata?.user_email;
    if (!userEmail) {
        console.error('No user email in subscription metadata');
        return;
    }

    // Get user
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users.length === 0) {
        console.error('User not found:', userEmail);
        return;
    }

    const user = users[0];

    // Update user subscription status
    await base44.asServiceRole.entities.User.update(user.id, {
        ai_assistant_subscription_status: subscription.status,
        ai_assistant_subscription_id: subscription.id,
        ai_assistant_trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        ai_assistant_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });

    // Send notification based on status
    if (subscription.status === 'active' && subscription.trial_end) {
        await base44.asServiceRole.entities.Notification.create({
            user_email: userEmail,
            type: 'payment',
            title: 'AI Assistant Trial Started',
            message: 'Your 7-day free trial of AI Chat Assistance has begun. Enjoy all premium features!',
            read: false
        });
    }

    if (subscription.status === 'past_due') {
        await base44.asServiceRole.entities.Notification.create({
            user_email: userEmail,
            type: 'payment',
            title: 'Payment Failed',
            message: 'Your AI Assistant subscription payment failed. Please update your payment method.',
            read: false
        });
    }

    console.log('✅ Subscription updated for:', userEmail);
    }

    async function handleSubscriptionDeleted(base44, subscription) {
    console.log('Subscription deleted:', subscription.id);

    const userEmail = subscription.metadata?.user_email;
    if (!userEmail) return;

    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users.length === 0) return;

    const user = users[0];

    // Update user subscription status
    await base44.asServiceRole.entities.User.update(user.id, {
        ai_assistant_subscription_status: 'none',
        ai_assistant_subscription_id: null,
        ai_assistant_trial_end: null,
        ai_assistant_current_period_end: null
    });

    // Notify user
    await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'payment',
        title: 'AI Assistant Canceled',
        message: 'Your AI Chat Assistance subscription has been canceled. You can resubscribe anytime.',
        read: false
    });

    console.log('✅ Subscription canceled for:', userEmail);
    }

    async function handleTrialWillEnd(base44, subscription) {
    console.log('Trial ending soon:', subscription.id);

    const userEmail = subscription.metadata?.user_email;
    if (!userEmail) return;

    // Notify user
    await base44.asServiceRole.entities.Notification.create({
        user_email: userEmail,
        type: 'payment',
        title: 'Trial Ending Soon',
        message: 'Your AI Assistant free trial ends in 3 days. Your subscription will begin automatically unless you cancel.',
        read: false
    });

    console.log('✅ Trial reminder sent to:', userEmail);
    }