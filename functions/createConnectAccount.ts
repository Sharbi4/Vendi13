/**
 * Stripe Connect Account Creation
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Event: account.updated
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

        const { email, business_type, refresh_url, return_url } = await req.json();

        // Check if user already has a Connect account
        const existingMethods = await base44.asServiceRole.entities.PayoutMethod.filter({
            host_email: user.email,
            method_type: 'stripe'
        });

        let accountId;

        if (existingMethods.length > 0 && existingMethods[0].stripe_account_id) {
            accountId = existingMethods[0].stripe_account_id;
        } else {
            // Create Stripe Connect account
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email: email || user.email,
                business_type: business_type || 'individual',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    user_email: user.email,
                    user_id: user.id
                }
            });

            accountId = account.id;

            // Save or update payout method
            if (existingMethods.length > 0) {
                await base44.asServiceRole.entities.PayoutMethod.update(existingMethods[0].id, {
                    stripe_account_id: accountId,
                    status: 'pending_verification'
                });
            } else {
                await base44.asServiceRole.entities.PayoutMethod.create({
                    host_email: user.email,
                    method_type: 'stripe',
                    stripe_account_id: accountId,
                    is_default: true,
                    status: 'pending_verification'
                });
            }
        }

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: refresh_url || `${req.headers.get('origin')}/payouts`,
            return_url: return_url || `${req.headers.get('origin')}/payouts?setup=complete`,
            type: 'account_onboarding',
        });

        return Response.json({
            success: true,
            account_id: accountId,
            onboarding_url: accountLink.url
        });

    } catch (error) {
        console.error('Stripe Connect error:', error);
        return Response.json({ 
            error: error.message || 'Failed to create Connect account' 
        }, { status: 500 });
    }
});