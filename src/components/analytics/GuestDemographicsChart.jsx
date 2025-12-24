import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function GuestDemographicsChart({ bookings, reviews }) {
  // Repeat vs New guests
  const guestEmails = bookings.map(b => b.guest_email);
  const uniqueGuests = [...new Set(guestEmails)];
  const repeatGuests = guestEmails.filter((email, index, self) => 
    self.indexOf(email) !== index
  ).length;

  const guestTypeData = [
    { name: 'New Guests', value: uniqueGuests.length - repeatGuests, color: '#3B82F6' },
    { name: 'Repeat Guests', value: repeatGuests, color: '#10B981' },
  ];

  // Top guests by bookings
  const guestBookingCounts = {};
  bookings.forEach(b => {
    guestBookingCounts[b.guest_email] = (guestBookingCounts[b.guest_email] || 0) + 1;
  });

  const topGuests = Object.entries(guestBookingCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => {
      const booking = bookings.find(b => b.guest_email === email);
      return {
        name: booking?.guest_name || email.split('@')[0],
        bookings: count,
      };
    });

  // Review distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating}★`,
    count: reviews.filter(r => Math.floor(r.rating) === rating).length,
  }));

  const COLORS = ['#3B82F6', '#10B981'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-sm text-[#FF5124]">
            {payload[0].dataKey === 'value' ? 'Guests' : 'Bookings'}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Guest Retention</CardTitle>
          <p className="text-sm text-slate-500">New vs returning guests</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={guestTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {guestTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Guests</CardTitle>
          <p className="text-sm text-slate-500">Most frequent bookers</p>
        </CardHeader>
        <CardContent>
          {topGuests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No guest data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGuests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" fill="#FF5124" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <p className="text-sm text-slate-500">Guest reviews by rating</p>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No reviews yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="rating" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}