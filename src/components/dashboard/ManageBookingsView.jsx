import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, MapPin, DollarSign, User, Mail, Phone, 
  CheckCircle, XCircle, Loader2, MessageSquare, Eye, 
  Search, Truck, AlertCircle, Clock, Filter, RefreshCw
} from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import LeaveReviewModal from '../reviews/LeaveReviewModal';
import RefundModal from '../refunds/RefundModal';

export default function ManageBookingsView({ bookings, listings, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [refundingTransaction, setRefundingTransaction] = useState(null);
  const queryClient = useQueryClient();

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Booking.update(id, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success(
        variables.status === 'confirmed' 
          ? 'Booking confirmed successfully!' 
          : variables.status === 'cancelled'
          ? 'Booking cancelled'
          : 'Booking updated'
      );
    },
  });

  const categorizeBookings = () => {
    const now = new Date();
    
    return {
      pending: bookings.filter(b => b.status === 'pending'),
      confirmed: bookings.filter(b => {
        const startDate = new Date(b.start_date);
        return b.status === 'confirmed' && isFuture(startDate);
      }),
      active: bookings.filter(b => {
        const startDate = new Date(b.start_date);
        const endDate = new Date(b.end_date);
        return b.status === 'active' || (
          b.status === 'confirmed' && 
          (isToday(startDate) || (now >= startDate && now <= endDate))
        );
      }),
      completed: bookings.filter(b => b.status === 'completed' || (
        b.status === 'confirmed' && isPast(new Date(b.end_date))
      )),
      cancelled: bookings.filter(b => b.status === 'cancelled'),
    };
  };

  const categories = categorizeBookings();

  const filteredBookings = (categoryBookings) => {
    if (!searchQuery) return categoryBookings;
    
    return categoryBookings.filter(booking => {
      const listing = getListing(booking.listing_id);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        booking.guest_name?.toLowerCase().includes(searchLower) ||
        booking.guest_email?.toLowerCase().includes(searchLower) ||
        listing?.title?.toLowerCase().includes(searchLower)
      );
    });
  };

  const getListing = (listingId) => {
    return listings.find(l => l.id === listingId);
  };

  const handleConfirm = (bookingId) => {
    updateBookingMutation.mutate({ id: bookingId, status: 'confirmed' });
  };

  const handleDecline = (bookingId) => {
    updateBookingMutation.mutate({ id: bookingId, status: 'cancelled' });
  };

  const handleLeaveReview = (booking) => {
    setReviewingBooking(booking);
    setShowReviewModal(true);
  };

  const handleRefund = async (booking) => {
    // Find transaction for this booking
    const transactions = await base44.entities.Transaction.filter({
      reference_id: booking.id,
      transaction_type: 'booking_payment'
    });

    if (transactions.length === 0) {
      toast.error('No payment found for this booking');
      return;
    }

    setRefundingBooking(booking);
    setRefundingTransaction(transactions[0]);
    setShowRefundModal(true);
  };

  const handleRefundComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    setShowRefundModal(false);
    setRefundingBooking(null);
    setRefundingTransaction(null);
  };

  const totalEarnings = bookings
    .filter(b => b.payment_status === 'paid' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{categories.pending.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{categories.confirmed.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{categories.active.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-600">{categories.completed.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Earnings</p>
                <p className="text-2xl font-bold text-[#FF5124]">${totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#FF5124]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by guest name, email, or listing..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            Pending ({categories.pending.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Confirmed ({categories.confirmed.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Active ({categories.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white">
            Completed ({categories.completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Cancelled ({categories.cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <BookingsListView 
            bookings={filteredBookings(categories.pending)}
            listings={listings}
            getListing={getListing}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
            isPending={updateBookingMutation.isPending}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          <BookingsListView 
            bookings={filteredBookings(categories.confirmed)}
            listings={listings}
            getListing={getListing}
            isPending={updateBookingMutation.isPending}
            onRefund={handleRefund}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <BookingsListView 
            bookings={filteredBookings(categories.active)}
            listings={listings}
            getListing={getListing}
            isPending={updateBookingMutation.isPending}
            onRefund={handleRefund}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <BookingsListView 
            bookings={filteredBookings(categories.completed)}
            listings={listings}
            getListing={getListing}
            onLeaveReview={handleLeaveReview}
            isPending={updateBookingMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <BookingsListView 
            bookings={filteredBookings(categories.cancelled)}
            listings={listings}
            getListing={getListing}
            isPending={updateBookingMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {reviewingBooking && (
        <LeaveReviewModal
          open={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewingBooking(null);
          }}
          booking={reviewingBooking}
          listing={{ email: reviewingBooking.guest_email }}
          type="guest"
        />
      )}

      {/* Refund Modal */}
      {refundingBooking && refundingTransaction && (
        <RefundModal
          open={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setRefundingBooking(null);
            setRefundingTransaction(null);
          }}
          transaction={refundingTransaction}
          booking={refundingBooking}
          onRefundComplete={handleRefundComplete}
        />
      )}
    </div>
  );
}

function BookingsListView({ bookings, listings, getListing, onConfirm, onDecline, onLeaveReview, onRefund, isPending, showActions }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-slate-500">No bookings in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const listing = getListing(booking.listing_id);
        if (!listing) return null;

        const statusConfig = {
          pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
          confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
          active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
          completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
          cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[booking.status] || statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Listing Image */}
                {listing.media?.[0] && (
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={listing.media[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">
                        {listing.title}
                      </h3>
                      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="w-3 h-3" />
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        ${booking.total_amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.payment_status === 'paid' ? '✓ Paid' : 'Pending Payment'}
                      </p>
                    </div>
                  </div>

                  {/* Guest & Booking Info */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-[#FF5124]" />
                        <span className="font-medium">{booking.guest_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-[#FF5124]" />
                        <span className="truncate">{booking.guest_email}</span>
                      </div>
                      {booking.guest_phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-[#FF5124]" />
                          <span>{booking.guest_phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-[#FF5124]" />
                        <span>
                          {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-[#FF5124]" />
                        <span>{booking.total_days} days</span>
                      </div>
                      {booking.delivery_requested && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Truck className="w-4 h-4" />
                          <span>Delivery requested</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.special_requests && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">Special Requests:</p>
                      <p className="text-sm text-blue-900">{booking.special_requests}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `${createPageUrl('ListingDetail')}?id=${listing.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Listing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Guest
                    </Button>
                    
                    {showActions && (
                      <>
                        <Button
                          onClick={() => onConfirm(booking.id)}
                          disabled={isPending}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          onClick={() => onDecline(booking.id)}
                          disabled={isPending}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}

                    {booking.status === 'completed' && onLeaveReview && (
                      <Button
                        onClick={() => onLeaveReview(booking)}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Review Guest
                      </Button>
                    )}

                    {(booking.status === 'confirmed' || booking.status === 'active') && 
                     booking.payment_status === 'paid' && 
                     onRefund && (
                      <Button
                        onClick={() => onRefund(booking)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}