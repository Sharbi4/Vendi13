import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin, Truck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import PaymentSummary from '../payments/PaymentSummary';
import AddonsStep from './AddonsStep';
import { sanitizeText, sanitizeEmail, sanitizePhone } from '../utils/inputSanitizer';

export default function BookingModal({ 
  open, 
  onClose, 
  listing, 
  dateRange, 
  pricingDetails 
}) {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('details');
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    delivery_requested: false,
    delivery_address: '',
    special_requests: '',
    _honeypot: '', // Anti-bot honeypot field
    _timestamp: Date.now() // Form load timestamp
  });
  const [requestedAddons, setRequestedAddons] = useState([]);
  const [selectedCustomAddons, setSelectedCustomAddons] = useState([]);

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
          guest_name: userData.full_name || '',
          guest_email: userData.email || '',
        }));
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  };

  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [deliveryWithinRange, setDeliveryWithinRange] = useState(true);

  const calculateDeliveryDistance = async (deliveryZip) => {
    if (!deliveryZip || deliveryZip.length < 5) return;
    
    setIsCalculatingDistance(true);
    try {
      const listingZip = listing.zip_code;
      
      // Get coordinates for both locations
      const [deliveryResponse, listingResponse] = await Promise.all([
        fetch(`https://api.zippopotam.us/us/${deliveryZip}`),
        fetch(`https://api.zippopotam.us/us/${listingZip}`)
      ]);
      
      const deliveryData = await deliveryResponse.json();
      const listingData = await listingResponse.json();
      
      if (deliveryData.places?.[0] && listingData.places?.[0]) {
        const deliveryLat = parseFloat(deliveryData.places[0].latitude);
        const deliveryLng = parseFloat(deliveryData.places[0].longitude);
        const listingLat = parseFloat(listingData.places[0].latitude);
        const listingLng = parseFloat(listingData.places[0].longitude);
        
        // Haversine formula
        const R = 3959; // Earth's radius in miles
        const dLat = (listingLat - deliveryLat) * Math.PI / 180;
        const dLon = (listingLng - deliveryLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deliveryLat * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = Math.round(R * c);
        
        setDeliveryDistance(distance);
        
        // Check if within allowed radius
        if (listing.delivery_max_miles && distance > listing.delivery_max_miles) {
          setDeliveryWithinRange(false);
        } else {
          setDeliveryWithinRange(true);
        }
      }
    } catch (err) {
      console.error('Error calculating distance:', err);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const calculateDeliveryFee = () => {
    if (!formData.delivery_requested || !listing.delivery_available) return 0;
    if (!deliveryDistance) return 0;
    
    // Calculate based on distance and rate per mile
    return deliveryDistance * (listing.delivery_rate_per_mile || 0);
  };

  const calculateCustomAddonsTotal = () => {
    if (!listing.custom_addons || selectedCustomAddons.length === 0) return 0;
    return selectedCustomAddons.reduce((sum, addonId) => {
      const addon = listing.custom_addons.find(a => a.id === addonId);
      return sum + (addon ? parseFloat(addon.price) || 0 : 0);
    }, 0);
  };

  const toggleCustomAddon = (addonId) => {
    setSelectedCustomAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
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

      // Sanitize all user inputs
      const sanitizedFormData = {
        guest_name: sanitizeText(formData.guest_name, { maxLength: 255 }),
        guest_email: sanitizeEmail(formData.guest_email),
        guest_phone: sanitizePhone(formData.guest_phone),
        delivery_requested: formData.delivery_requested,
        delivery_address: sanitizeText(formData.delivery_address, { maxLength: 500 }),
        special_requests: sanitizeText(formData.special_requests, { maxLength: 1000 })
      };

      const deliveryFee = calculateDeliveryFee();
      
      // Create addon requests if any
      if (requestedAddons.length > 0) {
        const addonPromises = requestedAddons.map(addon => 
          base44.entities.BookingAddon.create({
            booking_id: 'pending',
            addon_type: addon.addon_type,
            title: addon.title,
            description: addon.description || '',
            quantity: addon.quantity,
            requested_price: addon.requested_price ? parseFloat(addon.requested_price) : null,
            status: 'pending',
            guest_email: formData.guest_email,
            host_email: listing.created_by
          })
        );
        await Promise.all(addonPromises);
      }

      // Create Stripe checkout session with sanitized data and honeypot
      const response = await base44.functions.invoke('createBookingCheckout', {
        _honeypot: sanitizedFormData._honeypot,
        _timestamp: sanitizedFormData._timestamp,
        listing_id: listing.id,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        total_days: pricingDetails.days,
        base_price: pricingDetails.basePrice,
        delivery_fee: deliveryFee,
        delivery_distance: deliveryDistance || 0,
        cleaning_fee: pricingDetails.cleaningFee || 0,
        security_deposit: pricingDetails.securityDeposit || 0,
        service_fee: pricingDetails.serviceFee || 0,
        total_amount: pricingDetails.total + deliveryFee,
        delivery_requested: sanitizedFormData.delivery_requested,
        delivery_address: sanitizedFormData.delivery_requested ? sanitizedFormData.delivery_address : '',
        special_requests: sanitizedFormData.special_requests
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create checkout. Please try again.');
      setIsSubmitting(false);
    }
  };



  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!dateRange?.from || !dateRange?.to || !pricingDetails) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dates" className="text-xs sm:text-sm">
                1. Dates
              </TabsTrigger>
              <TabsTrigger value="details" disabled={currentTab === 'dates'} className="text-xs sm:text-sm">
                2. Details
              </TabsTrigger>
              <TabsTrigger value="addons" disabled={currentTab === 'dates' || currentTab === 'details'} className="text-xs sm:text-sm">
                3. Add-ons
              </TabsTrigger>
              <TabsTrigger value="confirm" disabled={currentTab !== 'confirm'} className="text-xs sm:text-sm">
                4. Confirm
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Dates */}
            <TabsContent value="dates" className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                  
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{listing.public_location_label}</span>
                  </div>
                </div>

                <div className="p-6 bg-white border-2 border-[#FF5124] rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[#FF5124]" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Your Dates</h3>
                      <p className="text-sm text-slate-600">Review your selected rental period</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Check-in</p>
                      <p className="font-semibold text-slate-900">{format(dateRange.from, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Check-out</p>
                      <p className="font-semibold text-slate-900">{format(dateRange.to, 'MMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Total rental period</span>
                      <span className="font-bold text-[#FF5124]">{pricingDetails.days} days</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Preview */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-slate-900">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">${listing.daily_price}/day × {pricingDetails.days} days</span>
                      <span className="font-medium">${pricingDetails.basePrice?.toLocaleString()}</span>
                    </div>
                    {pricingDetails.cleaningFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cleaning fee</span>
                        <span className="font-medium">${pricingDetails.cleaningFee}</span>
                      </div>
                    )}
                    {pricingDetails.serviceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Service fee</span>
                        <span className="font-medium">${pricingDetails.serviceFee}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentTab('details')}
                  className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12"
                >
                  Continue to Details
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Details */}
            <TabsContent value="details" className="space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); setCurrentTab('addons'); }} className="space-y-6">

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Contact Information</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guest_name">Full Name *</Label>
                      <Input
                        id="guest_name"
                        value={formData.guest_name}
                        onChange={(e) => updateField('guest_name', e.target.value)}
                        required
                        className="mt-2"
                        autoComplete="name"
                      />

                      {/* Honeypot field - hidden from users, bots will fill it */}
                      <input
                        type="text"
                        name="_honeypot"
                        value={formData._honeypot}
                        onChange={(e) => updateField('_honeypot', e.target.value)}
                        style={{ 
                          position: 'absolute', 
                          left: '-9999px',
                          width: '1px',
                          height: '1px'
                        }}
                        tabIndex="-1"
                        aria-hidden="true"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="guest_email">Email *</Label>
                      <Input
                        id="guest_email"
                        type="email"
                        value={formData.guest_email}
                        onChange={(e) => updateField('guest_email', e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guest_phone">Phone Number *</Label>
                    <Input
                      id="guest_phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.guest_phone}
                      onChange={(e) => updateField('guest_phone', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <Separator />

                {/* Delivery Option */}
                {listing.delivery_available && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#FF5124]" />
                        <div>
                          <Label className="font-medium">Request Delivery</Label>
                          <p id="delivery-option-desc" className="text-xs text-slate-500">
                            Delivery available up to {listing.delivery_max_miles} miles
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.delivery_requested}
                        onCheckedChange={(v) => updateField('delivery_requested', v)}
                        aria-label="Request delivery"
                        aria-describedby="delivery-option-desc"
                      />
                    </div>

                    {formData.delivery_requested && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="delivery_zip">Delivery ZIP Code *</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="delivery_zip"
                              type="text"
                              placeholder="Enter ZIP code"
                              maxLength={5}
                              onChange={(e) => {
                                const zip = e.target.value;
                                if (zip.length === 5) {
                                  calculateDeliveryDistance(zip);
                                }
                              }}
                              required={formData.delivery_requested}
                            />
                            {isCalculatingDistance && (
                              <div className="flex items-center px-3">
                                <Loader2 className="w-4 h-4 animate-spin text-[#FF5124]" />
                              </div>
                            )}
                          </div>
                          {deliveryDistance && deliveryWithinRange && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              ~{deliveryDistance} miles • ${calculateDeliveryFee()} delivery fee
                            </p>
                          )}
                          {deliveryDistance && !deliveryWithinRange && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Delivery not available. Location is {deliveryDistance} miles away (max: {listing.delivery_max_miles} miles)
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="delivery_address">Full Delivery Address *</Label>
                          <Textarea
                            id="delivery_address"
                            placeholder="Street address, city, state"
                            value={formData.delivery_address}
                            onChange={(e) => updateField('delivery_address', e.target.value)}
                            required={formData.delivery_requested}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="special_requests"
                    placeholder="Any special requirements or questions?"
                    value={formData.special_requests}
                    onChange={(e) => updateField('special_requests', e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab('dates')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !formData.guest_name || 
                      !formData.guest_email || 
                      !formData.guest_phone || 
                      (formData.delivery_requested && !formData.delivery_address) ||
                      (formData.delivery_requested && !deliveryWithinRange) ||
                      isCalculatingDistance
                    }
                    className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
                  >
                    Continue to Add-ons
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Step 3: Add-ons */}
            <TabsContent value="addons" className="space-y-6">
              <AddonsStep
                addons={requestedAddons}
                onAddonsChange={setRequestedAddons}
              />

              {/* Custom Add-ons from Host */}
              {listing.custom_addons && listing.custom_addons.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Host Add-ons</h3>
                  <div className="space-y-3">
                    {listing.custom_addons.map((addon) => (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCustomAddons.includes(addon.id)}
                            onChange={() => toggleCustomAddon(addon.id)}
                            className="rounded border-gray-300"
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
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentTab('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentTab('confirm')}
                  className="flex-1 bg-[#FF5124] hover:bg-[#e5481f]"
                >
                  Review Booking
                </Button>
              </div>

              <p className="text-xs text-center text-slate-500">
                {requestedAddons.length > 0 
                  ? 'Host will review your add-on requests and respond with pricing'
                  : 'Skip if you don\'t need any add-ons'}
              </p>
            </TabsContent>

            {/* Step 4: Confirmation */}
            <TabsContent value="confirm" className="space-y-6">
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-[#FF5124] rounded-xl space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-[#FF5124]" />
                    <h3 className="text-lg font-bold text-slate-900">Review Your Booking</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Listing</p>
                      <p className="font-semibold text-slate-900">{listing.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Check-in</p>
                        <p className="font-medium text-slate-900">{format(dateRange.from, 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Check-out</p>
                        <p className="font-medium text-slate-900">{format(dateRange.to, 'MMM d, yyyy')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Guest</p>
                      <p className="font-medium text-slate-900">{formData.guest_name}</p>
                      <p className="text-sm text-slate-600">{formData.guest_email}</p>
                    </div>

                    {formData.delivery_requested && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Delivery</p>
                        <p className="text-sm text-slate-900">{formData.delivery_address}</p>
                      </div>
                    )}

                    {selectedCustomAddons.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Add-ons</p>
                        {selectedCustomAddons.map(addonId => {
                          const addon = listing.custom_addons?.find(a => a.id === addonId);
                          return addon ? (
                            <p key={addonId} className="text-sm text-slate-900">• {addon.title} (+${addon.price})</p>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <PaymentSummary 
                  pricingDetails={{
                    ...pricingDetails,
                    deliveryFee: calculateDeliveryFee(),
                    customAddonsTotal: calculateCustomAddonsTotal(),
                    totalAmount: pricingDetails.total + calculateDeliveryFee() + calculateCustomAddonsTotal()
                  }} 
                  listing={listing}
                  selectedCustomAddons={selectedCustomAddons}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentTab('addons')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#FF5124] hover:bg-[#e5481f] h-12 text-lg font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm & Pay'
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-slate-500">
                  Secure payment powered by Stripe • You won't be charged until checkout
                </p>
              </div>
            </TabsContent>


          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}