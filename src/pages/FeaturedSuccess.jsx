import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';

export default function FeaturedSuccess() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    processSubscription();
  }, []);

  const processSubscription = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const listingId = urlParams.get('listing_id');

    if (!sessionId || !listingId) {
      setError('Invalid payment session');
      setIsProcessing(false);
      return;
    }

    try {
      // Update listing to featured
      await base44.entities.Listing.update(listingId, {
        featured: true
      });

      // Create transaction record
      const user = await base44.auth.me();
      await base44.entities.Transaction.create({
        user_email: user.email,
        transaction_type: 'addon_payment',
        amount: 30,
        status: 'completed',
        payment_intent_id: sessionId,
        reference_id: listingId,
        description: 'Featured Listing Subscription',
        metadata: {
          listing_id: listingId,
          subscription: true,
          stripe_session_id: sessionId
        }
      });

      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing subscription:', err);
      setError('Failed to activate featured listing');
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF5124] mx-auto mb-4" />
            <p className="text-slate-600">Processing your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Featured Listing Active! 🌟
            </h2>
            <p className="text-slate-600 mb-6">
              Your listing is now featured and will appear at the top of search results for 30 days.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-amber-50 rounded-lg">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-amber-900">Premium visibility activated</span>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="w-full bg-[#FF5124] hover:bg-[#e5481f]"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}