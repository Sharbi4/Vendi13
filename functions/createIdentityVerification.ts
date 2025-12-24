/**
 * Stripe Identity Verification Session Creation
 * 
 * Production Implementation:
 * - Validates Stripe API keys are configured
 * - Creates verification session with document + selfie
 * - Updates user status to 'pending'
 * - Returns hosted verification URL
 * 
 * Webhook Configuration Required:
 * URL: https://[your-domain]/api/webhooks/stripe
 * Events to listen for:
 *   - identity.verification_session.verified
 *   - identity.verification_session.requires_input
 *   - identity.verification_session.canceled
 * 
 * Stripe Dashboard Setup:
 * 1. Enable Stripe Identity in Dashboard → Settings → Identity
 * 2. Configure webhook endpoint with the events above
 * 3. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';
import { checkRateLimit, createRateLimitResponse } from './utils/rateLimiter.js';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://vendibook.com';

if (!STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not configured');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
    console.log('🔐 Identity verification request received');
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Rate limiting: 10 verification attempts per hour
        const rateLimit = await checkRateLimit(req, base44, {
            maxRequests: 5,
            windowMs: 3600000, // 1 hour
            authenticatedMaxRequests: 10
        });
        
        if (!rateLimit.allowed) {
            return createRateLimitResponse(rateLimit);
        }
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            console.error('❌ Unauthorized request');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`✅ User authenticated: ${user.email}`);

        // Check if user already has a pending or verified session
        if (user.identity_verification_status === 'verified') {
            console.log('⚠️  User already verified');
            return Response.json({
                error: 'Already verified',
                status: 'verified'
            }, { status: 400 });
        }

        // Check if there's a recent pending session (within last 24 hours)
        if (user.identity_verification_status === 'pending' && 
            user.identity_verification_started) {
            const startedDate = new Date(user.identity_verification_started);
            const hoursSinceStart = (Date.now() - startedDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceStart < 24) {
                console.log('⚠️  Recent verification session already exists');
                
                // Try to retrieve the existing session
                try {
                    const existingSession = await stripe.identity.verificationSessions.retrieve(
                        user.identity_verification_session_id
                    );
                    
                    // If session is still valid, return it
                    if (existingSession.status === 'requires_input') {
                        console.log('✅ Returning existing session');
                        return Response.json({
                            success: true,
                            url: existingSession.url,
                            session_id: existingSession.id,
                            message: 'Using existing verification session'
                        });
                    }
                } catch (err) {
                    console.log('⚠️  Could not retrieve existing session, creating new one');
                }
            }
        }

        console.log('🔄 Creating new Stripe Identity verification session...');

        // Create Stripe Identity verification session
        const verificationSession = await stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: {
                user_email: user.email,
                user_id: user.id,
                full_name: user.full_name || '',
                app_name: 'Vendibook',
                created_at: new Date().toISOString()
            },
            options: {
                document: {
                    // Require selfie to match document photo
                    require_matching_selfie: true,
                    // Accept driver's license, passport, or ID card
                    allowed_types: ['driving_license', 'passport', 'id_card'],
                    // Don't require ID number (optional)
                    require_id_number: false,
                    // Require live camera capture (not uploaded photo)
                    require_live_capture: true
                }
            },
            // Return user to Profile page after completion
            return_url: `${APP_URL}/Profile?session_id={VERIFICATION_SESSION_ID}`
        });

        console.log(`✅ Verification session created: ${verificationSession.id}`);
        console.log(`📱 Verification URL: ${verificationSession.url}`);
        console.log(`🔑 Client Secret: ${verificationSession.client_secret.substring(0, 20)}...`);

        // Update user record with pending status
        await base44.auth.updateMe({
            identity_verification_status: 'pending',
            identity_verification_session_id: verificationSession.id,
            identity_verification_started: new Date().toISOString(),
        });

        console.log('✅ User status updated to pending');

        return Response.json({
            success: true,
            client_secret: verificationSession.client_secret,
            url: verificationSession.url,
            session_id: verificationSession.id,
            status: verificationSession.status
        });

    } catch (error) {
        console.error('❌ Identity verification error:', error);
        
        // Provide detailed error information
        return Response.json({ 
            error: error.message || 'Failed to create verification session',
            details: error.type || 'unknown_error',
            code: error.code || 'internal_error'
        }, { status: 500 });
    }
});