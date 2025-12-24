import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import Header from '../components/layout/Header';
import PayoutMethodsManager from '../components/payouts/PayoutMethodsManager';
import PayoutHistory from '../components/payouts/PayoutHistory';
import EarningsReport from '../components/dashboard/EarningsReport';
import StripeConnectSetup from '../components/payouts/StripeConnectSetup';

export default function PayoutsPage() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin();
        return;
      }
      setIsAuthenticated(authenticated);
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Auth error:', error);
      base44.auth.redirectToLogin();
    }
  };

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Listing.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Payout.filter({ host_email: user.email });
    },
    enabled: !!user?.email,
  });

  // Calculate quick stats
  const pendingAmount = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.net_amount || 0), 0);

  const availableAmount = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.net_amount || 0), 0);

  const totalEarnings = payouts.reduce((sum, p) => sum + (p.net_amount || 0), 0);

  // Loading state - render after all hooks
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Payouts & Earnings
            </h1>
            <p className="text-slate-500">Manage your payout methods and track earnings</p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Pending Payouts</p>
                    <p className="text-2xl font-bold text-amber-600">
                      ${pendingAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${availableAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="connect" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="connect" className="flex items-center gap-2">
                <img 
                  src="https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5xjwk4hxq4t9vs/Stripe_icon_-_square.svg" 
                  alt="Stripe"
                  className="w-4 h-4"
                />
                Stripe Connect
              </TabsTrigger>
              <TabsTrigger value="methods" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Methods
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Earnings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connect">
              <StripeConnectSetup userEmail={user?.email} />
            </TabsContent>

            <TabsContent value="methods">
              <Card>
                <CardContent className="p-6">
                  <PayoutMethodsManager userEmail={user?.email} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <PayoutHistory
                userEmail={user?.email}
                listingIds={myListings.map(l => l.id)}
              />
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsReport
                userEmail={user?.email}
                listingIds={myListings.map(l => l.id)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}