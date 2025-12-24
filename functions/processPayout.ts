/**
 * Process Payout
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Events: transfer.created, transfer.failed
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user (admin only for manual payouts)
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { payout_id } = await req.json();

        if (!payout_id) {
            return Response.json({ error: 'Payout ID required' }, { status: 400 });
        }

        // Get payout record
        const payouts = await base44.asServiceRole.entities.Payout.filter({ id: payout_id });
        
        if (payouts.length === 0) {
            return Response.json({ error: 'Payout not found' }, { status: 404 });
        }

        const payout = payouts[0];

        if (payout.status === 'completed') {
            return Response.json({ error: 'Payout already completed' }, { status: 400 });
        }

        // Get host's Stripe Connect account
        const payoutMethods = await base44.asServiceRole.entities.PayoutMethod.filter({
            host_email: payout.host_email,
            method_type: 'stripe',
            status: 'verified'
        });

        if (payoutMethods.length === 0 || !payoutMethods[0].stripe_account_id) {
            // Update payout status to failed
            await base44.asServiceRole.entities.Payout.update(payout.id, {
                status: 'failed'
            });
            return Response.json({ 
                error: 'No verified Stripe account found for host' 
            }, { status: 400 });
        }

        const connectAccountId = payoutMethods[0].stripe_account_id;

        // Get the original payment intent from the booking
        const bookings = await base44.asServiceRole.entities.Booking.filter({
            id: payout.booking_id
        });

        if (bookings.length === 0) {
            return Response.json({ error: 'Booking not found' }, { status: 404 });
        }

        const booking = bookings[0];

        // Create transfer to connected account
        const amountInCents = Math.round(payout.net_amount * 100);

        const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: 'usd',
            destination: connectAccountId,
            transfer_group: booking.payment_intent_id,
            metadata: {
                payout_id: payout.id,
                booking_id: booking.id,
                host_email: payout.host_email
            }
        });

        // Update payout record
        await base44.asServiceRole.entities.Payout.update(payout.id, {
            status: 'completed',
            transaction_id: transfer.id,
            payout_date: new Date().toISOString()
        });

        // Notify host
        await base44.asServiceRole.entities.Notification.create({
            user_email: payout.host_email,
            type: 'payout',
            title: 'Payout Completed',
            message: `$${payout.net_amount.toFixed(2)} has been transferred to your Stripe account.`,
            reference_id: payout.id
        });

        return Response.json({
            success: true,
            transfer_id: transfer.id,
            amount: payout.net_amount,
            payout_id: payout.id
        });

    } catch (error) {
        console.error('Payout error:', error);
        return Response.json({ 
            error: error.message || 'Failed to process payout' 
        }, { status: 500 });
    }
});