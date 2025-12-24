import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar as CalendarIcon, 
  AlertCircle, 
  Check,
  Clock
} from 'lucide-react';
import { format, differenceInDays, addDays, parseISO, isSameDay, isWithinInterval } from 'date-fns';
import { cn } from "@/lib/utils";

export default function BookingCalendar({ 
  listing, 
  blockedDates = [], 
  existingBookings = [],
  onDateSelect,
  selectedRange,
  showPricing = true 
}) {
  const [dateRange, setDateRange] = useState(selectedRange || { from: null, to: null });
  const [pricingDetails, setPricingDetails] = useState(null);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      calculatePricing();
    } else {
      setPricingDetails(null);
    }
  }, [dateRange, listing]);

  const calculatePricing = () => {
    if (!dateRange.from || !dateRange.to) return;

    const days = differenceInDays(dateRange.to, dateRange.from);
    if (days <= 0) return;

    let basePrice = 0;
    
    // Optimize pricing based on duration
    if (days >= 28 && listing.monthly_price) {
      // Monthly rate if available
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      basePrice = (months * listing.monthly_price) + (remainingDays * listing.daily_price);
    } else if (days >= 7 && listing.weekly_price) {
      // Weekly rate if available
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      basePrice = (weeks * listing.weekly_price) + (remainingDays * listing.daily_price);
    } else {
      // Daily rate
      basePrice = days * listing.daily_price;
    }

    const deliveryFee = 0; // Will be calculated based on user selection
    const cleaningFee = listing.cleaning_fee || 0;
    const securityDeposit = listing.security_deposit || 0;
    const serviceFee = Math.round(basePrice * 0.12); // 12% service fee
    const total = basePrice + deliveryFee + cleaningFee + serviceFee;

    const pricing = {
      days,
      basePrice,
      deliveryFee,
      cleaningFee,
      securityDeposit,
      serviceFee,
      total,
      breakdown: getBreakdown(days)
    };

    setPricingDetails(pricing);
  };

  const getBreakdown = (days) => {
    const breakdown = [];
    
    if (days >= 28 && listing.monthly_price) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (months > 0) {
        breakdown.push({ label: `${months} month${months > 1 ? 's' : ''}`, rate: listing.monthly_price, count: months });
      }
      if (remainingDays > 0) {
        breakdown.push({ label: `${remainingDays} day${remainingDays > 1 ? 's' : ''}`, rate: listing.daily_price, count: remainingDays });
      }
    } else if (days >= 7 && listing.weekly_price) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (weeks > 0) {
        breakdown.push({ label: `${weeks} week${weeks > 1 ? 's' : ''}`, rate: listing.weekly_price, count: weeks });
      }
      if (remainingDays > 0) {
        breakdown.push({ label: `${remainingDays} day${remainingDays > 1 ? 's' : ''}`, rate: listing.daily_price, count: remainingDays });
      }
    } else {
      breakdown.push({ label: `${days} day${days > 1 ? 's' : ''}`, rate: listing.daily_price, count: days });
    }
    
    return breakdown;
  };

  const isDateBlocked = (date) => {
    // Check owner-blocked dates
    if (blockedDates.some(blocked => isSameDay(parseISO(blocked), date))) {
      return true;
    }

    // Check existing bookings
    return existingBookings.some(booking => {
      const bookingStart = parseISO(booking.start_date);
      const bookingEnd = parseISO(booking.end_date);
      
      return isWithinInterval(date, { 
        start: bookingStart, 
        end: bookingEnd 
      }) && ['confirmed', 'active'].includes(booking.status);
    });
  };

  const handleSelect = (range) => {
    // Validate that no dates in range are blocked
    if (range?.from && range?.to) {
      let currentDate = range.from;
      let hasBlocked = false;
      
      while (currentDate <= range.to) {
        if (isDateBlocked(currentDate)) {
          hasBlocked = true;
          break;
        }
        currentDate = addDays(currentDate, 1);
      }
      
      if (hasBlocked) {
        // Reset selection
        setDateRange({ from: null, to: null });
        return;
      }
    }
    
    setDateRange(range);
    if (onDateSelect) {
      onDateSelect(range, pricingDetails);
    }
  };

  const disabledDays = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable blocked dates
    return isDateBlocked(date);
  };

  const getDiscountMessage = () => {
    if (!pricingDetails) return null;
    
    const { days } = pricingDetails;
    
    if (days >= 28 && listing.monthly_price) {
      const monthlyTotal = listing.monthly_price * Math.ceil(days / 30);
      const dailyTotal = days * listing.daily_price;
      const savings = dailyTotal - monthlyTotal;
      if (savings > 0) {
        return `Monthly rate saves you $${Math.round(savings)}!`;
      }
    } else if (days >= 7 && listing.weekly_price) {
      const weeklyTotal = listing.weekly_price * Math.ceil(days / 7);
      const dailyTotal = days * listing.daily_price;
      const savings = dailyTotal - weeklyTotal;
      if (savings > 0) {
        return `Weekly rate saves you $${Math.round(savings)}!`;
      }
    }
    
    return null;
  };

  const minDuration = listing.min_duration_days || 1;
  const maxDuration = listing.max_duration_days || 30;

  return (
    <div className="space-y-4">
      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded border border-gray-300" />
          <span className="text-slate-600">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FF5124]/10 border-2 border-[#FF5124] rounded" />
          <span className="text-slate-600">Selected</span>
        </div>
      </div>

      {/* Minimum/Maximum Duration Info */}
      {(minDuration > 1 || maxDuration < 30) && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {minDuration > 1 && `Minimum rental: ${minDuration} days. `}
            {maxDuration < 30 && `Maximum rental: ${maxDuration} days.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar */}
      <div className="border rounded-xl p-4">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          disabled={disabledDays}
          numberOfMonths={2}
          className="w-full"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md"
            ),
            day_selected:
              "bg-[#FF5124] text-white hover:bg-[#FF5124] hover:text-white focus:bg-[#FF5124] focus:text-white",
            day_today: "bg-slate-100 text-slate-900 font-semibold",
            day_outside: "text-slate-400 opacity-50",
            day_disabled: "text-slate-400 opacity-50 line-through",
            day_range_middle:
              "aria-selected:bg-[#FF5124]/10 aria-selected:text-slate-900",
            day_hidden: "invisible",
          }}
        />
      </div>

      {/* Date Summary */}
      {dateRange.from && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-[#FF5124] mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">
                {dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MMM d, yyyy')} → {format(dateRange.to, 'MMM d, yyyy')}
                  </>
                ) : (
                  <>Select end date</>
                )}
              </p>
              {pricingDetails && (
                <p className="text-sm text-slate-600 mt-1">
                  {pricingDetails.days} {pricingDetails.days === 1 ? 'day' : 'days'} rental
                </p>
              )}
            </div>
            {dateRange.from && dateRange.to && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      {showPricing && pricingDetails && dateRange.from && dateRange.to && (
        <Card className="p-6 bg-white border-2 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Price Details</h3>
          
          {/* Discount Badge */}
          {getDiscountMessage() && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                {getDiscountMessage()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Base Price Breakdown */}
            {pricingDetails.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-700">
                <span>${item.rate.toLocaleString()} × {item.label}</span>
                <span>${(item.rate * item.count).toLocaleString()}</span>
              </div>
            ))}

            {/* Fees */}
            {pricingDetails.cleaningFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Cleaning fee</span>
                <span>${pricingDetails.cleaningFee.toLocaleString()}</span>
              </div>
            )}
            
            {pricingDetails.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Delivery fee</span>
                <span>${pricingDetails.deliveryFee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-700">
              <span>Service fee</span>
              <span>${pricingDetails.serviceFee.toLocaleString()}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-3" />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${pricingDetails.total.toLocaleString()}</span>
            </div>

            {/* Security Deposit Notice */}
            {pricingDetails.securityDeposit > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Security deposit (refundable)</span>
                  <span>${pricingDetails.securityDeposit.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  The security deposit will be held and refunded after the rental period.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Validation Messages */}
      {dateRange.from && dateRange.to && pricingDetails && (
        <>
          {pricingDetails.days < minDuration && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Minimum rental duration is {minDuration} days. Please select a longer period.
              </AlertDescription>
            </Alert>
          )}
          {pricingDetails.days > maxDuration && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum rental duration is {maxDuration} days. Please select a shorter period.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}