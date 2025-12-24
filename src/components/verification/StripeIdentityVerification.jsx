import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, CheckCircle, Clock, AlertCircle, 
  ExternalLink, FileText, Camera, User, HelpCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import StripeIdentityFAQModal from './StripeIdentityFAQModal';

// Get Stripe publishable key from backend (it knows the secret)
const getStripePublishableKey = async () => {
  try {
    const response = await base44.functions.invoke('getStripePublishableKey', {});
    return response?.data?.publishable_key;
  } catch (err) {
    console.error('Failed to get Stripe key:', err);
    return null;
  }
};

/**
 * Stripe Identity Verification Component
 * 
 * Webhook Configuration:
 * URL: https://vendibook.com/api/webhooks/stripe
 * Events: identity.verification_session.verified, identity.verification_session.requires_input
 */
export default function StripeIdentityVerification({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [showFAQ, setShowFAQ] = useState(false);
  const queryClient = useQueryClient();

  // Load Stripe.js on component mount
  useEffect(() => {
    const initStripe = async () => {
      try {
        const publishableKey = await getStripePublishableKey();
        if (!publishableKey) {
          console.error('❌ No Stripe publishable key available');
          toast.error('Unable to load verification service. Please contact support.');
          return;
        }
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
        console.log('✅ Stripe.js loaded');
      } catch (err) {
        console.error('❌ Failed to load Stripe.js:', err);
        toast.error('Failed to initialize verification. Please refresh the page.');
      }
    };
    initStripe();
  }, []);

  // Check if user has verification record - refetch from server
  const { data: verificationStatus } = useQuery({
    queryKey: ['identity-verification', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      // Fetch fresh user data to get latest verification status
      const freshUser = await base44.auth.me();
      return freshUser.identity_verification_status || null;
    },
    enabled: !!user?.email,
    refetchInterval: 3000, // Poll every 3 seconds for status updates
  });

  const startVerification = useMutation({
    mutationFn: async () => {
      if (!stripe) {
        throw new Error('Stripe.js not loaded yet. Please try again.');
      }

      console.log('🔐 Starting identity verification...');
      
      // Create verification session on backend
      const result = await base44.functions.invoke('createIdentityVerification', {});
      
      console.log('Verification result:', result);
      
      if (!result?.data?.client_secret) {
        throw new Error(result?.data?.error || 'Failed to create verification session');
      }
      
      return result.data;
    },
    onSuccess: async (data) => {
      console.log('✅ Verification session created:', data.session_id);
      
      try {
        // Show the verification modal using Stripe.js
        const { error } = await stripe.verifyIdentity(data.client_secret);
        
        if (error) {
          // Handle modal errors
          console.error('❌ Verification modal error:', error);
          
          // Handle specific error codes
          switch (error.code) {
            case 'consent_declined':
              toast.error('Verification declined. Identity verification is required to continue.');
              break;
            case 'device_unsupported':
              toast.error('Your device does not have a camera. Please use a device with a camera.');
              break;
            case 'under_supported_age':
              toast.error('You must be of legal age to use this service.');
              break;
            case 'phone_otp_declined':
            case 'email_verification_declined':
              toast.error('Unable to verify your contact information. Please try again.');
              break;
            default:
              toast.error(error.message || 'Verification failed. Please try again.');
          }
        } else {
          // Success! Document submitted
          console.log('✅ Verification submitted successfully');
          toast.success('Identity document submitted! Processing your verification...');
          
          // Refresh user data to show pending status
          queryClient.invalidateQueries(['identity-verification']);
          queryClient.invalidateQueries(['fresh-user']);
          
          // Poll for verification result
          setTimeout(() => {
            queryClient.invalidateQueries(['identity-verification']);
          }, 3000);
        }
      } catch (err) {
        console.error('❌ Verification error:', err);
        toast.error('An error occurred during verification. Please try again.');
      }
    },
    onError: (error) => {
      console.error('❌ Verification setup error:', error);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to start verification';
      toast.error(errorMessage);
      
      // If already verified, refresh to show status
      if (errorMessage.includes('Already verified')) {
        setTimeout(() => {
          queryClient.invalidateQueries(['identity-verification']);
          window.location.reload();
        }, 2000);
      }
    },
  });

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-100 text-green-800',
          title: 'Identity Verified',
          description: 'Your identity has been successfully verified with Stripe Identity.',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeColor: 'bg-amber-100 text-amber-800',
          title: 'Verification Pending',
          description: 'Your identity verification is being processed. This usually takes a few minutes.',
        };
      case 'failed':
      case 'requires_input':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-100 text-red-800',
          title: 'Verification Failed',
          description: 'We were unable to verify your identity. Please try again or contact support.',
        };
      default:
        return {
          icon: Shield,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          badgeColor: 'bg-slate-100 text-slate-800',
          title: 'Identity Not Verified',
          description: 'Verify your identity to increase trust and unlock premium features.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Card className="border-2 border-slate-800 bg-black">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
              <StatusIcon className="w-6 h-6 text-[#FF5124]" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{statusConfig.title}</CardTitle>
              <CardDescription className="mt-1 text-slate-400">{statusConfig.description}</CardDescription>
            </div>
          </div>
          <Badge className="bg-slate-800 text-white border-slate-700">
            {verificationStatus || 'Not Started'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Why Verify */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h4 className="text-sm font-semibold text-white mb-3">Why verify your identity?</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-[#FF5124] mt-0.5 flex-shrink-0" />
              <span>Get a verified host/user badge on your profile and listings</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-[#FF5124] mt-0.5 flex-shrink-0" />
              <span>Build trust with potential renters and buyers</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-[#FF5124] mt-0.5 flex-shrink-0" />
              <span>Increase booking conversion rates</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-[#FF5124] mt-0.5 flex-shrink-0" />
              <span>This step is optional but highly recommended</span>
            </li>
          </ul>
        </div>

        {/* What You'll Need */}
        {!verificationStatus && (
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900">
            <h4 className="text-sm font-semibold text-white mb-3">What you'll need:</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FileText className="w-4 h-4 text-[#FF5124]" />
                <span>Government-issued ID</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Camera className="w-4 h-4 text-[#FF5124]" />
                <span>Selfie for verification</span>
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
            <p className="leading-relaxed">
              Your verification is powered by <strong className="text-white">Stripe Identity</strong>, a secure and compliant identity verification service. Your personal information is encrypted and never shared with third parties.
            </p>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        {verificationStatus === 'verified' ? (
          <Button variant="outline" className="w-full rounded-xl bg-slate-900 border-slate-700 text-white" disabled>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verified
          </Button>
        ) : verificationStatus === 'pending' ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full rounded-xl bg-slate-900 border-slate-700 text-white" disabled>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
            <p className="text-xs text-center text-slate-400">
              Check back in a few minutes. We'll notify you once verified.
            </p>
          </div>
        ) : (
          <Button
            onClick={() => startVerification.mutate()}
            disabled={startVerification.isPending || !stripe}
            className="w-full rounded-xl h-14 bg-[#FF5124] hover:bg-[#e5481f] text-white font-semibold text-base disabled:opacity-50 transition-all"
          >
            {startVerification.isPending || !stripe ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Start Verification
              </>
            )}
          </Button>
        )}

        {(verificationStatus === 'failed' || verificationStatus === 'requires_input') && (
          <div className="space-y-2">
            <Button
              onClick={() => startVerification.mutate()}
              disabled={startVerification.isPending || !stripe}
              className="w-full rounded-xl bg-[#FF5124] hover:bg-[#e5481f] text-white"
            >
              {startVerification.isPending || !stripe ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
              onClick={() => window.open('mailto:support@vendibook.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        )}

        {/* FAQ Link */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowFAQ(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-[#FF5124] hover:text-[#e5481f] font-medium"
          >
            <HelpCircle className="w-4 h-4" />
            Have questions about Stripe Identity?
          </button>
          <p className="text-xs text-center text-slate-400">
            Learn more about our{' '}
            <a 
              href={createPageUrl('StripeIdentityFAQ')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FF5124] hover:underline"
            >
              identity verification process
            </a>
          </p>
        </div>
      </CardContent>
    </Card>

    {/* FAQ Modal */}
    <StripeIdentityFAQModal open={showFAQ} onClose={() => setShowFAQ(false)} />
  </>
  );
}