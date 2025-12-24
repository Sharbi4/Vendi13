import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin, DollarSign, User, Phone, Mail, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BookingRequestsCard({ bookings, listings }) {
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
          : 'Booking declined'
      );
    },
  });

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || 'Unknown Listing';
  };

  const getListingImage = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.media?.[0];
  };

  const handleConfirm = (bookingId) => {
    updateBookingMutation.mutate({ id: bookingId, status: 'confirmed' });
  };

  const handleDecline = (bookingId) => {
    updateBookingMutation.mutate({ id: bookingId, status: 'cancelled' });
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Booking Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500">No pending booking requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Booking Requests
            <Badge className="bg-amber-500 text-white">{bookings.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-2 border-amber-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Listing Image */}
                  {getListingImage(booking.listing_id) && (
                    <div className="w-full md:w-32 h-32 flex-shrink-0">
                      <img
                        src={getListingImage(booking.listing_id)}
                        alt={getListingTitle(booking.listing_id)}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {getListingTitle(booking.listing_id)}
                      </h3>
                      <Badge className="bg-amber-100 text-amber-800">
                        Awaiting Response
                      </Badge>
                    </div>

                    {/* Guest Info */}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-[#FF5124]" />
                        <span>{booking.guest_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-[#FF5124]" />
                        <span className="truncate">{booking.guest_email}</span>
                      </div>
                      {booking.guest_phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-[#FF5124]" />
                          <span>{booking.guest_phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#FF5124]" />
                        <span>
                          {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span className="text-slate-500">({booking.total_days} days)</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-slate-900">
                          ${booking.total_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-900">
                          <strong>Special Request:</strong> {booking.special_requests}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={updateBookingMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {updateBookingMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Confirm Booking
                      </Button>
                      <Button
                        onClick={() => handleDecline(booking.id)}
                        disabled={updateBookingMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}