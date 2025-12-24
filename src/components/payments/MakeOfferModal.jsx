import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { 
  DollarSign, MapPin, CheckCircle, AlertCircle, 
  Loader2, FileText, Calendar, Shield 
} from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function MakeOfferModal({ open, onClose, listing }) {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    offer_amount: listing?.sale_price ? Math.round(listing.sale_price * 0.9) : '',
    message: '',
    terms: '',
    payment_method: 'escrow',
    delivery_preference: '',
    inspection_requested: true,
    offer_validity_days: 7,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          buyer_name: userData.full_name || '',
          buyer_email: userData.email || '',
        }));
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin();
        return;
      }

      const expiresAt = addDays(new Date(), formData.offer_validity_days).toISOString();

      await base44.entities.Offer.create({
        listing_id: listing.id,
        buyer_email: formData.buyer_email,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        offer_amount: parseFloat(formData.offer_amount),
        message: formData.message,
        terms: formData.terms,
        payment_method: formData.payment_method,
        delivery_preference: formData.delivery_preference,
        inspection_requested: formData.inspection_requested,
        expires_at: expiresAt,
        status: 'pending',
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Offer error:', err);
      setError('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentageOfAskingPrice = formData.offer_amount && listing?.sale_price
    ? ((formData.offer_amount / listing.sale_price) * 100).toFixed(0)
    : 0;

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Offer Submitted!</h3>
            <p className="text-slate-600">
              Your offer has been sent to the seller. You'll receive a notification when they respond.
            </p>
            <Button onClick={onClose} className="bg-[#FF5124] hover:bg-[#e5481f]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Summary */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <h3 className="font-semibold text-slate-900">{listing?.title}</h3>
            
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{listing?.public_location_label}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <DollarSign className="w-5 h-5 text-slate-500" />
              <span className="text-lg font-bold text-slate-900">
                Asking: ${listing?.sale_price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Your Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyer_name">Full Name *</Label>
                <Input
                  id="buyer_name"
                  value={formData.buyer_name}
                  onChange={(e) => updateField('buyer_name', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="buyer_email">Email *</Label>
                <Input
                  id="buyer_email"
                  type="email"
                  value={formData.buyer_email}
                  onChange={(e) => updateField('buyer_email', e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="buyer_phone">Phone Number *</Label>
              <Input
                id="buyer_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.buyer_phone}
                onChange={(e) => updateField('buyer_phone', e.target.value)}
                required
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Offer Amount */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Your Offer</h3>
            
            <div>
              <Label htmlFor="offer_amount">Offer Amount * (USD)</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="offer_amount"
                  type="number"
                  value={formData.offer_amount}
                  onChange={(e) => updateField('offer_amount', e.target.value)}
                  className="pl-10 text-lg font-semibold"
                  min="1"
                  step="100"
                  required
                />
              </div>
              {percentageOfAskingPrice > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  {percentageOfAskingPrice}% of asking price
                  {percentageOfAskingPrice < 80 && (
                    <span className="text-amber-600 ml-1">(Low offer - may be rejected)</span>
                  )}
                  {percentageOfAskingPrice >= 80 && percentageOfAskingPrice < 95 && (
                    <span className="text-blue-600 ml-1">(Reasonable offer)</span>
                  )}
                  {percentageOfAskingPrice >= 95 && (
                    <span className="text-green-600 ml-1">(Strong offer)</span>
                  )}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message to Seller *</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain your offer..."
                value={formData.message}
                onChange={(e) => updateField('message', e.target.value)}
                className="mt-2"
                rows={4}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: A personalized message increases your chances of acceptance
              </p>
            </div>

            <div>
              <Label htmlFor="terms">Custom Terms & Conditions (Optional)</Label>
              <Textarea
                id="terms"
                placeholder="E.g., 'Subject to inspection', 'Financing contingency', 'Must close by [date]'"
                value={formData.terms}
                onChange={(e) => updateField('terms', e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Offer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Offer Details</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => updateField('payment_method', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escrow">Escrow (Recommended)</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="financing">Financing</SelectItem>
                    <SelectItem value="trade">Trade/Partial Trade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="delivery_preference">Delivery Preference *</Label>
                <Select
                  value={formData.delivery_preference}
                  onValueChange={(value) => updateField('delivery_preference', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {listing?.local_pickup_available && (
                      <SelectItem value="pickup">Local Pickup</SelectItem>
                    )}
                    {listing?.freight_delivery_available && (
                      <SelectItem value="freight">Freight Delivery</SelectItem>
                    )}
                    {listing?.seller_delivery_available && (
                      <SelectItem value="seller_delivery">Seller Delivery</SelectItem>
                    )}
                    <SelectItem value="buyer_arranged">I'll Arrange Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="offer_validity">Offer Valid For</Label>
              <Select
                value={formData.offer_validity_days.toString()}
                onValueChange={(value) => updateField('offer_validity_days', parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days (Standard)</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Expires on {format(addDays(new Date(), formData.offer_validity_days), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#FF5124]" />
                <div>
                  <Label className="font-medium">Request Pre-Purchase Inspection</Label>
                  <p className="text-xs text-slate-500">
                    Make offer contingent on inspection
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.inspection_requested}
                onCheckedChange={(v) => updateField('inspection_requested', v)}
              />
            </div>

            {formData.payment_method === 'escrow' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>Escrow Protection:</strong> Your payment will be held securely until you confirm receipt and satisfaction with the purchase. This protects both you and the seller.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.delivery_preference}
              className="flex-1 bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit Offer - $${formData.offer_amount ? parseInt(formData.offer_amount).toLocaleString() : '0'}`
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Non-binding offer • Seller may accept, reject, or counter
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}