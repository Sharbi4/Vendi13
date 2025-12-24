import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign } from 'lucide-react';

export default function StickyBookingBar({ 
  listing, 
  isRental, 
  onBookClick, 
  onBuyClick,
  dateRange,
  pricingDetails,
  sellerCanAcceptPayments 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show bar when user scrolls past the hero section (roughly 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">
            {isRental ? 'Starting at' : 'Price'}
          </p>
          <p className="text-lg font-bold text-slate-900">
            {isRental 
              ? `$${listing.daily_price?.toLocaleString()}/day`
              : `$${listing.sale_price?.toLocaleString()}`
            }
          </p>
        </div>
        
        {isRental ? (
          <Button
            onClick={onBookClick}
            disabled={!dateRange?.from || !dateRange?.to || !pricingDetails}
            className="bg-[#FF5124] hover:bg-[#e5481f] px-6"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {dateRange?.from ? 'Request Booking' : 'Select Dates'}
          </Button>
        ) : (
          <Button
            onClick={onBuyClick}
            disabled={!sellerCanAcceptPayments}
            className="bg-[#FF5124] hover:bg-[#e5481f] px-6"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {sellerCanAcceptPayments ? 'Buy Now' : 'Unavailable'}
          </Button>
        )}
      </div>
    </div>
  );
}