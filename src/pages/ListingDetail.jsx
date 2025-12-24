import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Star, CheckCircle, Truck, Zap, Droplets, 
  Shield, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon,
  Package, MessageCircle, Heart, Wifi, Coffee, Plug, Utensils,
  AirVent, Thermometer, ShowerHead, Share2, Flag, Home, Search
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import Header from '../components/layout/Header';
import BookingCalendar from '../components/booking/BookingCalendar';
import BookingModal from '../components/booking/BookingModal';
import ChatInterface from '../components/messaging/ChatInterface';
import ReviewsList from '../components/reviews/ReviewsList';
import RatingsSummary from '../components/reviews/RatingsSummary';
import ReviewSentimentSummary from '../components/reviews/ReviewSentimentSummary';
import SalePurchaseModal from '../components/payments/SalePurchaseModal';
import StickyBookingBar from '../components/listings/StickyBookingBar';

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  vendor_lot: 'Vendor Lot',
  equipment: 'Equipment',
  other: 'Other',
};

export default function ListingDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [pricingDetails, setPricingDetails] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [user, setUser] = useState(null);
  const [sellerCanAcceptPayments, setSellerCanAcceptPayments] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
    trackView();
  }, []);

  useEffect(() => {
    if (listing && !isRental) {
      checkSellerPaymentStatus();
    }
  }, [listing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showShareMenu && !e.target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const trackView = async () => {
    if (!listingId) return;
    
    try {
      const authenticated = await base44.auth.isAuthenticated();
      await base44.entities.ListingView.create({
        listing_id: listingId,
        viewer_email: authenticated ? (await base44.auth.me()).email : null,
        source: new URLSearchParams(window.location.search).get('ref') || 'direct'
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const checkSellerPaymentStatus = async () => {
    if (!listing?.id) return;
    
    try {
      const response = await base44.functions.invoke('checkSellerStripeStatus', {
        listing_id: listing.id
      });
      
      setSellerCanAcceptPayments(response.data.seller_stripe_connected);
    } catch (err) {
      console.error('Error checking seller payment status:', err);
      setSellerCanAcceptPayments(false);
    }
  };

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  };

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId,
  });

  // Fetch existing bookings for this listing
  const { data: existingBookings = [] } = useQuery({
    queryKey: ['listing-bookings', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      return await base44.entities.Booking.filter({ listing_id: listingId });
    },
    enabled: !!listingId,
  });

  // Check if listing is saved
  const { data: savedListing } = useQuery({
    queryKey: ['saved-listing', listingId, user?.email],
    queryFn: async () => {
      if (!user?.email || !listingId) return null;
      const saved = await base44.entities.SavedListing.filter({ 
        listing_id: listingId, 
        user_email: user.email 
      });
      return saved[0] || null;
    },
    enabled: !!user?.email && !!listingId,
  });

  // Fetch reviews for this listing
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      const allReviews = await base44.entities.Review.filter({ 
        listing_id: listingId,
        status: 'published'
      }, '-created_date');
      return allReviews;
    },
    enabled: !!listingId,
  });

  // Fetch similar listings
  const { data: similarListings = [] } = useQuery({
    queryKey: ['similar-listings', listing?.asset_category, listing?.listing_mode, listingId],
    queryFn: async () => {
      if (!listing) return [];
      const similar = await base44.entities.Listing.filter({
        asset_category: listing.asset_category,
        listing_mode: listing.listing_mode,
        status: 'active'
      }, '-created_date', 4);
      return similar.filter(l => l.id !== listingId).slice(0, 3);
    },
    enabled: !!listing,
  });

  // Save/unsave listing mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedListing) {
        await base44.entities.SavedListing.delete(savedListing.id);
        return null;
      } else {
        return await base44.entities.SavedListing.create({
          listing_id: listingId,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-listing', listingId, user?.email]);
      toast.success(savedListing ? 'Removed from saved' : 'Saved successfully');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 text-center py-20">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Listing not found</h1>
          <p className="text-slate-500">This listing may have been removed or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isRental = listing.listing_mode === 'rent';
  const images = listing.media?.length > 0 
    ? listing.media 
    : ['https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800'];

  const handleDateSelect = (range, pricing) => {
    setDateRange(range);
    setPricingDetails(pricing);
  };

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const handleContactHost = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    setShowChat(true);
  };

  const handleBuyNow = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleSaveListing = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    saveMutation.mutate();
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out: ${listing.title}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      setShowShareMenu(false);
      return;
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: listing.title, text, url });
        setShowShareMenu(false);
      } catch (err) {
        console.log('Share cancelled');
      }
      return;
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const AMENITY_ICONS = {
    'wifi': Wifi,
    'coffee maker': Coffee,
    'electrical hookup': Plug,
    'water hookup': Droplets,
    'air conditioning': AirVent,
    'heating': Thermometer,
    'prep station': Utensils,
    'hand washing station': ShowerHead,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-32 md:pt-24">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <a href="/" className="hover:text-slate-900 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </a>
            <span>/</span>
            <a href={`/SearchResults?mode=${listing.listing_mode}`} className="hover:text-slate-900 flex items-center gap-1">
              <Search className="w-4 h-4" />
              {listing.listing_mode === 'rent' ? 'Rentals' : 'For Sale'}
            </a>
            <span>/</span>
            <span className="text-slate-900">{listing.title}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[16/9] md:aspect-[21/9] bg-gray-100 overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Gallery Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="sr-only">Previous</span>
              </button>
              <button
                onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="sr-only">Next</span>
              </button>
              
              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedImage ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`View image ${idx + 1} of ${images.length}`}
                    aria-current={idx === selectedImage}
                  >
                    <span className="sr-only">Image {idx + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-lg font-medium text-sm hover:bg-white transition-colors shadow-lg"
          >
            Show all photos
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-[#FF5124] text-white">
                    {CATEGORY_LABELS[listing.asset_category]}
                  </Badge>
                  {listing.verification_status === 'verified' && (
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {isRental ? (
                    <Badge variant="outline">For Rent</Badge>
                  ) : (
                    <Badge variant="outline">For Sale</Badge>
                  )}
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex-1">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative share-menu-container">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="rounded-full"
                        aria-label="Share listing"
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                      {showShareMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-10 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                          {navigator.share && (
                            <button
                              onClick={() => handleShare('native')}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                            >
                              Share...
                            </button>
                          )}
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                          >
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                          >
                            Share on LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare('email')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                          >
                            Share via Email
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm"
                          >
                            Copy Link
                          </button>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveListing}
                      disabled={saveMutation.isPending}
                      className={`rounded-full ${savedListing ? 'text-red-500 border-red-500' : ''}`}
                      aria-label={savedListing ? 'Remove from saved listings' : 'Save this listing'}
                      aria-pressed={savedListing}
                    >
                      <Heart className={`w-5 h-5 ${savedListing ? 'fill-red-500' : ''}`} />
                      <span className="sr-only">{savedListing ? 'Saved' : 'Save'}</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.public_location_label || 'Location TBD'}
                  </div>
                  {listing.review_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{listing.average_rating?.toFixed(1)}</span>
                      <span className="text-slate-500">({listing.review_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About this {CATEGORY_LABELS[listing.asset_category]?.toLowerCase()}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {listing.description || 'No description provided.'}
                </p>
              </div>

              <Separator />

              {/* Specs & Features */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Features & Amenities</h2>
                
                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Amenities</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {listing.amenities.map((amenity, idx) => {
                        const Icon = AMENITY_ICONS[amenity.toLowerCase()] || CheckCircle;
                        return (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Icon className="w-5 h-5 text-[#FF5124]" />
                            <span className="text-sm capitalize">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Core Features */}
                <h3 className="text-sm font-medium text-slate-700 mb-3">Core Features</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {listing.delivery_available && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-[#FF5124]/10 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#FF5124]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Delivery Available</p>
                        {listing.delivery_max_miles && (
                          <p className="text-sm text-slate-500">Up to {listing.delivery_max_miles} miles</p>
                        )}
                      </div>
                    </div>
                  )}
                  {listing.power_type && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Power Type</p>
                        <p className="text-sm text-slate-500 capitalize">{listing.power_type}</p>
                      </div>
                    </div>
                  )}
                  {listing.water_hookup && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Water Hookup</p>
                        <p className="text-sm text-slate-500">Water connection available</p>
                      </div>
                    </div>
                  )}
                  {listing.condition && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Condition</p>
                        <p className="text-sm text-slate-500 capitalize">{listing.condition}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Included */}
              {listing.equipment_included?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Equipment Included</h2>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {listing.equipment_included.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Custom Add-ons */}
              {listing.custom_addons?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Add-ons</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {listing.custom_addons.map((addon, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{addon.title}</h3>
                            <span className="font-bold text-[#FF5124]">+${addon.price}</span>
                          </div>
                          {addon.description && (
                            <p className="text-sm text-slate-600">{addon.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Sale-specific: Shipping */}
              {!isRental && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Shipping & Pickup</h2>
                    <div className="space-y-3">
                      {listing.local_pickup_available && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Local pickup available
                        </div>
                      )}
                      {listing.delivery_included && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Delivery included {listing.delivery_included_max_miles && `(up to ${listing.delivery_included_max_miles} miles)`}
                        </div>
                      )}
                      {listing.title_verified && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Title verified
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Listing Stats */}
              <Separator />
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Listing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Posted</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(listing.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Listing ID</p>
                    <p className="text-sm font-medium text-slate-900 font-mono">
                      #{listing.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <Separator />
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-5 h-5 text-[#FF5124]" />
                  <span className="text-sm">Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-[#FF5124]" />
                  <span className="text-sm">Verified platform</span>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      base44.auth.redirectToLogin();
                      return;
                    }
                    // TODO: Add report modal
                    toast.success('Report feature coming soon');
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors ml-auto"
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">Report listing</span>
                </button>
              </div>

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">
                      Reviews ({reviews.length})
                    </h2>
                    <div className="space-y-6">
                      <RatingsSummary reviews={reviews} />
                      <ReviewSentimentSummary reviews={reviews} />
                    </div>
                    <div className="mt-6">
                      <ReviewsList 
                        reviews={reviews} 
                        canRespond={user && listing && user.email === listing.created_by}
                        hostEmail={listing?.created_by}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Similar Listings */}
              {similarListings.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">
                      Similar {listing.listing_mode === 'rent' ? 'Rentals' : 'Listings'}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarListings.map((similar) => (
                        <a
                          key={similar.id}
                          href={`/ListingDetail?id=${similar.id}`}
                          className="group block"
                        >
                          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3">
                            <img
                              src={similar.media?.[0] || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800'}
                              alt={similar.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-[#FF5124] transition-colors line-clamp-1">
                            {similar.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {similar.public_location_label}
                          </p>
                          <p className="font-bold text-slate-900 mt-2">
                            {similar.listing_mode === 'rent' 
                              ? `$${similar.daily_price?.toLocaleString()}/day`
                              : `$${similar.sale_price?.toLocaleString()}`
                            }
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar - Booking/Contact */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg border-0 animate-in fade-in slide-in-from-right duration-500">
                <CardHeader className="pb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      {isRental ? (
                        <>
                          <span className="text-2xl font-bold text-slate-900">
                            ${listing.daily_price?.toLocaleString() || '0'}
                          </span>
                          <span className="text-slate-500 ml-1">/ day</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-slate-900">
                          ${listing.sale_price?.toLocaleString() || '0'}
                        </span>
                      )}
                    </div>
                    {isRental && listing.weekly_price && (
                      <span className="text-sm text-slate-500">
                        ${listing.weekly_price?.toLocaleString()} / week
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isRental ? (
                    <>
                      {/* Booking Calendar */}
                      <BookingCalendar
                        listing={listing}
                        blockedDates={listing.blocked_dates || []}
                        existingBookings={existingBookings}
                        onDateSelect={handleDateSelect}
                        selectedRange={dateRange}
                        showPricing={true}
                      />

                      <Button 
                        onClick={handleBookNow}
                        className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium rounded-xl"
                        disabled={!dateRange.from || !dateRange.to || !pricingDetails}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Request to Book
                      </Button>
                    </>
                  ) : (
                    <>
                      {sellerCanAcceptPayments ? (
                        <Button 
                          onClick={handleBuyNow}
                          className="w-full bg-[#FF5124] hover:bg-[#e5481f] h-12 text-base font-medium rounded-xl"
                        >
                          Buy Now - ${listing.sale_price?.toLocaleString()}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                            <p className="text-sm text-amber-900 font-medium">
                              Direct purchase unavailable
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Seller hasn't set up payments yet
                            </p>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={handleContactHost}
                        className="w-full h-12 text-base font-medium rounded-xl"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    onClick={handleSaveListing}
                    disabled={saveMutation.isPending}
                    className="w-full h-12 text-base font-medium rounded-xl"
                  >
                    <Heart className={`w-5 h-5 mr-2 ${savedListing ? 'fill-red-500 text-red-500' : ''}`} />
                    {savedListing ? 'Saved' : 'Save Listing'}
                  </Button>

                  <p className="text-center text-xs text-slate-500">
                    You won't be charged yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Full Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5 text-white" />
            <span className="sr-only">Close</span>
          </button>
          <div className="h-full flex items-center justify-center p-4">
            <img
              src={images[selectedImage]}
              alt={listing.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {isRental && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          listing={listing}
          dateRange={dateRange}
          pricingDetails={pricingDetails}
        />
      )}

      {/* Chat Interface */}
      <ChatInterface
        open={showChat}
        onClose={() => setShowChat(false)}
        listing={listing}
        hostEmail={listing?.created_by}
        user={user}
      />

      {/* Purchase Modal for Sales */}
      {!isRental && (
        <SalePurchaseModal
          open={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          listing={listing}
        />
      )}

      {/* Sticky Booking Bar for Mobile */}
      <StickyBookingBar
        listing={listing}
        isRental={isRental}
        onBookClick={handleBookNow}
        onBuyClick={handleBuyNow}
        dateRange={dateRange}
        pricingDetails={pricingDetails}
        sellerCanAcceptPayments={sellerCanAcceptPayments}
      />
    </div>
  );
}