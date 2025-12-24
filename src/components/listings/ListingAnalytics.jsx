import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingAnalytics({ listingId }) {
  // Fetch views for this listing
  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ['listing-views', listingId],
    queryFn: async () => {
      return await base44.entities.ListingView.filter({ listing_id: listingId });
    },
    enabled: !!listingId,
  });

  // Fetch bookings for this listing
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['listing-bookings', listingId],
    queryFn: async () => {
      return await base44.entities.Booking.filter({ listing_id: listingId });
    },
    enabled: !!listingId,
  });

  // Fetch transactions for this listing
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['listing-transactions', listingId],
    queryFn: async () => {
      const allTransactions = await base44.entities.Transaction.list();
      return allTransactions.filter(t => 
        t.metadata?.listing_id === listingId && t.status === 'completed'
      );
    },
    enabled: !!listingId,
  });

  const isLoading = viewsLoading || bookingsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const totalViews = views.length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const conversionRate = totalViews > 0 ? ((confirmedBookings / totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-500 font-normal flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Total Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-500 font-normal flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{confirmedBookings}</p>
          <p className="text-xs text-slate-500">{totalBookings} total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-500 font-normal flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-slate-500 font-normal flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
          <p className="text-xs text-slate-500">views to bookings</p>
        </CardContent>
      </Card>
    </div>
  );
}