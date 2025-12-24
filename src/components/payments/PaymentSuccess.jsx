import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Mail, MessageSquare } from 'lucide-react';
import { createPageUrl } from '@/utils';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function PaymentSuccess({ open, onClose, booking }) {
  useEffect(() => {
    if (open) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center py-6">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-600 mb-6">
            Your payment has been processed successfully
          </p>

          {/* Booking Details Card */}
          {booking && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#FF5124]" />
                <span className="text-sm font-medium text-slate-900">Booking Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Booking ID:</span>
                  <span className="font-medium text-slate-900">#{booking.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Paid:</span>
                  <span className="font-medium text-slate-900">${booking.total_amount?.toLocaleString()}</span>
                </div>
                {booking.security_deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Security Deposit:</span>
                    <span className="font-medium text-amber-600">${booking.security_deposit?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Confirmation email sent</p>
                <p className="text-xs text-slate-500">Check your inbox for booking details</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Contact your host</p>
                <p className="text-xs text-slate-500">Coordinate pickup and delivery details</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
            >
              View Bookings
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}