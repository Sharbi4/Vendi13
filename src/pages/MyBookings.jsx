import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, MapPin, Truck, DollarSign, Clock, CheckCircle,
  XCircle, Loader2, MessageSquare, Eye, AlertTriangle, Star
} from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import LeaveReviewModal from '../components/reviews/LeaveReviewModal';

export default function MyBookings() {
  const [user, setUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingListing, setReviewingListing] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('MyBookings'));
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Booking.filter(
        { guest_email: user.email },
        '-created_date'
      );
    },
    enabled: !!user?.email,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings-for-bookings'],
    queryFn: async () => {
      const listingIds = [...new Set(bookings.map(b => b.listing_id))];
      if (listingIds.length === 0) return [];
      
      const allListings = await base44.entities.Listing.list('-created_date', 100);
      return allListings.filter(l => listingIds.includes(l.id));
    },
    enabled: bookings.length > 0,
  });

  const { data: existingReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Review.filter({ 
        reviewer_email: user.email 
      });
    },
    enabled: !!user?.email,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      return await base44.entities.Booking.update(bookingId, {
        status: 'cancelled',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setShowCancelDialog(false);
      setSelectedBooking(null);
    },
  });

  const getListing = (listingId) => {
    return listings.find(l => l.id === listingId);
  };

  const getStatusBadge = (booking) => {
    const statusConfig = {
      pending: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[booking.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getBookingPhase = (booking) => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const now = new Date();

    if (booking.status === 'cancelled') return 'cancelled';
    if (booking.status === 'completed') return 'completed';
    if (isPast(end)) return 'past';
    if (isFuture(start)) return 'upcoming';
    if (isToday(start) || (now >= start && now <= end)) return 'active';
    return 'upcoming';
  };

  const categorizeBookings = () => {
    const upcoming = bookings.filter(b => getBookingPhase(b) === 'upcoming' && b.status !== 'cancelled');
    const active = bookings.filter(b => getBookingPhase(b) === 'active');
    const past = bookings.filter(b => ['past', 'completed'].includes(getBookingPhase(b)));
    const cancelled = bookings.filter(b => b.status === 'cancelled');

    return { upcoming, active, past, cancelled };
  };

  const categories = categorizeBookings();

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id);
    }
  };

  const handleLeaveReview = (booking, listing) => {
    setSelectedBooking(booking);
    setReviewingListing(listing);
    setShowReviewModal(true);
  };

  const hasReviewed = (bookingId) => {
    return existingReviews.some(r => r.booking_id === bookingId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              My Bookings
            </h1>
            <p className="text-slate-500">
              Manage your rental bookings and reservations
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="active" 
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white"
              >
                Active ({categories.active.length})
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white"
              >
                Upcoming ({categories.upcoming.length})
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white"
              >
                Past ({categories.past.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled"
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white"
              >
                Cancelled ({categories.cancelled.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
              </div>
            ) : (
              <>
                <TabsContent value="active">
                  <BookingsList 
                    bookings={categories.active} 
                    listings={listings}
                    getListing={getListing}
                    getStatusBadge={getStatusBadge}
                    onCancel={handleCancelBooking}
                  />
                </TabsContent>
                <TabsContent value="upcoming">
                  <BookingsList 
                    bookings={categories.upcoming} 
                    listings={listings}
                    getListing={getListing}
                    getStatusBadge={getStatusBadge}
                    onCancel={handleCancelBooking}
                  />
                </TabsContent>
                <TabsContent value="past">
                  <BookingsList 
                    bookings={categories.past} 
                    listings={listings}
                    getListing={getListing}
                    getStatusBadge={getStatusBadge}
                    onLeaveReview={handleLeaveReview}
                    hasReviewed={hasReviewed}
                  />
                </TabsContent>
                <TabsContent value="cancelled">
                  <BookingsList 
                    bookings={categories.cancelled} 
                    listings={listings}
                    getListing={getListing}
                    getStatusBadge={getStatusBadge}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Cancel Booking
            </DialogTitle>
          </DialogHeader>
          
          <Alert variant="destructive">
            <AlertDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              Check the cancellation policy for refund details.
            </AlertDescription>
          </Alert>

          {selectedBooking && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm text-slate-600">
                <strong>Dates:</strong> {format(new Date(selectedBooking.start_date), 'MMM d')} - {format(new Date(selectedBooking.end_date), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Total:</strong> ${selectedBooking.total_amount?.toLocaleString()}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LeaveReviewModal
        open={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedBooking(null);
          setReviewingListing(null);
        }}
        booking={selectedBooking}
        listing={reviewingListing}
        type="listing"
      />
    </div>
  );
}

function BookingsList({ bookings, listings, getListing, getStatusBadge, onCancel, onLeaveReview, hasReviewed }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings found</h3>
        <p className="text-slate-500 mb-6">
          Start exploring listings to make your first booking
        </p>
        <Button
          onClick={() => window.location.href = createPageUrl('SearchResults')}
          className="bg-[#FF5124] hover:bg-[#e5481f]"
        >
          Browse Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const listing = getListing(booking.listing_id);
        if (!listing) return null;

        const canReview = booking.status === 'completed' && onLeaveReview && !hasReviewed?.(booking.id);

        return (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {listing.media?.[0] && (
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={listing.media[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{listing.public_location_label}</span>
                      </div>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-[#FF5124]" />
                      <div>
                        <p className="text-xs text-slate-500">Dates</p>
                        <p className="text-sm font-medium text-slate-900">
                          {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-slate-500">({booking.total_days} days)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4 text-[#FF5124]" />
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-sm font-medium text-slate-900">
                          ${booking.total_amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Payment: {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.delivery_requested && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm font-medium">Delivery Requested</span>
                      </div>
                      {booking.delivery_address && (
                        <p className="text-xs text-blue-700 mt-1 ml-6">
                          {booking.delivery_address}
                        </p>
                      )}
                    </div>
                  )}

                  {booking.special_requests && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Special Requests:</p>
                      <p className="text-sm text-slate-700">{booking.special_requests}</p>
                    </div>
                  )}

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
                      Contact Host
                    </Button>
                    {booking.status === 'pending' && onCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancel(booking)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    {canReview && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onLeaveReview(booking, listing)}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                      </Button>
                    )}
                    {hasReviewed?.(booking.id) && (
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
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