import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, Eye, MessageSquare, Calendar, 
  DollarSign, Star, ArrowUp, ArrowDown 
} from 'lucide-react';

export default function AnalyticsOverview({ userEmail, listings }) {
  const listingIds = listings.map(l => l.id);

  const { data: views = [] } = useQuery({
    queryKey: ['listing-views', userEmail],
    queryFn: async () => {
      if (listingIds.length === 0) return [];
      const allViews = await base44.entities.ListingView.list('-created_date', 1000);
      return allViews.filter(v => listingIds.includes(v.listing_id));
    },
    enabled: listingIds.length > 0,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['host-bookings', userEmail],
    queryFn: async () => {
      if (listingIds.length === 0) return [];
      const allBookings = await base44.entities.Booking.list('-created_date', 1000);
      return allBookings.filter(b => listingIds.includes(b.listing_id));
    },
    enabled: listingIds.length > 0,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['host-conversations', userEmail],
    queryFn: async () => {
      return await base44.entities.Conversation.filter({ host_email: userEmail });
    },
    enabled: !!userEmail,
  });

  const totalViews = views.length;
  const totalInquiries = conversations.length;
  const totalBookings = bookings.filter(b => ['confirmed', 'active', 'completed'].includes(b.status)).length;
  const bookingRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : 0;
  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Calculate 30-day views
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentViews = views.filter(v => new Date(v.created_date) >= thirtyDaysAgo).length;

  const stats = [
    {
      label: 'Total Views',
      value: totalViews,
      change: `+${recentViews} this month`,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    {
      label: 'Inquiries',
      value: totalInquiries,
      change: `${conversations.filter(c => c.unread_count_host > 0).length} unread`,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Bookings',
      value: totalBookings,
      change: `${bookingRate}% conversion`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: bookingRate > 5 ? 'up' : 'neutral'
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      change: `${bookings.filter(b => b.status === 'pending').length} pending`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-slate-400'}`}>
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}