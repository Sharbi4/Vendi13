import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Trash2, MapPin, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import Header from '../components/layout/Header';

const CATEGORY_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  equipment: 'Equipment',
  other: 'Other',
};

export default function SavedListings() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('SavedListings'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: savedListings = [], isLoading } = useQuery({
    queryKey: ['savedListings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.SavedListing.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings-for-saved', savedListings],
    queryFn: async () => {
      if (savedListings.length === 0) return [];
      const listingIds = savedListings.map(s => s.listing_id);
      const allListings = await base44.entities.Listing.list();
      return allListings.filter(l => listingIds.includes(l.id));
    },
    enabled: savedListings.length > 0,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (savedListingId) => {
      await base44.entities.SavedListing.delete(savedListingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedListings']);
      toast.success('Removed from saved');
    },
  });

  const handleUnsave = (savedListingId) => {
    unsaveMutation.mutate(savedListingId);
  };

  if (!isAuthenticated || !user) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#FF5124] rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Saved Listings</h1>
              <p className="text-slate-500">
                {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
            </div>
          ) : savedListings.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No saved listings yet</h3>
                <p className="text-slate-500 mb-6">Start exploring and save your favorite listings</p>
                <Button
                  onClick={() => window.location.href = createPageUrl('SearchResults')}
                  className="bg-[#FF5124] hover:bg-[#e5481f]"
                >
                  Browse Listings
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedListings.map((saved) => {
                const listing = listings.find(l => l.id === saved.listing_id);
                if (!listing) return null;

                const mainImage = listing.media?.[0] || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400';
                const isRental = listing.listing_mode === 'rent';

                return (
                  <Card key={saved.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative">
                      <a href={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
                        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                          <img
                            src={mainImage}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </a>
                      <button
                        onClick={() => handleUnsave(saved.id)}
                        disabled={unsaveMutation.isPending}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <a href={`${createPageUrl('ListingDetail')}?id=${listing.id}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[#FF5124]">
                            {CATEGORY_LABELS[listing.asset_category]}
                          </span>
                          {listing.featured && (
                            <span className="text-xs font-medium text-amber-600">⭐ Featured</span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-[#FF5124] transition-colors">
                          {listing.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          {listing.public_location_label || 'Location TBD'}
                        </div>

                        {listing.review_count > 0 && (
                          <div className="flex items-center gap-1 text-sm mb-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{listing.average_rating?.toFixed(1)}</span>
                            <span className="text-slate-500">({listing.review_count})</span>
                          </div>
                        )}

                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-slate-900">
                            ${isRental ? listing.daily_price?.toLocaleString() : listing.sale_price?.toLocaleString()}
                          </span>
                          <span className="text-sm text-slate-500">
                            {isRental ? '/ day' : ''}
                          </span>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}