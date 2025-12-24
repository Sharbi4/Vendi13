/**
 * Booking Checkout Session Creation
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
      start_date,
      end_date,
      total_days,
      base_price,
      delivery_fee = 0,
      cleaning_fee = 0,
      security_deposit = 0,
      service_fee = 0,
      total_amount,
      delivery_requested = false,
      delivery_address = '',
      special_requests = ''
    } = payload;

    // Validate required fields
    if (!listing_id || !start_date || !end_date || !total_days || typeof base_price !== 'number') {
      return Response.json({ 
        error: 'Missing or invalid required fields' 
      }, { status: 400 });
    }
    
    // Sanitize string inputs
    listing_id = String(listing_id).trim().substring(0, 100);
    delivery_address = String(delivery_address).trim().substring(0, 500);
    special_requests = String(special_requests).trim().substring(0, 1000);

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return Response.json({ 
        error: 'Invalid date range' 
      }, { status: 400 });
    }

    // Validate positive amounts
    if (base_price < 0 || delivery_fee < 0 || cleaning_fee < 0 || security_deposit < 0) {
      return Response.json({ 
        error: 'Amounts must be positive' 
      }, { status: 400 });
    }

    // Get listing details
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listing_id });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Get host's Stripe Connect account
    const payoutMethods = await base44.asServiceRole.entities.PayoutMethod.filter({ 
      host_email: listing.created_by,
      method_type: 'stripe',
      status: 'verified'
    }, '-created_date', 1);

    const hostStripeAccount = payoutMethods[0]?.stripe_account_id;

    if (!hostStripeAccount) {
      return Response.json({ 
        error: 'Host has not connected their Stripe account yet' 
      }, { status: 400 });
    }

    // Calculate platform fees
    // Host pays 12.9% commission, renter pays 12.9% service fee
    const hostCommissionRate = 0.129;
    const renterServiceFeeRate = 0.129;
    
    const hostPortion = base_price + delivery_fee + cleaning_fee + security_deposit;
    const hostCommission = Math.round(hostPortion * hostCommissionRate);
    const renterServiceFee = Math.round(hostPortion * renterServiceFeeRate);
    
    const totalWithFees = hostPortion + renterServiceFee;
    const platformTotalFee = hostCommission + renterServiceFee;

    // Create booking record first
    const booking = await base44.asServiceRole.entities.Booking.create({
      listing_id,
      guest_email: user.email,
      guest_name: user.full_name,
      guest_phone: user.phone || '',
      start_date,
      end_date,
      total_days,
      base_price,
      delivery_fee,
      cleaning_fee,
      security_deposit,
      service_fee: renterServiceFee,
      total_amount: totalWithFees,
      status: 'pending',
      payment_status: 'pending',
      delivery_requested,
      delivery_address,
      special_requests
    });

    // Create pending transaction record
    const transaction = await base44.asServiceRole.entities.Transaction.create({
      user_email: user.email,
      transaction_type: 'booking_payment',
      amount: totalWithFees,
      currency: 'USD',
      status: 'pending',
      reference_id: booking.id,
      description: `Booking: ${listing.title} (${start_date} to ${end_date})`,
      metadata: {
        booking_id: booking.id,
        listing_id,
        listing_title: listing.title,
        guest_email: user.email,
        host_email: listing.created_by,
        start_date,
        end_date,
        total_days,
        base_price,
        delivery_fee,
        cleaning_fee,
        security_deposit,
        service_fee: renterServiceFee,
        host_commission: hostCommission,
      }
    });

    // Create Stripe checkout session with Connect
    // Use idempotency key to prevent duplicate charges
    const idempotencyKey = `booking-${listing_id}-${user.email}-${Date.now()}`;
    
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
              name: `Rental: ${listing.title}`,
              description: `${total_days} day rental from ${start_date} to ${end_date}`,
            },
            unit_amount: Math.round(hostPortion * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: { 
              name: 'Service Fee',
              description: 'Vendibook platform fee (12.9%)'
            },
            unit_amount: Math.round(renterServiceFee * 100),
          },
          quantity: 1,
        }
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(platformTotalFee * 100),
        transfer_data: {
          destination: hostStripeAccount,
        },
        metadata: {
          booking_id: booking.id,
          listing_id,
          user_email: user.email,
          host_email: listing.created_by,
          type: 'booking_payment',
          host_commission: hostCommission,
          renter_service_fee: renterServiceFee,
        }
      },
      metadata: {
        booking_id: booking.id,
        listing_id,
        user_email: user.email,
        host_email: listing.created_by,
        transaction_id: transaction.id,
        type: 'booking_payment'
      },
      success_url: `${req.headers.get('origin')}/BookingSuccess?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${req.headers.get('origin')}/BookingCancel?booking_id=${booking.id}`,
    }, {
      idempotencyKey
    });

    // Update transaction with payment_intent_id
    await base44.asServiceRole.entities.Transaction.update(transaction.id, {
      payment_intent_id: session.payment_intent
    });

    const successResponse = Response.json({ 
      sessionId: session.id, 
      url: session.url,
      booking_id: booking.id,
      transaction_id: transaction.id
    });
    
    return addCorsHeaders(successResponse, req);

  } catch (error) {
    console.error('Checkout creation error:', error);
    
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