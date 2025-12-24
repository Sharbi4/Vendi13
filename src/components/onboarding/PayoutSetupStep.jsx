import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CheckCircle } from 'lucide-react';
import StripeConnectButton from '../payouts/StripeConnectButton';

export default function PayoutSetupStep({ user, onComplete, onSkip }) {
  const { data: payoutMethods = [] } = useQuery({
    queryKey: ['payout-methods', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.PayoutMethod.filter({ host_email: user.email });
    },
    enabled: !!user?.email,
  });

  const hasStripeConnected = payoutMethods.some(
    m => m.method_type === 'stripe' && m.status === 'verified'
  );

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Set Up Payments
        </CardTitle>
        <p className="text-sm text-slate-500">Connect Stripe to receive payouts</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Why Connect Stripe?</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Automatic payouts directly to your bank account</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Secure, encrypted payment processing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Fast transfers - typically within 2 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Professional payment tracking and reporting</span>
            </li>
          </ul>
        </div>

        <StripeConnectButton 
          userEmail={user?.email} 
          existingStripeMethod={payoutMethods.find(m => m.method_type === 'stripe')}
        />

        {hasStripeConnected && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Stripe Connected Successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You're ready to receive payments from your bookings
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Set Up Later
          </Button>
          <Button
            onClick={onComplete}
            disabled={!hasStripeConnected}
            className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500">
          You can always add or change payment methods later in your dashboard
        </p>
      </CardContent>
    </>
  );
}