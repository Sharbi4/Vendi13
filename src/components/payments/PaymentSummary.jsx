import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Shield, Calendar } from 'lucide-react';

export default function PaymentSummary({ pricingDetails, listing, selectedCustomAddons = [] }) {
  if (!pricingDetails) return null;

  const {
    basePrice,
    totalDays,
    deliveryFee,
    cleaningFee,
    securityDeposit,
    serviceFee,
    totalAmount,
    discount
  } = pricingDetails;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              ${listing.daily_price} × {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
            <span className="font-medium text-slate-900">${basePrice.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="font-medium text-green-600">-${discount.toLocaleString()}</span>
            </div>
          )}

          {deliveryFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Delivery fee</span>
              <span className="font-medium text-slate-900">${deliveryFee.toLocaleString()}</span>
            </div>
          )}

          {cleaningFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Cleaning fee</span>
              <span className="font-medium text-slate-900">${cleaningFee.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Service fee</span>
            <span className="font-medium text-slate-900">${serviceFee.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900">Total (USD)</span>
          <span className="text-2xl font-bold text-slate-900">${totalAmount.toLocaleString()}</span>
        </div>

        {/* Security Deposit */}
        {securityDeposit > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Security Deposit</span>
              </div>
              <p className="text-sm text-amber-800">
                ${securityDeposit.toLocaleString()} will be held and returned after the rental period
              </p>
            </div>
          </>
        )}

        {/* Payment Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Payment Schedule:</strong> Full payment is charged upon booking confirmation. 
            Host receives payout 24 hours after rental period starts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}