import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, CheckCircle, Clock, AlertCircle, 
  ExternalLink, FileText, Camera, User, HelpCircle, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import StripeIdentityFAQModal from './StripeIdentityFAQModal';

// Stripe publishable key - should be in env
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * Production-Ready Stripe Identity Verification Component
 * 
 * Features:
 * - Embedded modal verification flow
 * - Real-time status polling
 * - Comprehensive error handling
 * - Accessible UI with proper ARIA labels
 * - Dark theme support
 */
export default function StripeIdentityVerification({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [stripeError, setStripeError] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const queryClient = useQueryClient();

  // Load Stripe.js on mount
  useEffect(() => {
    const initStripe = async () => {
      if (!STRIPE_PUBLISHABLE_KEY) {
        console.error('Stripe publishable key not configured');
        setStripeError('Verification service unavailable. Please contact support.');
        return;
      }
      
      try {
        const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        if (!stripeInstance) {
          throw new Error('Failed to initialize Stripe');
        }
        setStripe(stripeInstance);
        setStripeError(null);
      } catch (err) {
        console.error('Failed to load Stripe.js:', err);
        setStripeError('Failed to load verification service. Please refresh the page.');
      }
    };
    
    initStripe();
  }, []);

  // Fetch current verification status from database
  const { data: verificationData, refetch: refetchStatus } = useQuery({
    queryKey: ['identity-verification', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('identity_verification_status, identity_verification_session_id, identity_verification_completed')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching verification status:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: (data) => {
      // Poll every 3 seconds while pending, stop when verified/failed
      if (data?.identity_verification_status === 'pending') {
        return 3000;
      }
      return false;
    },
  });

  const verificationStatus = verificationData?.identity_verification_status || user?.identity_verification_status;

  // Create verification session via Edge Function
  const startVerification = useMutation({
    mutationFn: async () => {
      if (!stripe) {
        throw new Error('Verification service not ready. Please try again.');
      }

      setIsLoading(true);

      // Call Supabase Edge Function to create verification session
      const { data, error } = await supabase.functions.invoke('create-identity-verification', {
        body: { user_id: user.id, user_email: user.email }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create verification session');
      }

      if (!data?.client_secret) {
        throw new Error(data?.error || 'Invalid response from verification service');
      }

      return data;
    },
    onSuccess: async (data) => {
      try {
        // Open Stripe Identity modal
        const { error } = await stripe.verifyIdentity(data.client_secret);

        if (error) {
          handleStripeError(error);
        } else {
          // Success - document submitted
          toast.success('Identity verification submitted! We\'ll notify you once verified.');
          
          // Update local status immediately
          queryClient.setQueryData(['identity-verification', user?.id], {
            ...verificationData,
            identity_verification_status: 'pending'
          });
          
          // Refetch to get server status
          setTimeout(() => refetchStatus(), 2000);
        }
      } catch (err) {
        console.error('Verification modal error:', err);
        toast.error('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Verification setup error:', error);
      
      const message = error.message || 'Failed to start verification';
      
      if (message.includes('already verified')) {
        toast.info('Your identity is already verified!');
        refetchStatus();
      } else {
        toast.error(message);
      }
    },
  });

  // Handle Stripe-specific errors
  const handleStripeError = useCallback((error) => {
    const errorMessages = {
      'consent_declined': 'Verification cancelled. You can try again anytime.',
      'device_unsupported': 'Your device doesn\'t support camera access. Please try on a different device.',
      'under_supported_age': 'You must be of legal age to complete verification.',
      'phone_otp_declined': 'Phone verification failed. Please try again.',
      'email_verification_declined': 'Email verification failed. Please try again.',
      'session_expired': 'Session expired. Please start a new verification.',
    };

    const message = errorMessages[error.code] || error.message || 'Verification failed. Please try again.';
    toast.error(message);
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    refetchStatus();
    toast.info('Checking verification status...');
  }, [refetchStatus]);

  // Status configuration
  const getStatusConfig = useCallback(() => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
          title: 'Identity Verified',
          description: 'Your identity has been successfully verified. You now have a verified badge.',
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: 'Verification In Progress',
          description: 'Your verification is being processed. This usually takes a few minutes.',
        };
      case 'requires_input':
      case 'failed':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
          title: 'Verification Failed',
          description: 'We couldn\'t verify your identity. Please try again or contact support.',
        };
      default:
        return {
          icon: Shield,
          iconColor: 'text-[#FF5124]',
          bgColor: 'bg-slate-800',
          borderColor: 'border-slate-700',
          badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
          title: 'Verify Your Identity',
          description: 'Get a verified badge to build trust with renters and buyers.',
        };
    }
  }, [verificationStatus]);

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const isVerified = verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';
  const canRetry = verificationStatus === 'failed' || verificationStatus === 'requires_input';

  return (
    <>
      <Card className="border-2 border-slate-800 bg-black overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center border ${statusConfig.borderColor}`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-white">{statusConfig.title}</CardTitle>
                <CardDescription className="mt-1 text-slate-400">
                  {statusConfig.description}
                </CardDescription>
              </div>
            </div>
            <Badge className={statusConfig.badgeClass} variant="outline">
              {verificationStatus ? verificationStatus.replace('_', ' ') : 'Not Started'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {stripeError && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {stripeError}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits Section */}
          {!isVerified && (
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <h4 className="text-sm font-semibold text-white mb-3">Why verify your identity?</h4>
              <ul className="space-y-2">
                {[
                  'Get a verified badge on your profile and listings',
                  'Build trust with potential renters and buyers',
                  'Increase your booking conversion rates',
                  'Access premium host features'
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-[#FF5124] mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements Section */}
          {!verificationStatus && !stripeError && (
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900">
              <h4 className="text-sm font-semibold text-white mb-3">What you'll need:</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <FileText className="w-4 h-4 text-[#FF5124]" />
                  <span>Government-issued ID</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Camera className="w-4 h-4 text-[#FF5124]" />
                  <span>Camera for selfie</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="w-4 h-4 text-[#FF5124]" />
                  <span>Personal information</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-[#FF5124]" />
                  <span>~5 minutes to complete</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <Alert className="bg-slate-900 border-slate-800">
            <Shield className="h-4 w-4 text-[#FF5124] flex-shrink-0" />
            <AlertDescription className="text-xs text-slate-300">
              Powered by <strong className="text-white">Stripe Identity</strong> — your data is encrypted and never shared with third parties.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isVerified ? (
              <Button 
                variant="outline" 
                className="w-full rounded-xl bg-green-500/10 border-green-500/30 text-green-400 cursor-default"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Identity Verified
              </Button>
            ) : isPending ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl bg-slate-900 border-slate-700 text-white"
                  disabled
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Verification...
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-slate-400">
                    This usually takes a few minutes.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="text-xs text-[#FF5124] hover:text-[#e5481f] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => startVerification.mutate()}
                disabled={isLoading || !stripe || !!stripeError}
                className="w-full rounded-xl h-14 bg-[#FF5124] hover:bg-[#e5481f] text-white font-semibold text-base disabled:opacity-50 transition-all"
                aria-label={canRetry ? 'Retry identity verification' : 'Start identity verification'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Verification...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    {canRetry ? 'Try Again' : 'Start Verification'}
                  </>
                )}
              </Button>
            )}

            {/* Support Link for Failed Status */}
            {canRetry && (
              <Button
                variant="outline"
                className="w-full rounded-xl bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                onClick={() => window.open('mailto:support@vendibook.com?subject=Identity%20Verification%20Help', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            )}
          </div>

          {/* FAQ Link */}
          <div className="pt-2">
            <button
              onClick={() => setShowFAQ(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#FF5124] hover:text-[#e5481f] font-medium transition-colors"
              aria-label="Open identity verification FAQ"
            >
              <HelpCircle className="w-4 h-4" />
              Questions about Stripe Identity?
            </button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Modal */}
      <StripeIdentityFAQModal 
        open={showFAQ} 
        onClose={() => setShowFAQ(false)} 
      />
    </>
  );
}
