import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function EarningsReport({ userEmail, listingIds }) {
  const { data: bookings = [] } = useQuery({
    queryKey: ['earnings-bookings', userEmail],
    queryFn: async () => {
      if (!listingIds || listingIds.length === 0) return [];
      const allBookings = await base44.entities.Booking.list('-created_date', 1000);
      return allBookings.filter(b => listingIds.includes(b.listing_id));
    },
    enabled: !!listingIds && listingIds.length > 0,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', userEmail],
    queryFn: async () => {
      return await base44.entities.Payout.filter({ host_email: userEmail }, '-created_date');
    },
    enabled: !!userEmail,
  });

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => ['confirmed', 'active'].includes(b.status));

  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalPayouts = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.net_amount, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.net_amount, 0);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: Clock,
    processing: TrendingUp,
    completed: CheckCircle,
    failed: AlertCircle,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Earnings & Payouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-green-900">${totalEarnings.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-900">${pendingEarnings.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Paid Out</p>
            <p className="text-2xl font-bold text-blue-900">${totalPayouts.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Awaiting Payout</p>
            <p className="text-2xl font-bold text-purple-900">${pendingPayouts.toLocaleString()}</p>
          </div>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions">Transactions ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="payouts">Payout History ({payouts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-3">
            {completedBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No completed bookings yet
              </div>
            ) : (
              completedBookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{booking.guest_name}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">${booking.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{booking.total_days} days</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="payouts" className="space-y-3">
            {payouts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payout history yet
              </div>
            ) : (
              payouts.map((payout) => {
                const StatusIcon = statusIcons[payout.status];
                return (
                  <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[payout.status]}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">${payout.net_amount.toLocaleString()}</p>
                          <Badge className={statusColors[payout.status]}>
                            {payout.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {payout.payout_date ? format(new Date(payout.payout_date), 'MMM d, yyyy') : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Gross: ${payout.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Fee: ${payout.platform_fee?.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}