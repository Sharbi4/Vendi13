import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, AlertCircle, Loader2, ExternalLink, 
  DollarSign, Shield, TrendingUp, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function StripeConnectSetup({ userEmail }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Check if user has Stripe Connect setup
  const { data: payoutMethods = [], isLoading } = useQuery({
    queryKey: ['payout-methods', userEmail],
    queryFn: async () => {
      return await base44.entities.PayoutMethod.filter({ 
        host_email: userEmail,
        method_type: 'stripe'
      });
    },
    enabled: !!userEmail,
  });

  const stripeMethod = payoutMethods[0];

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const result = await base44.functions.invoke('createConnectAccount', {
        email: userEmail,
        business_type: 'individual',
        refresh_url: window.location.href,
        return_url: window.location.href + '?setup=complete'
      });

      if (result.data?.onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.href = result.data.onboarding_url;
      } else {
        throw new Error('Failed to get onboarding URL');
      }
    } catch (err) {
      console.error('Connect error:', err);
      toast.error('Failed to connect Stripe account');
      setIsConnecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const result = await base44.functions.invoke('createConnectLoginLink', {});
      
      if (result.data?.url) {
        window.open(result.data.url, '_blank');
      } else {
        throw new Error('Failed to get dashboard URL');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to open Stripe dashboard');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check for setup completion
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'complete') {
      toast.success('Stripe account connected successfully!');
      queryClient.invalidateQueries(['payout-methods']);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const STATUS_CONFIG = {
    pending_verification: {
      icon: Clock,
      color: 'bg-amber-100 text-amber-800',
      label: 'Pending Verification',
      description: 'Complete your Stripe onboarding to start receiving payouts'
    },
    verified: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      label: 'Verified',
      description: 'Your Stripe account is ready to receive payouts'
    },
    failed: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      label: 'Verification Failed',
      description: 'There was an issue verifying your account. Please try again'
    }
  };

  const statusConfig = stripeMethod ? STATUS_CONFIG[stripeMethod.status] : null;

  if (!stripeMethod) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF5124]" />
                Connect Stripe for Payouts
              </CardTitle>
              <CardDescription>
                Receive your earnings directly to your bank account via Stripe Connect
              </CardDescription>
            </div>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/5cf23cebe_2ccaeae2261eeb01c76da3d4e6d9e422e42baabb.png" 
              alt="Stripe"
              className="w-16 h-16"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-medium text-sm">Secure</p>
              <p className="text-xs text-slate-600">Bank-level security</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-medium text-sm">Fast</p>
              <p className="text-xs text-slate-600">Instant payouts</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-medium text-sm">Free</p>
              <p className="text-xs text-slate-600">No setup fees</p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-900">
              You'll be redirected to Stripe to securely connect your bank account. 
              This takes about 2-3 minutes to complete.
              <br /><br />
              <strong>Note:</strong> Ensure your Stripe webhook is configured at:
              <br />
              <code className="text-xs bg-white px-2 py-1 rounded">https://vendibook.com/api/webhooks/stripe</code>
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleConnectStripe}
            disabled={isConnecting}
            className="w-full bg-[#635BFF] hover:bg-[#5347E8] h-12 text-base font-medium"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/5cf23cebe_2ccaeae2261eeb01c76da3d4e6d9e422e42baabb.png" 
                  alt="Stripe"
                  className="w-5 h-5 mr-2"
                />
                Connect with Stripe
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5xjwk4hxq4t9vs/Stripe_icon_-_square.svg" 
            alt="Stripe"
            className="w-6 h-6"
          />
          Stripe Connect Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">Account Status</p>
              <p className="text-xs text-slate-600">{statusConfig.description}</p>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        {stripeMethod.status === 'pending_verification' && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              Please complete your Stripe onboarding to start receiving payouts.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {stripeMethod.status === 'pending_verification' && (
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="flex-1 bg-[#635BFF] hover:bg-[#5347E8]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
          
          {stripeMethod.status === 'verified' && (
            <Button
              onClick={handleOpenDashboard}
              className="flex-1 bg-[#635BFF] hover:bg-[#5347E8]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Stripe Dashboard
            </Button>
          )}

          {stripeMethod.status === 'failed' && (
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}