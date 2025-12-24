import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  SlidersHorizontal, MapPin, Calendar, X, Loader2, Star, Zap, ArrowUpDown, Map, Grid3x3, Search
} from 'lucide-react';
import ListingCardSkeleton from '../components/listings/ListingCardSkeleton';
import { format } from 'date-fns';
import Header from '../components/layout/Header';
import ListingCard from '../components/listings/ListingCard';
import CategoryPills from '../components/listings/CategoryPills';
import FilterDrawer from '../components/listings/FilterDrawer';
import SearchModal from '../components/search/SearchModal';
import { SaveSearchButton } from '../components/search/SavedSearches';
import MapView from '../components/listings/MapView';
import AutocompleteInput from '../components/search/AutocompleteInput';
import { performEnhancedSearch } from '../components/search/EnhancedSearchEngine';

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const [mode, setMode] = useState(urlParams.get('mode') || 'rent');
  const [category, setCategory] = useState(urlParams.get('category') || null);
  const [location, setLocation] = useState(urlParams.get('location') || '');
  const [keywords, setKeywords] = useState(urlParams.get('keywords') || '');
  const [startDate, setStartDate] = useState(urlParams.get('start_date') || null);
  const [endDate, setEndDate] = useState(urlParams.get('end_date') || null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortBy, setSortBy] = useState(urlParams.get('sort') || 'relevance');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: parseInt(urlParams.get('min_price')) || 0,
    maxPrice: parseInt(urlParams.get('max_price')) || (mode === 'rent' ? 1000 : 200000),
    startDate: urlParams.get('start_date') || null,
    endDate: urlParams.get('end_date') || null,
    delivery_available: urlParams.get('delivery_available') === 'true',
    water_hookup: urlParams.get('water_hookup') === 'true',
    verified_only: urlParams.get('verified_only') === 'true',
    power_type: urlParams.get('power_type') || null,
    local_pickup: urlParams.get('local_pickup') === 'true',
    delivery_included: urlParams.get('delivery_included') === 'true',
    title_verified: urlParams.get('title_verified') === 'true',
    condition: urlParams.get('condition') || null,
    instant_book: urlParams.get('instant_book') === 'true',
    min_rating: parseFloat(urlParams.get('min_rating')) || 0,
    amenities: urlParams.get('amenities') ? urlParams.get('amenities').split(',') : [],
  });
  const [mapVisibleListings, setMapVisibleListings] = useState([]);

  // Update URL when filters change
  useEffect(() => {
    const loadUser = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Track first search
        if (!userData.onboarding_steps?.first_search_performed) {
          await base44.auth.updateMe({
            onboarding_steps: {
              ...(userData.onboarding_steps || {}),
              first_search_performed: true,
            },
          });
        }
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (keywords) params.set('keywords', keywords);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 0) params.set(key, value.toString());
    });

    window.history.replaceState({}, '', `?${params.toString()}`);
  }, [mode, category, location, keywords, startDate, endDate, filters, sortBy]);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings', mode, category, location, keywords, filters, sortBy],
    queryFn: async () => {
      // Fetch all active listings for the mode
      const allListings = await base44.entities.Listing.filter(
        { status: 'active', listing_mode: mode }, 
        '-created_date', 
        500
      );
      
      // Use enhanced search engine with fuzzy matching and ranking
      let searchResults = performEnhancedSearch(allListings, {
        keywords,
        location,
        mode,
        category,
        filters,
        sortBy
      });

      // Apply date availability filter for rentals
      if (mode === 'rent' && (filters.startDate || filters.endDate)) {
        searchResults = searchResults.filter(listing => {
          const blockedDates = listing.blocked_dates || [];
          
          if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            
            // Check if any blocked date falls within the requested range
            const hasConflict = blockedDates.some(blockedDate => {
              const blocked = new Date(blockedDate);
              return blocked >= start && blocked <= end;
            });
            
            return !hasConflict;
          }
          
          return true;
        });
      }

      return searchResults;
    },
  });

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setFilters({
      ...filters,
      minPrice: 0,
      maxPrice: newMode === 'rent' ? 1000 : 200000,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: mode === 'rent' ? 1000 : 200000,
      delivery_available: false,
      water_hookup: false,
      verified_only: false,
      power_type: null,
      local_pickup: false,
      delivery_included: false,
      title_verified: false,
      condition: null,
      instant_book: false,
      min_rating: 0,
      amenities: [],
    });
    setCategory(null);
  };

  const getCurrentSearchParams = () => {
    return {
      mode,
      category,
      location,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 0 && v !== (mode === 'rent' ? 1000 : 200000)).length;

  const getResultsSummary = () => {
    let summary = mode === 'rent' ? 'Rent' : 'For Sale';
    
    const categoryLabel = {
      food_truck: 'Food Trucks',
      food_trailer: 'Food Trailers',
      ghost_kitchen: 'Ghost Kitchens',
      vendor_lot: 'Vendor Lots',
      equipment: 'Equipment',
      other: 'Other Assets',
    };
    
    if (category) {
      summary += ` – ${categoryLabel[category]}`;
    }
    
    if (location) {
      summary += ` near ${location}`;
    }
    
    if (mode === 'rent' && startDate && endDate) {
      summary += ` – ${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`;
    }
    
    if (mode === 'sale' && (filters.minPrice > 0 || filters.maxPrice < 200000)) {
      summary += ` – $${filters.minPrice.toLocaleString()}–$${filters.maxPrice.toLocaleString()}`;
    }

    return summary;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 md:pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Results Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  {getResultsSummary()}
                </h1>
                <p className="text-slate-500">
                  {viewMode === 'map' ? mapVisibleListings.length : listings.length} {(viewMode === 'map' ? mapVisibleListings.length : listings.length) === 1 ? 'listing' : 'listings'} found
                  {filters.startDate && filters.endDate && (
                    <span className="ml-2 text-sm text-[#FF5124]">
                      • Available {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <SaveSearchButton 
                searchParams={getCurrentSearchParams()}
                searchName={getResultsSummary()}
              />
            </div>
            
            {/* Keyword Search Bar */}
            <div className="max-w-2xl">
              <AutocompleteInput
                value={keywords}
                onChange={setKeywords}
                allListings={listings}
                placeholder="Search by keywords, make, model, or features..."
                icon={Search}
                type="keyword"
              />
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={handleModeChange} className="mb-4">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
              <TabsTrigger 
                value="rent" 
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white font-medium px-6"
              >
                Rent
              </TabsTrigger>
              <TabsTrigger 
                value="sale" 
                className="rounded-lg data-[state=active]:bg-[#FF5124] data-[state=active]:text-white font-medium px-6"
              >
                Buy (For Sale)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Pills */}
          <div className="mb-4">
            <CategoryPills selected={category} onChange={setCategory} />
          </div>

          {/* Filter and Sort Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 mr-2 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'grid' ? 'bg-[#FF5124] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Switch to grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="sr-only">Grid view</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === 'map' ? 'bg-[#FF5124] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Switch to map view"
                  aria-pressed={viewMode === 'map'}
                >
                  <Map className="w-4 h-4" />
                  <span className="sr-only">Map view</span>
                </button>
              </div>
              {/* Date Filter (Rent only) */}
            {mode === 'rent' && (
              <Button
                variant="outline"
                onClick={() => setShowSearchModal(true)}
                className={`rounded-full flex-shrink-0 ${startDate ? 'border-[#FF5124] text-[#FF5124]' : ''}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {startDate && endDate 
                  ? `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`
                  : 'Dates'
                }
              </Button>
            )}

            {/* Quick Toggle Filters */}
            {mode === 'rent' && (
              <Button
                variant={filters.instant_book ? 'default' : 'outline'}
                onClick={() => setFilters(prev => ({ ...prev, instant_book: !prev.instant_book }))}
                className={`rounded-full flex-shrink-0 ${filters.instant_book ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
              >
                <Zap className="w-4 h-4 mr-1" />
                Instant Book
              </Button>
            )}
            
            {filters.min_rating > 0 && (
              <Button
                variant="default"
                onClick={() => setFilters(prev => ({ ...prev, min_rating: 0 }))}
                className="rounded-full flex-shrink-0 bg-[#FF5124] hover:bg-[#e5481f]"
              >
                <Star className="w-4 h-4 mr-1 fill-white" />
                {filters.min_rating}+ Rating
              </Button>
            )}
            
            {mode === 'rent' ? (
              <>
                <Button
                  variant={filters.delivery_available ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, delivery_available: !prev.delivery_available }))}
                  className={`rounded-full flex-shrink-0 ${filters.delivery_available ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
                >
                  Delivery
                </Button>
                <Button
                  variant={filters.verified_only ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, verified_only: !prev.verified_only }))}
                  className={`rounded-full flex-shrink-0 ${filters.verified_only ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
                >
                  Verified
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={filters.local_pickup ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, local_pickup: !prev.local_pickup }))}
                  className={`rounded-full flex-shrink-0 ${filters.local_pickup ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
                >
                  Local Pickup
                </Button>
                <Button
                  variant={filters.delivery_included ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, delivery_included: !prev.delivery_included }))}
                  className={`rounded-full flex-shrink-0 ${filters.delivery_included ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
                >
                  Delivery Included
                </Button>
                <Button
                  variant={filters.title_verified ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, title_verified: !prev.title_verified }))}
                  className={`rounded-full flex-shrink-0 ${filters.title_verified ? 'bg-[#FF5124] hover:bg-[#e5481f]' : ''}`}
                >
                  Title Verified
                </Button>
              </>
            )}

            {/* More Filters */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="rounded-full flex-shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              More Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-[#FF5124] text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

              {/* Reset */}
              {(category || activeFiltersCount > 0) && (
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="rounded-full flex-shrink-0 text-slate-500"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-full border-gray-300 w-[180px] flex-shrink-0">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="quality">Best Quality</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Grid or Map */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, idx) => (
                  <div
                    key={listing.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            ) : (
              <MapView 
                listings={listings} 
                mode={mode} 
                onBoundsChange={setMapVisibleListings}
              />
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
              <p className="text-slate-500 mb-6">
                No listings match your filters. Try expanding your location or clearing filters.
              </p>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="rounded-full"
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <FilterDrawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        mode={mode}
        onApply={() => setShowFilters(false)}
        onReset={handleResetFilters}
      />

      <SearchModal open={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </div>
  );
}