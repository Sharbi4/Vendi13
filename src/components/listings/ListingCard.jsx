import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Truck, CheckCircle, Heart } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import VerificationBadge from './VerificationBadge';

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  vendor_lot: 'Vendor Lot',
  equipment: 'Equipment',
  other: 'Other',
};

export default function ListingCard({ listing }) {
  const isRental = listing.listing_mode === 'rent';
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (err) {
      // User not logged in
    }
  };

  const { data: savedListing } = useQuery({
    queryKey: ['saved-listing-card', listing.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const saved = await base44.entities.SavedListing.filter({ 
        listing_id: listing.id, 
        user_email: user.email 
      });
      return saved[0] || null;
    },
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedListing) {
        await base44.entities.SavedListing.delete(savedListing.id);
        return null;
      } else {
        return await base44.entities.SavedListing.create({
          listing_id: listing.id,
          user_email: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-listing-card', listing.id, user?.email]);
      queryClient.invalidateQueries(['savedListings']);
      toast.success(savedListing ? 'Removed from saved' : 'Saved successfully');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    saveMutation.mutate();
  };
  
  return (
    <Link 
      to={`${createPageUrl('ListingDetail')}?id=${listing.id}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.media?.[0] || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#FF5124] text-white border-0 font-medium">
              {CATEGORY_LABELS[listing.asset_category] || listing.asset_category}
            </Badge>
          </div>
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                savedListing ? 'text-red-500 fill-red-500' : 'text-slate-600'
              }`} 
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-[#FF5124] transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.public_location_label || 'Location TBD'}</span>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <VerificationBadge status={listing.verification_status} size="sm" showLabel={false} />
            {listing.delivery_available && (
              <Badge variant="outline" className="text-xs font-normal border-gray-200">
                <Truck className="w-3 h-3 mr-1" />
                Delivery
              </Badge>
            )}
            {listing.hood_system && (
              <Badge variant="outline" className="text-xs font-normal border-gray-200">
                Hood System
              </Badge>
            )}
            {listing.refrigeration && (
              <Badge variant="outline" className="text-xs font-normal border-gray-200">
                Refrigeration
              </Badge>
            )}
            {listing.instant_book && (
              <Badge variant="outline" className="text-xs font-normal border-green-600 text-green-600">
                Instant Book
              </Badge>
            )}
          </div>

          {/* Rating */}
          {listing.review_count > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-900">{listing.average_rating?.toFixed(1)}</span>
              <span className="text-slate-500 text-sm">({listing.review_count})</span>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              {isRental ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">
                    ${listing.daily_price?.toLocaleString() || '0'}
                  </span>
                  <span className="text-slate-500 text-sm">/ day</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">
                    ${listing.sale_price?.toLocaleString() || '0'}
                  </span>
                </div>
              )}
              {isRental && listing.weekly_price && (
                <p className="text-xs text-slate-500">${listing.weekly_price?.toLocaleString()} / week</p>
              )}
            </div>
            <Button 
              className="bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {isRental ? 'Book Now' : 'View'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}