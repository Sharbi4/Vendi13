import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';

export default function BookingCancel() {
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking_id');

      if (bookingId) {
        const bookings = await base44.entities.Booking.filter({ id: bookingId });
        const booking = bookings[0];
        
        if (booking) {
          // Cancel the pending booking
          await base44.entities.Booking.update(booking.id, { status: 'cancelled' });
          
          const listings = await base44.entities.Listing.filter({ id: booking.listing_id });
          setListing(listings[0]);
        }
      }
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Booking Cancelled
              </h1>
              <p className="text-slate-600 mb-8">
                Your booking was not completed. No payment was charged.
              </p>

              <div className="space-y-3">
                {listing && (
                  <Button
                    onClick={() => navigate(`${createPageUrl('ListingDetail')}?id=${listing.id}`)}
                    className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Return to Listing
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl('SearchResults'))}
                  className="w-full h-12 text-base font-medium"
                >
                  Browse Other Listings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="w-full h-12 text-base font-medium"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}