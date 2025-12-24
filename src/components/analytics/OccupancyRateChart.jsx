import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns';

export default function OccupancyRateChart({ bookings, listings, timeRange }) {
  const now = new Date();
  const startDate = subDays(now, timeRange);

  // Calculate occupancy rate per listing
  const occupancyData = listings.map(listing => {
    const listingBookings = bookings.filter(b => 
      b.listing_id === listing.id && 
      ['confirmed', 'active', 'completed'].includes(b.status)
    );

    let bookedDays = 0;
    listingBookings.forEach(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      
      // Calculate overlap with our time range
      const overlapStart = bookingStart > startDate ? bookingStart : startDate;
      const overlapEnd = bookingEnd < now ? bookingEnd : now;
      
      if (overlapStart < overlapEnd) {
        bookedDays += differenceInDays(overlapEnd, overlapStart);
      }
    });

    const occupancyRate = (bookedDays / timeRange * 100).toFixed(1);

    return {
      name: listing.title.length > 20 ? listing.title.substring(0, 20) + '...' : listing.title,
      occupancy: parseFloat(occupancyRate),
      bookedDays,
    };
  }).sort((a, b) => b.occupancy - a.occupancy);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].payload.name}</p>
          <p className="text-sm text-[#FF5124]">Occupancy: {payload[0].value}%</p>
          <p className="text-sm text-slate-600">Booked Days: {payload[0].payload.bookedDays}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Rates</CardTitle>
        <p className="text-sm text-slate-500">Percentage of days booked per listing</p>
      </CardHeader>
      <CardContent>
        {occupancyData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={occupancyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupancy" radius={[0, 8, 8, 0]}>
                {occupancyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.occupancy >= 70 ? '#10B981' : entry.occupancy >= 40 ? '#F59E0B' : '#EF4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}