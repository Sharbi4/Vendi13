import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { 
  DollarSign, MapPin, Truck, Loader2, CheckCircle, 
  AlertCircle, Shield, FileText, Package, HandCoins 
} from 'lucide-react';
import MakeOfferModal from './MakeOfferModal';
export default function SalePurchaseModal({ 
  open, 
  onClose, 
  listing 
}) {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    shipping_address: '',
    shipping_zip_code: '',
    notes: '',
    selected_addons: [],
    selected_custom_addons: [],
    use_escrow: false,
    delivery_method: '',
  });
  const [freightDistance, setFreightDistance] = useState(null);
  const [freightFee, setFreightFee] = useState(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [sellerStripeConnected, setSellerStripeConnected] = useState(null);
  const [isCheckingStripe, setIsCheckingStripe] = useState(true);

  useEffect(() => {
    loadUser();
    checkSellerStripeStatus();
  }, []);

  const checkSellerStripeStatus = async () => {
    if (!listing?.id) return;
    
    setIsCheckingStripe(true);
    try {
      const response = await base44.functions.invoke('checkSellerStripeStatus', {
        listing_id: listing.id
      });
      
      setSellerStripeConnected(response.data.seller_stripe_connected);
    } catch (err) {
      console.error('Error checking seller Stripe status:', err);
      setSellerStripeConnected(false);
    } finally {
      setIsCheckingStripe(false);
    }
  };

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

  const toggleAddon = (addon) => {
    setFormData(prev => ({
      ...prev,
      selected_addons: prev.selected_addons.includes(addon)
        ? prev.selected_addons.filter(a => a !== addon)
        : [...prev.selected_addons, addon]
    }));
  };

  const toggleCustomAddon = (addonId) => {
    setFormData(prev => ({
      ...prev,
      selected_custom_addons: prev.selected_custom_addons.includes(addonId)
        ? prev.selected_custom_addons.filter(id => id !== addonId)
        : [...prev.selected_custom_addons, addonId]
    }));
  };

  // Calculate distance for freight shipping
  const calculateFreightDistance = async (buyerZip) => {
    if (!buyerZip || buyerZip.length < 5) return;
    
    setIsCalculatingDistance(true);
    try {
      // Use geocoding to get coordinates for both locations
      const sellerZip = listing.zip_code;
      
      // Simple distance calculation using zip codes (in production, use proper geocoding API)
      // For now, estimate 1 degree = ~69 miles
      const response = await fetch(
        `https://api.zippopotam.us/us/${buyerZip}`
      );
      const buyerData = await response.json();
      
      const sellerResponse = await fetch(
        `https://api.zippopotam.us/us/${sellerZip}`
      );
      const sellerData = await sellerResponse.json();
      
      if (buyerData.places?.[0] && sellerData.places?.[0]) {
        const buyerLat = parseFloat(buyerData.places[0].latitude);
        const buyerLng = parseFloat(buyerData.places[0].longitude);
        const sellerLat = parseFloat(sellerData.places[0].latitude);
        const sellerLng = parseFloat(sellerData.places[0].longitude);
        
        // Haversine formula for distance
        const R = 3959; // Earth's radius in miles
        const dLat = (sellerLat - buyerLat) * Math.PI / 180;
        const dLon = (sellerLng - buyerLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(buyerLat * Math.PI / 180) * Math.cos(sellerLat * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = Math.round(R * c);
        
        setFreightDistance(distance);
        
        // Calculate freight fee if buyer pays
        if (formData.delivery_method === 'freight' && listing.freight_paid_by === 'buyer') {
          setFreightFee(distance * (listing.freight_rate_per_mile || 4));
        }
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const calculateTotal = () => {
    let total = listing.sale_price || 0;
    
    if (formData.selected_addons.includes('title_verification')) total += 35;
    if (formData.selected_addons.includes('online_notary')) total += 50;

    // Add custom add-ons
    if (listing.custom_addons && formData.selected_custom_addons.length > 0) {
      formData.selected_custom_addons.forEach(addonId => {
        const addon = listing.custom_addons.find(a => a.id === addonId);
        if (addon) {
          total += parseFloat(addon.price) || 0;
        }
      });
    }
    
    // Add freight fee if applicable
    if (formData.delivery_method === 'freight' && listing.freight_paid_by === 'buyer') {
      total += freightFee;
    }
    
    return total;
  };

  const handlePurchase = async () => {
    if (!formData.buyer_name || !formData.buyer_email || !formData.buyer_phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (hasMultipleDeliveryOptions && !formData.delivery_method) {
      setError('Please select a delivery method');
      return;
    }

    if (formData.delivery_method !== 'pickup' && needsShipping && !formData.shipping_address) {
      setError('Please provide a delivery address');
      return;
    }

    if (formData.delivery_method === 'freight' && listing.freight_paid_by === 'buyer' && !formData.shipping_zip_code) {
      setError('Please provide a ZIP code for freight calculation');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin();
        return;
      }

      const totalAmount = calculateTotal();

      // Create Stripe checkout session
      const response = await base44.functions.invoke('createSaleCheckout', {
        listing_id: listing.id,
        sale_price: totalAmount,
        delivery_method: formData.delivery_method || (listing.local_pickup_available ? 'pickup' : 'delivery'),
        delivery_address: formData.shipping_address,
        freight_distance: freightDistance,
        freight_fee: freightFee,
        buyer_notes: formData.notes,
        use_escrow: formData.use_escrow
      });

      console.log('Checkout response:', response);

      // Handle response - could be response.data.url or response.url
      const checkoutUrl = response?.data?.url || response?.url;
      
      if (!checkoutUrl) {
        console.error('Full response:', response);
        throw new Error('No checkout URL in response');
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to create checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const total = calculateTotal();
  const needsShipping = listing.freight_delivery_available || listing.seller_delivery_available || listing.delivery_included;
  const hasMultipleDeliveryOptions = [
    listing.local_pickup_available,
    listing.freight_delivery_available,
    listing.seller_delivery_available,
    listing.delivery_included
  ].filter(Boolean).length > 1;

  // Show error if seller hasn't connected Stripe
  if (isCheckingStripe) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (sellerStripeConnected === false) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Purchase Not Available</h3>
            <p className="text-slate-600">
              This seller hasn't connected their payment account yet. Direct purchases are not available for this listing at this time.
            </p>
            {listing?.accept_offers && (
              <div className="pt-4">
                <Button
                  onClick={() => {
                    onClose();
                    setShowMakeOffer(true);
                  }}
                  className="w-full bg-[#FF5124] hover:bg-[#e5481f]"
                >
                  Make an Offer Instead
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
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
          <DialogTitle>Complete Your Purchase</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Summary */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <h3 className="font-semibold text-slate-900">{listing.title}</h3>
            
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{listing.public_location_label}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <DollarSign className="w-5 h-5 text-[#FF5124]" />
              <span className="text-2xl font-bold text-slate-900">
                ${listing.sale_price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Contact Information</h3>
            
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

          {/* Delivery Method Selection */}
          {hasMultipleDeliveryOptions && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Delivery Method *</Label>
              <div className="space-y-2">
                {listing.local_pickup_available && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.delivery_method === 'pickup' ? 'border-[#FF5124] bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="pickup"
                        checked={formData.delivery_method === 'pickup'}
                        onChange={(e) => {
                          updateField('delivery_method', e.target.value);
                          setFreightFee(0);
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Local Pickup</p>
                        <p className="text-xs text-slate-500">Arrange pickup from seller's location</p>
                      </div>
                    </div>
                    <Badge variant="outline">FREE</Badge>
                  </label>
                )}
                
                {listing.freight_delivery_available && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.delivery_method === 'freight' ? 'border-[#FF5124] bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="freight"
                        checked={formData.delivery_method === 'freight'}
                        onChange={(e) => updateField('delivery_method', e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Third-Party Freight Shipping</p>
                        <p className="text-xs text-slate-500">Professional freight carrier (48 states)</p>
                        {listing.freight_paid_by === 'buyer' && freightDistance && (
                          <p className="text-xs text-[#FF5124] font-medium mt-1">
                            ~{freightDistance} miles • ${freightFee.toLocaleString()} freight fee
                          </p>
                        )}
                        {listing.freight_paid_by === 'seller' && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            Freight paid by seller
                          </p>
                        )}
                      </div>
                    </div>
                    {listing.freight_paid_by === 'buyer' ? (
                      <Badge className="bg-blue-100 text-blue-800">$4/mile</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Included</Badge>
                    )}
                  </label>
                )}
                
                {listing.seller_delivery_available && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.delivery_method === 'seller' ? 'border-[#FF5124] bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="seller"
                        checked={formData.delivery_method === 'seller'}
                        onChange={(e) => {
                          updateField('delivery_method', e.target.value);
                          setFreightFee(0);
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Seller-Provided Delivery</p>
                        <p className="text-xs text-slate-500">Seller will deliver personally</p>
                      </div>
                    </div>
                    <Badge variant="outline">Contact seller</Badge>
                  </label>
                )}
                
                {listing.delivery_included && (
                  <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors bg-green-50 ${
                    formData.delivery_method === 'free' ? 'border-green-500' : 'border-green-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_method"
                        value="free"
                        checked={formData.delivery_method === 'free'}
                        onChange={(e) => {
                          updateField('delivery_method', e.target.value);
                          setFreightFee(0);
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-green-900">Free Shipping Included</p>
                        <p className="text-xs text-green-700">
                          Delivery included in price
                          {listing.delivery_included_max_miles && ` (up to ${listing.delivery_included_max_miles} miles)`}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">FREE</Badge>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {(needsShipping && formData.delivery_method !== 'pickup' && formData.delivery_method) && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="shipping_address">Delivery Address *</Label>
                <Textarea
                  id="shipping_address"
                  placeholder="Enter full street address for delivery"
                  value={formData.shipping_address}
                  onChange={(e) => updateField('shipping_address', e.target.value)}
                  required
                  className="mt-2"
                  rows={3}
                />
              </div>
              
              {formData.delivery_method === 'freight' && listing.freight_paid_by === 'buyer' && (
                <div>
                  <Label htmlFor="shipping_zip_code">ZIP Code *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="shipping_zip_code"
                      type="text"
                      placeholder="Enter ZIP code"
                      value={formData.shipping_zip_code}
                      onChange={(e) => {
                        const zip = e.target.value;
                        updateField('shipping_zip_code', zip);
                        if (zip.length === 5) {
                          calculateFreightDistance(zip);
                        }
                      }}
                      maxLength={5}
                      required
                    />
                    {isCalculatingDistance && (
                      <div className="flex items-center px-3 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  {freightDistance && (
                    <p className="text-xs text-slate-600 mt-2">
                      Estimated distance: ~{freightDistance} miles • Freight fee: ${freightFee.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional Add-ons */}
          {(listing.title_verification_available || listing.online_notary_available || listing.escrow_available) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Optional Add-ons</h3>
              
              {listing.title_verification_available && (
                <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.selected_addons.includes('title_verification')}
                      onChange={() => toggleAddon('title_verification')}
                      className="rounded border-gray-300"
                      aria-label="Add title verification for $35"
                    />
                    <div>
                      <p className="font-medium">Title Verification</p>
                      <p className="text-xs text-slate-500">Professional title verification service</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">+$35</span>
                </label>
              )}

              {listing.online_notary_available && (
                <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.selected_addons.includes('online_notary')}
                      onChange={() => toggleAddon('online_notary')}
                      className="rounded border-gray-300"
                      aria-label="Add online notary service for $50"
                    />
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/9bb0d1b8a_Proof-lockup-black.jpg" 
                      alt="Proof"
                      className="h-4 w-auto"
                    />
                    <div>
                      <p className="font-medium">Online Notary</p>
                      <p className="text-xs text-slate-500">Virtual notary service by Proof</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">+$50</span>
                </label>
              )}

              {listing.escrow_available && (
                <label className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.use_escrow}
                    onChange={(e) => updateField('use_escrow', e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                    aria-label="Use escrow protection"
                    aria-describedby="escrow-desc"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-5 h-5 text-green-600" />
                      <p className="font-medium text-green-900">Use Escrow Protection</p>
                      <Badge className="bg-green-600">FREE</Badge>
                    </div>
                    <p id="escrow-desc" className="text-xs text-green-700 mb-2">
                      Funds held securely until you confirm receipt. Protection for both buyer and seller.
                    </p>
                    <div className="text-xs text-green-800 space-y-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Payment held until delivery confirmed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Dispute resolution if issues arise</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>No extra fees</span>
                      </div>
                    </div>
                  </div>
                </label>
              )}

              {/* Custom Add-ons */}
              {listing.custom_addons && listing.custom_addons.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Host Add-ons</h4>
                  {listing.custom_addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 mb-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.selected_custom_addons.includes(addon.id)}
                          onChange={() => toggleCustomAddon(addon.id)}
                          className="rounded border-gray-300"
                          aria-label={`Add ${addon.title} for $${addon.price}`}
                        />
                        <div>
                          <p className="font-medium">{addon.title}</p>
                          {addon.description && (
                            <p className="text-xs text-slate-500">{addon.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">+${addon.price}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any questions or special requests for the seller?"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <Separator />

          {/* Price Summary */}
          <Card className="bg-slate-50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Sale Price</span>
                <span className="font-medium">${listing.sale_price?.toLocaleString()}</span>
              </div>
              {formData.selected_addons.includes('title_verification') && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Title Verification</span>
                  <span className="font-medium">$35</span>
                </div>
              )}
              {formData.selected_addons.includes('online_notary') && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Online Notary</span>
                  <span className="font-medium">$50</span>
                </div>
              )}
              {formData.selected_custom_addons.length > 0 && (
                <>
                  {formData.selected_custom_addons.map(addonId => {
                    const addon = listing.custom_addons?.find(a => a.id === addonId);
                    return addon ? (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span className="text-slate-600">{addon.title}</span>
                        <span className="font-medium">+${addon.price}</span>
                      </div>
                    ) : null;
                  })}
                </>
              )}
              {formData.delivery_method === 'freight' && listing.freight_paid_by === 'buyer' && freightFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Freight Shipping ({freightDistance} miles)</span>
                  <span className="font-medium">${freightFee.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-slate-900">${total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePurchase}
              disabled={
                isSubmitting || 
                !formData.buyer_name || 
                !formData.buyer_email || 
                !formData.buyer_phone ||
                (hasMultipleDeliveryOptions && !formData.delivery_method) ||
                isCalculatingDistance
              }
              className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Buy Now - $${total.toLocaleString()}`
              )}
            </Button>

            {listing?.accept_offers && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMakeOffer(true)}
                className="w-full h-12 text-lg font-medium border-2 border-[#FF5124] text-[#FF5124] hover:bg-orange-50"
              >
                <HandCoins className="w-5 h-5 mr-2" />
                Make an Offer
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-slate-500">
            Secure payment powered by Stripe • No buyer fees • {formData.use_escrow ? 'Escrow protection enabled' : 'Direct payment'}
          </p>
        </div>
      </DialogContent>

      {/* Make Offer Modal */}
      <MakeOfferModal
        open={showMakeOffer}
        onClose={() => setShowMakeOffer(false)}
        listing={listing}
      />
    </Dialog>
  );
}