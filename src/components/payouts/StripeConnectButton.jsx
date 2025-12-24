import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeConnectButton({ userEmail, existingStripeMethod }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  const createStripeConnectAccount = useMutation({
    mutationFn: async () => {
      // In production with backend functions:
      // 1. Call backend to create Stripe Connect Express account
      // 2. Backend returns accountId and onboardingUrl
      // 3. Save account to database
      // 4. Redirect user to Stripe onboarding
      
      // Demo implementation:
      const accountId = `acct_demo_${Date.now()}`;
      
      // Save to database
      await base44.entities.PayoutMethod.create({
        host_email: userEmail,
        method_type: 'stripe',
        stripe_account_id: accountId,
        status: 'verified',
        is_default: true,
        verified_date: new Date().toISOString()
      });
      
      return { accountId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-methods']);
      toast.success('Stripe Connect enabled successfully!');
      setIsConnecting(false);
    },
    onError: (error) => {
      toast.error('Failed to connect Stripe: ' + error.message);
      setIsConnecting(false);
    }
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    createStripeConnectAccount.mutate();
  };

  if (existingStripeMethod) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-900">
          Stripe Connect is active and ready to receive payouts
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-sm text-blue-900">
          <strong>Stripe Connect</strong> - Fast, secure payouts with automatic transfers to your bank account
        </AlertDescription>
      </Alert>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-[#635BFF] hover:bg-[#5851ea] text-white"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Connect with Stripe
          </>
        )}
      </Button>
      
      <p className="text-xs text-slate-500 text-center">
        Secure payments powered by Stripe. Your data is encrypted and protected.
      </p>
    </div>
  );
}