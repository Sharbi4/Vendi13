import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, CalendarDays, ChevronDown, Truck, 
  UtensilsCrossed, Building2, Wrench, Package, X, Star, Zap, Sparkles, Loader2, User
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AmenitiesFilter from './AmenitiesFilter';
import SearchRecommendations from './SearchRecommendations';
import { parseNaturalLanguageSearch } from './AISearchParser';
import AutocompleteInput from './AutocompleteInput';
import Fuse from 'fuse.js';

const CATEGORIES = [
  { id: 'food_truck', label: 'Food Trucks', icon: Truck },
  { id: 'food_trailer', label: 'Food Trailers', icon: UtensilsCrossed },
  { id: 'ghost_kitchen', label: 'Ghost Kitchens', icon: Building2 },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'other', label: 'Other', icon: Package },
];

export default function SearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('rent');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [allListings, setAllListings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState('listings'); // 'listings' or 'users'
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [suggestedFilters, setSuggestedFilters] = useState([]);
  const [filters, setFilters] = useState({
    delivery_available: false,
    verified_only: false,
    power_type: null,
    water_hookup: false,
    local_pickup: false,
    delivery_included: false,
    title_verified: false,
    instant_book: false,
    min_rating: 0,
    amenities: [],
    refrigeration: false,
    hood_system: false,
    generator_included: false,
    propane: false,
  });

  useEffect(() => {
    checkAuth();
    loadListings();
    loadUsers();
  }, []);

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

  const loadListings = async () => {
    try {
      const listings = await base44.entities.Listing.filter({ status: 'active' }, '-created_date', 500);
      setAllListings(listings);
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await base44.entities.User.list('-created_date', 500);
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Fuzzy search for users
  const searchUsers = (query) => {
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    const fuse = new Fuse(allUsers, {
      keys: ['full_name', 'email', 'bio', 'city', 'state'],
      threshold: 0.3,
      includeScore: true,
    });

    const results = fuse.search(query);
    setUserSearchResults(results.map(r => r.item).slice(0, 10));
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsParsingAI(true);
    const parsedParams = await parseNaturalLanguageSearch(searchQuery);
    setIsParsingAI(false);

    if (parsedParams) {
      // Apply parsed parameters
      if (parsedParams.mode) setMode(parsedParams.mode);
      if (parsedParams.category) setSelectedCategory(parsedParams.category);
      if (parsedParams.location) setLocation(parsedParams.location);
      if (parsedParams.priceRange) {
        setPriceRange([
          parsedParams.priceRange.min || 0,
          parsedParams.priceRange.max || 10000
        ]);
      }
      if (parsedParams.dateRange) {
        setDateRange({
          from: new Date(parsedParams.dateRange.start),
          to: new Date(parsedParams.dateRange.end)
        });
      }
      if (parsedParams.filters) {
        const newFilters = { ...filters };
        if (parsedParams.filters.delivery !== null) newFilters.delivery_available = parsedParams.filters.delivery;
        if (parsedParams.filters.waterHookup !== null) newFilters.water_hookup = parsedParams.filters.waterHookup;
        if (parsedParams.filters.verified !== null) newFilters.verified_only = parsedParams.filters.verified;
        if (parsedParams.filters.instantBook !== null) newFilters.instant_book = parsedParams.filters.instantBook;
        setFilters(newFilters);
      }

      // Generate suggested filters
      const suggestions = [];
      if (parsedParams.filters?.delivery) suggestions.push('Delivery Available');
      if (parsedParams.filters?.waterHookup) suggestions.push('Water Hookup');
      if (parsedParams.filters?.verified) suggestions.push('Verified');
      if (parsedParams.filters?.instantBook) suggestions.push('Instant Book');
      if (parsedParams.amenities?.length > 0) {
        parsedParams.amenities.forEach(a => suggestions.push(a));
      }
      setSuggestedFilters(suggestions);

      // Auto-search if we have enough info
      if (parsedParams.mode || parsedParams.category || parsedParams.location) {
        setTimeout(() => handleSearch(), 500);
      }
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (selectedCategory) params.set('category', selectedCategory);
    if (location) params.set('location', location);
    if (keywords) params.set('keywords', keywords);
    if (mode === 'rent' && dateRange.from) {
      params.set('start_date', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.set('end_date', format(dateRange.to, 'yyyy-MM-dd'));
    }
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < 10000) params.set('max_price', priceRange[1].toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });

    onClose();
    navigate(`${createPageUrl('SearchResults')}?${params.toString()}`);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setTimeout(() => handleAISearch(), 100);
  };

  const canSearch = mode === 'sale' || (mode === 'rent' && dateRange.from);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-slate-900">Search</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Search Type Tabs */}
          <Tabs value={searchType} onValueChange={setSearchType} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="listings" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF5124] data-[state=active]:shadow-sm font-medium"
              >
                <Package className="w-4 h-4 mr-2" />
                Listings
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF5124] data-[state=active]:shadow-sm font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {searchType === 'users' ? (
            <div className="space-y-4">
              {/* User Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search users by name, email, or location..."
                  className="pl-10 h-12 rounded-xl"
                />
              </div>

              {/* User Results */}
              {userSearchResults.length > 0 && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {userSearchResults.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                      window.location.href = `${createPageUrl('PublicProfile')}?email=${user.email}`;
                      onClose();
                    }}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#FF5124] rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {user.full_name || 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          {user.city && user.state && (
                            <p className="text-xs text-slate-400 mt-1">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {user.city}, {user.state}
                            </p>
                          )}
                        </div>
                        {user.identity_verification_status === 'verified' && (
                          <Badge className="bg-green-100 text-green-800 border-0 flex-shrink-0">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searchQuery.trim() && userSearchResults.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No users found</p>
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Start typing to search for users</p>
                </div>
              )}
            </div>
          ) : (
            <div>
          {/* AI Natural Language Search */}
          <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium">AI-Powered Search</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Try: 'food trucks with AC next week in Austin under $300/day'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                className="flex-1 border-purple-200 focus:border-purple-400"
              />
              <Button
                onClick={handleAISearch}
                disabled={isParsingAI || !searchQuery.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isParsingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
            {suggestedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-600">Applied:</span>
                {suggestedFilters.map((filter, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-700 border-0">
                    {filter}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          {user && (
            <div className="mb-6">
              <SearchRecommendations user={user} onSelectSuggestion={handleSuggestionSelect} />
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or use traditional search</span>
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={setMode} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="rent" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF5124] data-[state=active]:shadow-sm font-medium"
              >
                Rent
              </TabsTrigger>
              <TabsTrigger 
                value="sale" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#FF5124] data-[state=active]:shadow-sm font-medium"
              >
                Buy (For Sale)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Pills */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-slate-700 mb-3 block">What are you looking for?</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                      isSelected 
                        ? 'bg-[#FF5124] text-white border-[#FF5124]' 
                        : 'bg-white text-slate-700 border-gray-200 hover:border-[#FF5124] hover:text-[#FF5124]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Keywords (Optional)</Label>
            <AutocompleteInput
              value={keywords}
              onChange={setKeywords}
              allListings={allListings}
              placeholder="Search by make, model, features..."
              icon={Search}
              type="keyword"
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Where</Label>
            <AutocompleteInput
              value={location}
              onChange={setLocation}
              allListings={allListings}
              placeholder="City, State, or ZIP code"
              icon={MapPin}
              type="location"
            />
          </div>

          {/* Date Range - Only for Rent */}
          {mode === 'rent' && (
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">When</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 h-12 rounded-xl border border-gray-200 hover:border-[#FF5124] transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-gray-400" />
                      <span className={dateRange.from ? 'text-slate-900' : 'text-gray-500'}>
                        {dateRange.from ? (
                          dateRange.to 
                            ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                            : format(dateRange.from, 'MMM d, yyyy')
                        ) : 'Select dates'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date()}
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>
              {mode === 'rent' && !dateRange.from && (
                <p className="text-xs text-amber-600 mt-2">Choose dates to see what's available</p>
              )}
            </div>
          )}

          {/* Price Range - For Sale */}
          {mode === 'sale' && (
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Price Range</Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000}
                  step={1000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}+</span>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm font-medium text-[#FF5124] hover:text-[#e5481f] mb-4"
          >
          {showFilters ? 'Hide filters' : 'More filters'}
          </button>

          {/* Advanced Filters */}
          {showFilters && (
          <div className="space-y-6 pt-4 border-t border-gray-100 max-h-[60vh] overflow-y-auto">
          {/* Instant Book */}
          {mode === 'rent' && (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <div>
                  <Label className="text-sm font-medium text-slate-900">Instant Book</Label>
                  <p id="instant-book-desc" className="text-xs text-slate-500">Book instantly without waiting for approval</p>
                </div>
              </div>
              <Switch
                checked={filters.instant_book}
                onCheckedChange={(v) => setFilters(prev => ({ ...prev, instant_book: v }))}
                aria-label="Enable instant book filter"
                aria-describedby="instant-book-desc"
              />
            </div>
          )}

          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Minimum Rating
            </Label>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label
                  key={rating}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    filters.min_rating === rating
                      ? 'border-[#FF5124] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.min_rating === rating}
                    onChange={() => setFilters(prev => ({ ...prev, min_rating: rating }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-1">
                    {rating === 0 ? (
                      <span className="text-sm font-medium text-slate-700">Any rating</span>
                    ) : (
                      <>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-900">{rating}+</span>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <AmenitiesFilter
            selected={filters.amenities}
            onChange={(amenities) => setFilters(prev => ({ ...prev, amenities }))}
          />

          <Separator />

          {/* Equipment & Features */}
          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">Equipment & Features</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Refrigeration</Label>
                  <p className="text-xs text-slate-500">Has refrigeration system</p>
                </div>
                <Switch
                  checked={filters.refrigeration}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, refrigeration: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Hood System</Label>
                  <p className="text-xs text-slate-500">Has ventilation hood</p>
                </div>
                <Switch
                  checked={filters.hood_system}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, hood_system: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Generator</Label>
                  <p className="text-xs text-slate-500">Includes generator</p>
                </div>
                <Switch
                  checked={filters.generator_included}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, generator_included: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Propane</Label>
                  <p className="text-xs text-slate-500">Propane hookup available</p>
                </div>
                <Switch
                  checked={filters.propane}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, propane: v }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Mode-specific filters */}
          {mode === 'rent' ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Delivery available</Label>
                  <p id="delivery-desc" className="text-xs text-slate-500">Can be delivered to your location</p>
                </div>
                <Switch
                  checked={filters.delivery_available}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, delivery_available: v }))}
                  aria-label="Delivery available filter"
                  aria-describedby="delivery-desc"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Water hookup</Label>
                  <p id="water-hookup-desc" className="text-xs text-slate-500">Has water connection</p>
                </div>
                <Switch
                  checked={filters.water_hookup}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, water_hookup: v }))}
                  aria-label="Water hookup filter"
                  aria-describedby="water-hookup-desc"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Verified hosts only</Label>
                  <p id="verified-desc" className="text-xs text-slate-500">Show only verified listings</p>
                </div>
                <Switch
                  checked={filters.verified_only}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, verified_only: v }))}
                  aria-label="Verified hosts only filter"
                  aria-describedby="verified-desc"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Local pickup</Label>
                  <p id="local-pickup-desc" className="text-xs text-slate-500">Available for pickup</p>
                </div>
                <Switch
                  checked={filters.local_pickup}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, local_pickup: v }))}
                  aria-label="Local pickup filter"
                  aria-describedby="local-pickup-desc"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Delivery included</Label>
                  <p id="delivery-included-desc" className="text-xs text-slate-500">Free delivery included</p>
                </div>
                <Switch
                  checked={filters.delivery_included}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, delivery_included: v }))}
                  aria-label="Delivery included filter"
                  aria-describedby="delivery-included-desc"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">Title verified</Label>
                  <p id="title-verified-desc" className="text-xs text-slate-500">Verified ownership documents</p>
                </div>
                <Switch
                  checked={filters.title_verified}
                  onCheckedChange={(v) => setFilters(prev => ({ ...prev, title_verified: v }))}
                  aria-label="Title verified filter"
                  aria-describedby="title-verified-desc"
                />
              </div>
            </>
          )}
          </div>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={mode === 'rent' && !dateRange.from}
            className="w-full mt-6 h-12 bg-[#FF5124] hover:bg-[#e5481f] text-white rounded-xl font-medium text-base disabled:opacity-50"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}