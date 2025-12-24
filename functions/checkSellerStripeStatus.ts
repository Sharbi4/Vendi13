import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id } = await req.json();

    if (!listing_id) {
      return Response.json({ error: 'listing_id required' }, { status: 400 });
    }

    // Get listing
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listing_id });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check seller's Stripe Connect status
    const payoutMethods = await base44.asServiceRole.entities.PayoutMethod.filter({ 
      host_email: listing.created_by,
      method_type: 'stripe',
      status: 'verified'
    }, '-created_date', 1);

    const hasStripeConnected = payoutMethods.length > 0 && payoutMethods[0].stripe_account_id;

    return Response.json({ 
      seller_stripe_connected: hasStripeConnected,
      can_accept_purchases: hasStripeConnected,
      seller_email: listing.created_by
    });

  } catch (error) {
    console.error('Check seller Stripe status error:', error);
    return Response.json({ 
      error: error.message || 'Failed to check seller status' 
    }, { status: 500 });
  }
});