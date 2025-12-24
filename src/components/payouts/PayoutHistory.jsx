import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, Calendar, TrendingUp, Clock, 
  CheckCircle, XCircle, Loader2, Download, Search
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function PayoutHistory({ userEmail, listingIds }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ['payouts', userEmail],
    queryFn: async () => {
      return await base44.entities.Payout.filter({ host_email: userEmail }, '-created_date');
    },
    enabled: !!userEmail,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-for-payouts', userEmail],
    queryFn: async () => {
      if (!listingIds || listingIds.length === 0) return [];
      const allBookings = await base44.entities.Booking.list('-created_date', 200);
      return allBookings.filter(b => listingIds.includes(b.listing_id));
    },
    enabled: !!listingIds && listingIds.length > 0,
  });

  const filterPayouts = () => {
    let filtered = [...payouts];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      if (timeFilter === 'this_month') {
        startDate = startOfMonth(now);
      } else if (timeFilter === 'last_month') {
        startDate = startOfMonth(subMonths(now, 1));
      } else if (timeFilter === 'last_3_months') {
        startDate = subMonths(now, 3);
      }

      if (startDate) {
        filtered = filtered.filter(p => new Date(p.created_date) >= startDate);
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.booking_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPayouts = filterPayouts();

  // Calculate stats
  const stats = {
    total: payouts.reduce((sum, p) => sum + (p.net_amount || 0), 0),
    pending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.net_amount || 0), 0),
    completed: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.net_amount || 0), 0),
    thisMonth: payouts
      .filter(p => {
        const date = new Date(p.created_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + (p.net_amount || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Earnings</p>
                <p className="text-2xl font-bold text-slate-900">${stats.total.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">${stats.pending.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">${stats.completed.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">This Month</p>
                <p className="text-2xl font-bold text-[#FF5124]">${stats.thisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#FF5124]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by transaction ID or booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payout List */}
      {filteredPayouts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-slate-500">No payouts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayouts.map((payout) => (
            <PayoutCard key={payout.id} payout={payout} bookings={bookings} />
          ))}
        </div>
      )}
    </div>
  );
}

function PayoutCard({ payout, bookings }) {
  const statusConfig = {
    pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, text: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: Loader2, text: 'Processing' },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
    failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
  };

  const config = statusConfig[payout.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const booking = bookings.find(b => b.id === payout.booking_id);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${config.color} flex items-center gap-1 border-0`}>
                <StatusIcon className={`w-3 h-3 ${payout.status === 'processing' ? 'animate-spin' : ''}`} />
                {config.text}
              </Badge>
              <span className="text-sm text-slate-500">
                {format(new Date(payout.created_date), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Booking Amount</p>
                <p className="font-medium text-slate-900">${payout.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Platform Fee</p>
                <p className="font-medium text-red-600">-${payout.platform_fee?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Payout Method</p>
                <p className="font-medium text-slate-900 capitalize">
                  {payout.payout_method?.replace('_', ' ') || 'Default'}
                </p>
              </div>
              {payout.transaction_id && (
                <div>
                  <p className="text-slate-500">Transaction ID</p>
                  <p className="font-medium text-slate-900 truncate">{payout.transaction_id}</p>
                </div>
              )}
              {payout.payout_date && (
                <div>
                  <p className="text-slate-500">Payout Date</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(payout.payout_date), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-right ml-6">
            <p className="text-sm text-slate-500 mb-1">Net Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ${payout.net_amount?.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}