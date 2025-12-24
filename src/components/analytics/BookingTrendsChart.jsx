import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subDays, format, eachDayOfInterval, startOfDay } from 'date-fns';

export default function BookingTrendsChart({ bookings, timeRange }) {
  const now = new Date();
  const startDate = subDays(now, timeRange);

  // Generate all dates in range
  const dateRange = eachDayOfInterval({ start: startDate, end: now });

  // Count bookings per day
  const bookingsByDate = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = bookings.filter(b => {
      const bookingDate = format(new Date(b.created_date), 'yyyy-MM-dd');
      return bookingDate === dateStr;
    });

    return {
      date: format(date, 'MMM dd'),
      bookings: dayBookings.length,
      revenue: dayBookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].payload.date}</p>
          <p className="text-sm text-blue-600">Bookings: {payload[0].value}</p>
          <p className="text-sm text-green-600">Revenue: ${payload[1].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Trends</CardTitle>
        <p className="text-sm text-slate-500">Daily bookings and revenue over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={bookingsByDate}>
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="bookings"
              stroke="#3B82F6"
              fill="url(#colorBookings)"
              name="Bookings"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              fill="url(#colorRevenue)"
              name="Revenue ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}