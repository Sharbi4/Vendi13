/**
 * Sale Purchase Checkout Session Creation
 * 
 * Webhook Configuration Required:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
 */

import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit, createRateLimitResponse } from './utils/rateLimiter.js';
import { handleCorsPreFlight, addCorsHeaders } from './utils/corsHandler.js';
import { validateRequest, createValidationErrorResponse } from './utils/requestValidator.js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
  maxNetworkRetries: 3, // Automatic retry on network failures
});

// Calculate seller shipping cost
function calculateSellerShippingCost(listing, deliveryMethod, freightDistance) {
    // If freight is paid by seller
    if (deliveryMethod === 'freight' && listing.freight_paid_by === 'seller' && freightDistance) {
        return freightDistance * (listing.freight_rate_per_mile || 4);
    }
    
    // If seller-provided delivery or free shipping (cost absorbed by seller)
    if ((deliveryMethod === 'seller' && listing.seller_delivery_available) ||
        (deliveryMethod === 'free' && listing.delivery_included)) {
        return 0; // Cost absorbed in listing price
    }
    
    return 0;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return handleCorsPreFlight(req);
    }
    
    // Validate request size and content
    const validation = await validateRequest(req, {
      maxSize: 2 * 1024 * 1024, // 2 MB max
      requireJson: true,
      checkHoneypot: true
    });
    
    if (!validation.valid) {
      const errorResponse = createValidationErrorResponse(validation);
      return addCorsHeaders(errorResponse, req);
    }
    
    const base44 = createClientFromRequest(req);
    
    // Rate limiting: 50 requests per minute for authenticated users
    const rateLimit = await checkRateLimit(req, base44, {
      maxRequests: 20,
      windowMs: 60000,
      authenticatedMaxRequests: 50
    });
    
    if (!rateLimit.allowed) {
      return addCorsHeaders(createRateLimitResponse(rateLimit), req);
    }
    
    const user = await base44.auth.me();

    if (!user) {
      const errorResponse = Response.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(errorResponse, req);
    }

    const payload = validation.body;
    
    // Input validation and sanitization
    let { 
      listing_id,
      sale_price,
      delivery_method,
      delivery_address = '',
      freight_distance = null,
      freight_fee = 0,
      buyer_notes = '',
      use_escrow = false
    } = payload;

    // Validate required fields
    if (!listing_id || typeof sale_price !== 'number' || sale_price <= 0) {
      return Response.json({ 
        error: 'Missing or invalid required fields' 
      }, { status: 400 });
    }
    
    // Sanitize string inputs
    listing_id = String(listing_id).trim().substring(0, 100);
    delivery_address = String(delivery_address).trim().substring(0, 500);
    buyer_notes = String(buyer_notes).trim().substring(0, 1000);

    if (!['pickup', 'freight', 'seller', 'free'].includes(delivery_method)) {
      return Response.json({ 
        error: 'Invalid delivery method' 
      }, { status: 400 });
    }

    // Get listing details
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listing_id });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.listing_mode !== 'sale') {
      return Response.json({ error: 'Not a sale listing' }, { status: 400 });
    }

    // Get seller's Stripe Connect account
    const payoutMethods = await base44.asServiceRole.entities.PayoutMethod.filter({ 
      host_email: listing.created_by,
      method_type: 'stripe',
      status: 'verified'
    }, '-created_date', 1);

    const sellerStripeAccount = payoutMethods[0]?.stripe_account_id;

    if (!sellerStripeAccount) {
      return Response.json({ 
        error: 'Seller has not connected their Stripe account yet' 
      }, { status: 400 });
    }

    // Calculate seller shipping cost (deducted from payout)
    const sellerShippingCost = calculateSellerShippingCost(listing, delivery_method, freight_distance);
    
    // Sales: Buyer pays 0%, Seller pays 15% commission + shipping if applicable
    const sellerCommissionRate = 0.15;
    const platformFee = Math.round(sale_price * sellerCommissionRate);
    const totalAmount = sale_price; // Buyer pays listing price only

    // Create escrow record if enabled
    let escrow = null;
    if (use_escrow) {
      escrow = await base44.asServiceRole.entities.Escrow.create({
        listing_id,
        buyer_email: user.email,
        seller_email: listing.created_by,
        amount: sale_price,
        status: 'pending_payment',
      });
    }

    // Create pending transaction record
    const transaction = await base44.asServiceRole.entities.Transaction.create({
      user_email: user.email,
      transaction_type: use_escrow ? 'escrow_payment' : 'sale_purchase',
      amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      reference_id: listing_id,
      description: `Purchase: ${listing.title}`,
      seller_shipping_cost: sellerShippingCost,
      delivery_method: delivery_method,
      metadata: {
        listing_id,
        listing_title: listing.title,
        buyer_email: user.email,
        seller_email: listing.created_by,
        delivery_method,
        freight_distance: freight_distance?.toString() || '0',
        freight_fee: freight_fee?.toString() || '0',
        use_escrow: use_escrow.toString(),
        escrow_id: escrow?.id || '',
        seller_shipping_cost: sellerShippingCost.toString(),
        platform_fee: platformFee.toString(),
        buyer_notes: buyer_notes
      }
    });

    // Create Stripe checkout session with Connect
    // Use idempotency key to prevent duplicate charges
    const idempotencyKey = `sale-${listing_id}-${user.email}-${Date.now()}`;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      automatic_tax: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listing.title,
              description: `Purchase of ${listing.asset_category}`,
              images: listing.media?.length > 0 ? [listing.media[0]] : [],
            },
            unit_amount: Math.round(sale_price * 100),
          },
          quantity: 1,
        }
      ],
      payment_intent_data: {
        // Platform takes 15% commission from seller, buyer pays 0% fee
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: sellerStripeAccount,
        },
        metadata: {
          listing_id,
          buyer_email: user.email,
          seller_email: listing.created_by,
          use_escrow: use_escrow.toString(),
          escrow_id: escrow?.id || '',
          type: 'sale_purchase',
          platform_fee: platformFee,
          seller_commission_rate: '0.15',
          seller_shipping_cost: sellerShippingCost.toString(),
          delivery_method,
          freight_distance: freight_distance?.toString() || '0',
        },
        // If using escrow, hold payment until buyer confirms receipt
        ...(use_escrow ? { capture_method: 'manual' } : {})
      },
      metadata: {
        listing_id,
        buyer_email: user.email,
        seller_email: listing.created_by,
        delivery_method,
        seller_shipping_cost: sellerShippingCost.toString(),
        freight_distance: freight_distance?.toString() || '0',
        freight_fee: freight_fee?.toString() || '0',
        use_escrow: use_escrow.toString(),
        escrow_id: escrow?.id || '',
        transaction_id: transaction.id,
        type: 'sale_purchase'
      },
      success_url: `${req.headers.get('origin')}/SaleSuccess?session_id={CHECKOUT_SESSION_ID}&listing_id=${listing_id}`,
      cancel_url: `${req.headers.get('origin')}/SaleCancel?listing_id=${listing_id}`,
    }, {
      idempotencyKey
    });

    // Update transaction with payment_intent_id once session is created
    await base44.asServiceRole.entities.Transaction.update(transaction.id, {
      payment_intent_id: session.payment_intent
    });

    const successResponse = Response.json({ 
      sessionId: session.id, 
      url: session.url,
      transaction_id: transaction.id,
      escrow_id: escrow?.id 
    });
    
    return addCorsHeaders(successResponse, req);

  } catch (error) {
    console.error('Sale checkout creation error:', error);
    
    // Return specific error for Stripe errors
    if (error.type === 'StripeCardError') {
      return Response.json({ 
        error: 'Card declined',
        details: error.message 
      }, { status: 400 });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return Response.json({ 
        error: 'Invalid request',
        details: error.message 
      }, { status: 400 });
    }
    
    const errorResponse = Response.json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    }, { status: 500 });
    
    return addCorsHeaders(errorResponse, req);
  }
});