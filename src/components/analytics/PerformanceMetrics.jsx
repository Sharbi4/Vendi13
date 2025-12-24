import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Star, Eye } from 'lucide-react';
import { subDays } from 'date-fns';

export default function PerformanceMetrics({ bookings, listings, reviews, timeRange }) {
  const now = new Date();
  const startDate = subDays(now, timeRange);

  const filteredBookings = bookings.filter(b => new Date(b.created_date) >= startDate);
  const previousPeriodBookings = bookings.filter(b => {
    const date = new Date(b.created_date);
    return date >= subDays(startDate, timeRange) && date < startDate;
  });

  const totalRevenue = filteredBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const previousRevenue = previousPeriodBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const revenueChange = calculateChange(totalRevenue, previousRevenue);
  const bookingsChange = calculateChange(filteredBookings.length, previousPeriodBookings.length);

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: revenueChange,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Bookings',
      value: filteredBookings.length,
      change: bookingsChange,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average Rating',
      value: avgRating > 0 ? avgRating : 'N/A',
      subtext: `${reviews.length} reviews`,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const hasPositiveChange = metric.change && parseFloat(metric.change) >= 0;

        return (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500">{metric.title}</p>
                <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                {metric.change && (
                  <span className={`flex items-center text-sm ${hasPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                    {hasPositiveChange ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
              {metric.subtext && (
                <p className="text-xs text-slate-500 mt-1">{metric.subtext}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}