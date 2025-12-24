/**
 * Process Refund
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Event: charge.refunded
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            transaction_id, 
            refund_amount, 
            refund_reason, 
            booking_id 
        } = await req.json();

        // Validate inputs
        if (!transaction_id) {
            return Response.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        // Get transaction
        const transactions = await base44.asServiceRole.entities.Transaction.filter({ 
            id: transaction_id 
        });

        if (transactions.length === 0) {
            return Response.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const transaction = transactions[0];

        // Verify user is authorized (admin or listing owner)
        let isAuthorized = user.role === 'admin';
        
        if (!isAuthorized && transaction.reference_id) {
            // Check if user is the host of this booking
            if (booking_id) {
                const bookings = await base44.asServiceRole.entities.Booking.filter({ 
                    id: booking_id 
                });
                if (bookings.length > 0) {
                    const booking = bookings[0];
                    const listings = await base44.asServiceRole.entities.Listing.filter({ 
                        id: booking.listing_id 
                    });
                    if (listings.length > 0 && listings[0].created_by === user.email) {
                        isAuthorized = true;
                    }
                }
            }
        }

        if (!isAuthorized) {
            return Response.json({ error: 'Not authorized to refund this transaction' }, { status: 403 });
        }

        // Check if already refunded
        if (transaction.status === 'refunded') {
            return Response.json({ error: 'Transaction already refunded' }, { status: 400 });
        }

        if (!transaction.payment_intent_id) {
            return Response.json({ error: 'No payment intent found' }, { status: 400 });
        }

        // Calculate refund amount (default to full refund)
        const amountToRefund = refund_amount || transaction.amount;
        const amountInCents = Math.round(amountToRefund * 100);

        // Process refund via Stripe
        const refund = await stripe.refunds.create({
            payment_intent: transaction.payment_intent_id,
            amount: amountInCents,
            reason: refund_reason || 'requested_by_customer',
            metadata: {
                transaction_id: transaction.id,
                refunded_by: user.email,
                booking_id: booking_id || ''
            }
        });

        // Create refund transaction record
        const refundTransaction = await base44.asServiceRole.entities.Transaction.create({
            user_email: transaction.user_email,
            transaction_type: 'refund',
            amount: amountToRefund,
            status: 'completed',
            payment_intent_id: transaction.payment_intent_id,
            reference_id: transaction.reference_id,
            description: `Refund: ${transaction.description}`,
            refund_reason: refund_reason || 'requested_by_customer',
            metadata: {
                original_transaction_id: transaction.id,
                refund_id: refund.id,
                refunded_by: user.email
            }
        });

        // Update original transaction
        await base44.asServiceRole.entities.Transaction.update(transaction.id, {
            status: amountToRefund >= transaction.amount ? 'refunded' : 'completed',
            refund_amount: amountToRefund,
            refund_reason: refund_reason || 'requested_by_customer'
        });

        // Update booking if applicable
        if (booking_id) {
            await base44.asServiceRole.entities.Booking.update(booking_id, {
                payment_status: 'refunded',
                status: 'cancelled',
                refund_amount: amountToRefund,
                refund_date: new Date().toISOString()
            });
        }

        // Send notification to customer
        await base44.asServiceRole.entities.Notification.create({
            user_email: transaction.user_email,
            type: 'booking_cancelled',
            title: 'Refund Processed',
            message: `A refund of $${amountToRefund.toFixed(2)} has been processed to your original payment method.`,
            reference_id: booking_id || transaction.reference_id
        });

        return Response.json({
            success: true,
            refund_id: refund.id,
            amount: amountToRefund,
            transaction_id: refundTransaction.id
        });

    } catch (error) {
        console.error('Refund error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process refund' 
        }, { status: 500 });
    }
});