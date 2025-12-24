/**
 * Stripe Identity Verification Session Creation
 * Supabase Edge Function
 * 
 * Production Implementation:
 * - Validates Stripe API keys are configured
 * - Creates verification session with document + selfie
 * - Updates user status to 'pending'
 * - Returns client_secret for embedded modal flow
 * 
 * Webhook Configuration Required:
 * URL: https://knhncgvothakiirxicqh.supabase.co/functions/v1/stripe-webhook
 * Events to listen for:
 *   - identity.verification_session.verified
 *   - identity.verification_session.requires_input
 *   - identity.verification_session.canceled
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.5.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://vendibook.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🔐 Identity verification request received');

  try {
    // Validate environment
    if (!STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ User authenticated: ${user.email}`);

    // Get request body
    const body = await req.json().catch(() => ({}));
    const { user_id, user_email } = body;

    // Verify the request is for the authenticated user
    if (user_id && user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Profile fetch error:', profileError);
    }

    // Check if user already verified
    if (userProfile?.identity_verification_status === 'verified') {
      console.log('⚠️ User already verified');
      return new Response(
        JSON.stringify({ error: 'Already verified', status: 'verified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for recent pending session (within last 24 hours)
    if (userProfile?.identity_verification_status === 'pending' &&
        userProfile?.identity_verification_session_id) {
      const startedDate = userProfile.identity_verification_started 
        ? new Date(userProfile.identity_verification_started)
        : null;
      
      if (startedDate) {
        const hoursSinceStart = (Date.now() - startedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceStart < 24) {
          console.log('⚠️ Recent verification session exists, checking status...');
          
          try {
            const existingSession = await stripe.identity.verificationSessions.retrieve(
              userProfile.identity_verification_session_id
            );
            
            // If session is still valid, return its client_secret
            if (existingSession.status === 'requires_input' && existingSession.client_secret) {
              console.log('✅ Returning existing session');
              return new Response(
                JSON.stringify({
                  success: true,
                  client_secret: existingSession.client_secret,
                  session_id: existingSession.id,
                  message: 'Using existing verification session'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (err) {
            console.log('⚠️ Could not retrieve existing session, creating new one');
          }
        }
      }
    }

    console.log('🔄 Creating new Stripe Identity verification session...');

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_email: user.email || user_email || '',
        user_id: user.id,
        full_name: userProfile?.full_name || user.user_metadata?.full_name || '',
        app_name: 'VendiBook',
        created_at: new Date().toISOString()
      },
      options: {
        document: {
          require_matching_selfie: true,
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_id_number: false,
          require_live_capture: true
        }
      },
      return_url: `${APP_URL}/Profile?verification=complete`
    });

    console.log(`✅ Verification session created: ${verificationSession.id}`);

    // Update user record with pending status
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        identity_verification_status: 'pending',
        identity_verification_session_id: verificationSession.id,
        identity_verification_started: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('⚠️ Failed to update user status:', updateError);
      // Don't fail the request, verification session is still valid
    } else {
      console.log('✅ User status updated to pending');
    }

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: verificationSession.client_secret,
        session_id: verificationSession.id,
        status: verificationSession.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Identity verification error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create verification session',
        details: error.type || 'unknown_error',
        code: error.code || 'internal_error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});