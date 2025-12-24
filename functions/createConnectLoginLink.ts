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

        // Get user's Stripe account
        const methods = await base44.asServiceRole.entities.PayoutMethod.filter({
            host_email: user.email,
            method_type: 'stripe'
        });

        if (methods.length === 0 || !methods[0].stripe_account_id) {
            return Response.json({ error: 'No Stripe account found' }, { status: 404 });
        }

        // Create login link
        const loginLink = await stripe.accounts.createLoginLink(methods[0].stripe_account_id);

        return Response.json({
            success: true,
            url: loginLink.url
        });

    } catch (error) {
        console.error('Login link error:', error);
        return Response.json({ 
            error: error.message || 'Failed to create login link' 
        }, { status: 500 });
    }
});