/**
 * Featured Listing Subscription Checkout Creation
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
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

        const { listing_id } = await req.json();

        if (!listing_id) {
            return Response.json({ error: 'listing_id required' }, { status: 400 });
        }

        // Verify listing exists and user owns it
        const listings = await base44.asServiceRole.entities.Listing.filter({ id: listing_id });
        if (listings.length === 0) {
            return Response.json({ error: 'Listing not found' }, { status: 404 });
        }

        const listing = listings[0];
        if (listing.created_by !== user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create or get Stripe customer
        let customer;
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
        });

        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: {
                    user_id: user.id,
                    user_email: user.email
                }
            });
        }

        // Create checkout session for featured listing subscription
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Featured Listing',
                        description: 'Boost your listing to the top of search results',
                    },
                    unit_amount: 3000, // $30.00
                    recurring: {
                        interval: 'month',
                        interval_count: 1
                    }
                },
                quantity: 1,
            }],
            success_url: `${req.headers.get('origin')}/FeaturedSuccess?session_id={CHECKOUT_SESSION_ID}&listing_id=${listing_id}`,
            cancel_url: `${req.headers.get('origin')}/Dashboard`,
            metadata: {
                listing_id: listing_id,
                user_email: user.email,
                type: 'featured_listing'
            }
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Checkout creation error:', error);
        return Response.json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        }, { status: 500 });
    }
});