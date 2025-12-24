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

        if (!user.ai_assistant_subscription_id) {
            return Response.json({ 
                error: 'No active subscription found' 
            }, { status: 400 });
        }

        // Cancel subscription at period end
        const subscription = await stripe.subscriptions.update(
            user.ai_assistant_subscription_id,
            { cancel_at_period_end: true }
        );

        // Update user record
        await base44.asServiceRole.entities.User.update(user.id, {
            ai_assistant_subscription_status: 'canceled'
        });

        return Response.json({ 
            success: true,
            message: 'Subscription will be canceled at the end of the current billing period',
            cancel_at: new Date(subscription.cancel_at * 1000).toISOString()
        });

    } catch (error) {
        console.error('Error canceling subscription:', error);
        return Response.json({ 
            error: 'Failed to cancel subscription',
            details: error.message 
        }, { status: 500 });
    }
});