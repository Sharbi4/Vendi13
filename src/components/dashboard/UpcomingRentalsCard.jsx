import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { format, differenceInDays, isFuture, isToday } from 'date-fns';

export default function UpcomingRentalsCard({ bookings, listings }) {
  const upcomingBookings = bookings
    .filter(b => {
      const startDate = new Date(b.start_date);
      return (isFuture(startDate) || isToday(startDate)) && ['confirmed', 'active'].includes(b.status);
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5);

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || 'Unknown Listing';
  };

  const getListingImage = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.media?.[0];
  };

  const getDaysUntilStart = (startDate) => {
    return differenceInDays(new Date(startDate), new Date());
  };

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rentals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-slate-500">No upcoming rentals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Rentals</span>
          <Badge className="bg-blue-100 text-blue-800">
            {upcomingBookings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingBookings.map((booking) => {
            const daysUntil = getDaysUntilStart(booking.start_date);
            const isStartingSoon = daysUntil <= 3;

            return (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border-2 ${
                  isStartingSoon ? 'border-amber-200 bg-amber-50' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex gap-3">
                  {/* Image */}
                  {getListingImage(booking.listing_id) && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={getListingImage(booking.listing_id)}
                        alt={getListingTitle(booking.listing_id)}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate mb-1">
                      {getListingTitle(booking.listing_id)}
                    </h4>
                    
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span className="truncate">{booking.guest_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-[#FF5124]" />
                        <span>
                          {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                        </span>
                      </div>

                      {isStartingSoon && (
                        <div className="flex items-center gap-2 text-amber-700 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>
                            {daysUntil === 0 ? 'Starting today!' : `Starting in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-slate-900">
                      ${booking.total_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.total_days} days
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}