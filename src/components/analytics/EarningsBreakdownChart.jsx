import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function EarningsBreakdownChart({ bookings, timeRange }) {
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');

  const breakdown = {
    basePrice: paidBookings.reduce((sum, b) => sum + (b.base_price || 0), 0),
    deliveryFees: paidBookings.reduce((sum, b) => sum + (b.delivery_fee || 0), 0),
    cleaningFees: paidBookings.reduce((sum, b) => sum + (b.cleaning_fee || 0), 0),
    serviceFees: paidBookings.reduce((sum, b) => sum + (b.service_fee || 0), 0),
  };

  const chartData = [
    { name: 'Rental Income', value: breakdown.basePrice, color: '#10B981' },
    { name: 'Delivery Fees', value: breakdown.deliveryFees, color: '#3B82F6' },
    { name: 'Cleaning Fees', value: breakdown.cleaningFees, color: '#F59E0B' },
    { name: 'Service Fees', value: breakdown.serviceFees, color: '#8B5CF6' },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            ${payload[0].value.toLocaleString()} ({percentage}%)
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
          <CardTitle>Revenue Breakdown</CardTitle>
          <p className="text-sm text-slate-500">Income sources distribution</p>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No earnings data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
          <p className="text-sm text-slate-500">Detailed revenue breakdown</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-700">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Total Revenue</span>
                <span className="text-xl font-bold text-green-600">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}