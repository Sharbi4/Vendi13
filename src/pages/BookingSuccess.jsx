import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, MapPin, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import confetti from 'canvas-confetti';
import { syncToGoogleSheets, formatBookingForSheets } from '../components/integrations/GoogleSheetsSync';

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking_id');

      if (!bookingId) {
        navigate(createPageUrl('Home'));
        return;
      }

      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      const bookingData = bookings[0];

      if (bookingData) {
        setBooking(bookingData);
        
        const listings = await base44.entities.Listing.filter({ id: bookingData.listing_id });
        const listingData = listings[0];
        setListing(listingData);

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Sync to Google Sheets if configured
        try {
          const userData = await base44.auth.me();
          if (userData?.google_sheets_config?.enabled && userData?.google_sheets_config?.spreadsheet_id) {
            await syncToGoogleSheets(
              userData.google_sheets_config.spreadsheet_id,
              'Bookings',
              formatBookingForSheets(bookingData, listingData)
            );
          }
        } catch (error) {
          console.error('Failed to sync to Google Sheets:', error);
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Booking Confirmed!
              </h1>
              <p className="text-slate-600 mb-8">
                Your payment was successful. The host will review your booking request and get back to you shortly.
              </p>

              {booking && listing && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <h2 className="font-semibold text-slate-900 mb-4">Booking Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Rental Period</p>
                        <p className="font-medium text-slate-900">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-500">({booking.total_days} days)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Listing</p>
                        <p className="font-medium text-slate-900">{listing.title}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Paid</span>
                        <span className="font-bold text-slate-900 text-lg">
                          ${booking.total_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => navigate(createPageUrl('MyBookings'))}
                  className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium"
                >
                  View My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Home'))}
                  className="w-full h-12 text-base font-medium"
                >
                  Back to Home
                </Button>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                A confirmation email has been sent to {booking?.guest_email}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}