/**
 * AI Assistant Subscription Creation
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, customer.subscription.trial_will_end
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user already has an active subscription
        if (user.ai_assistant_subscription_status === 'active' || user.ai_assistant_subscription_status === 'trialing') {
            return Response.json({ 
                error: 'You already have an active AI Assistant subscription' 
            }, { status: 400 });
        }

        const { success_url, cancel_url } = await req.json().catch(() => ({}));

        // Create or retrieve Stripe customer
        let customerId;
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: {
                    user_id: user.id,
                    user_email: user.email
                }
            });
            customerId = customer.id;
        }

        // Create or get AI Assistant product and price
        const products = await stripe.products.list({
            active: true,
            limit: 100
        });
        
        let aiProduct = products.data.find(p => p.name === 'AI Chat Assistant - Monthly');
        
        if (!aiProduct) {
            aiProduct = await stripe.products.create({
                name: 'AI Chat Assistant - Monthly',
                description: 'AI-powered chat assistance for hosts - unlimited responses',
                type: 'service'
            });
        }

        // Get or create recurring price
        const prices = await stripe.prices.list({
            product: aiProduct.id,
            active: true,
            type: 'recurring'
        });

        let monthlyPrice = prices.data.find(p => 
            p.recurring?.interval === 'month' && p.unit_amount === 2000
        );

        if (!monthlyPrice) {
            monthlyPrice = await stripe.prices.create({
                product: aiProduct.id,
                unit_amount: 2000, // $20.00
                currency: 'usd',
                recurring: {
                    interval: 'month'
                }
            });
        }

        // Create checkout session for subscription
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: monthlyPrice.id,
                    quantity: 1,
                }
            ],
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    user_id: user.id,
                    user_email: user.email,
                    feature: 'ai_assistant'
                }
            },
            success_url: success_url || `${req.headers.get('origin')}/ai-assistant-success`,
            cancel_url: cancel_url || `${req.headers.get('origin')}/dashboard`,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                feature: 'ai_assistant'
            }
        });

        return Response.json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Error creating AI assistant subscription:', error);
        return Response.json({ 
            error: 'Failed to create subscription',
            details: error.message 
        }, { status: 500 });
    }
});