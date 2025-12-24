import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MessageSquare } from 'lucide-react';

export default function InquiryTopicsChart({ conversations }) {
  // Analyze conversation topics based on keywords (simplified)
  const topicKeywords = {
    'Availability': ['available', 'availability', 'dates', 'book', 'reserve'],
    'Pricing': ['price', 'cost', 'discount', 'payment', 'fee'],
    'Location': ['location', 'address', 'where', 'directions', 'parking'],
    'Features': ['feature', 'amenities', 'equipment', 'includes', 'specification'],
    'Delivery': ['delivery', 'pickup', 'transport', 'shipping'],
    'Other': [],
  };

  const topicCounts = {
    'Availability': 0,
    'Pricing': 0,
    'Location': 0,
    'Features': 0,
    'Delivery': 0,
    'Other': 0,
  };

  conversations.forEach(conv => {
    const message = (conv.last_message || '').toLowerCase();
    let matched = false;

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        topicCounts[topic]++;
        matched = true;
      }
    });

    if (!matched && message.length > 0) {
      topicCounts['Other']++;
    }
  });

  const chartData = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#FF5124', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = conversations.length > 0 
        ? ((payload[0].value / conversations.length) * 100).toFixed(1)
        : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].payload.topic}</p>
          <p className="text-sm text-[#FF5124]">
            {payload[0].value} inquiries ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Popular Inquiry Topics</CardTitle>
          <p className="text-sm text-slate-500">What guests are asking about</p>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No inquiry data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="topic" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Insights</CardTitle>
          <p className="text-sm text-slate-500">Key metrics</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Conversations</p>
              <p className="text-2xl font-bold text-blue-900">{conversations.length}</p>
            </div>
            <div className="space-y-3">
              {chartData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-sm text-slate-700">{item.topic}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
            {conversations.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-slate-500">
                  Response rate and common questions can help you create better templates
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}